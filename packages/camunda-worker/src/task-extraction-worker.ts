/**
 * 旧平台任务提取 Worker
 * 从第三方旧平台提取任务到本地数据库
 */

import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import { ExtractedTask, ExtractedEquipment } from './lib/task-repository';
import { syncTaskToCore, syncEquipment } from './lib/task-sync-service';
import { mapBusinessType } from './lib/constants';
import { syncUnitFromOldPlatform } from './lib/unit-sync-service';
import prisma from './lib/prisma';
import { DEFAULT_UNIT_ID } from './lib/constants';

// 加载环境变量
const envPath = path.join(__dirname, '../.env.local');
if (require('fs').existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
} else {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

// Next.js 通知 API 配置
const NEXTJS_API = {
    baseUrl: process.env.NEXTJS_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
};

// 第三方 API 配置
const OLD_PLATFORM_API = {
    baseUrl: process.env.OLD_PLATFORM_API_URL || 'https://36.212.134.165:10443/prod-api',
    timeout: 30000,
};

// Token 缓存
let tokenCache: {
    accessToken: string;
    briefToken: string;
    expiresAt: number;
} | null = null;

// 第三方登录配置
interface ThirdPartyAuthConfig {
    baseUrl: string;
    username: string;
    password: string;
    userType: string;
    loginType: string;
    userUuid: string;
}


function getAuthConfig(): ThirdPartyAuthConfig {
    return {
        baseUrl: process.env.THIRD_PARTY_API_URL || 'https://36.212.134.165:10443/prod-api',
        username: process.env.THIRD_PARTY_USERNAME || '',
        password: process.env.THIRD_PARTY_PASSWORD || '',
        userType: process.env.THIRD_PARTY_USER_TYPE || '10',
        loginType: process.env.THIRD_PARTY_LOGIN_TYPE || '1',
        userUuid: process.env.THIRD_PARTY_USER_UUID || '',
    };
}

// 默认单位ID
// const DEFAULT_UNIT_ID = '2738188573441261569';

/**

 * 根据 groupId 查找或创建 Task 实体
 * 一个 group 对应一个 Task，组内的多个 detail 都关联到这个 Task
 */
async function findOrCreateTaskForGroup(
    groupId: string,
    firstTaskData: ExtractedTask
): Promise<bigint> {
    // 先查找是否已存在该 groupId 的 Task； 根据旧平台 视图方式聚合产生的 groupId标签来匹配了。
    const existingTask = await prisma.task.findFirst({
        where: { oldTaskTag: groupId },
        select: { id: true },
    });

    // 根据 projUserId (authName) 查询用户ID
    let liablerId: bigint | null = null;
    if (firstTaskData.projUserId) {
        const projUserIdValue = Array.isArray(firstTaskData.projUserId)
            ? String(firstTaskData.projUserId[0])
            : String(firstTaskData.projUserId);

        const user = await prisma.uSERS.findFirst({
            where: { authName: projUserIdValue },
            select: { id: true },
        });
        if (user) {
            liablerId = user.id;
            console.log(`[TaskExtraction] Found user ${user.id} for authName ${projUserIdValue}`);
        } else {
            console.warn(`[TaskExtraction] User not found for authName ${projUserIdValue}`);
        }
    }

    if (!liablerId) {
        throw new Error(`No responsible user found for projUserId ${firstTaskData.projUserId || '<missing>'}. Task cannot be created without a liabler.`);
    }

    // 同步单位信息
    let unitId: bigint;
    if (firstTaskData.useUntId) {
        const accessToken = await getAccessToken();
        unitId = await syncUnitFromOldPlatform(firstTaskData.useUntId, accessToken);
        console.log(`[TaskExtraction] Synced unit ${unitId} for task group ${groupId}`);
    } else {
        throw new Error(`useUntId is required for task creation. Task cannot be created without a unit.`);
    }
    
    // 根据旧平台状态映射到新平台状态
    // taskAlloSta: 0=部门分配, 1=科室分配, 2=责任人派工, 3=分配派工完成
    // taskSta: 0=未派工, 1=已派工, 2=等待复检, 3=等待整改反馈, 4=已完成, 5=作废
    function mapTaskStatus(taskAlloSta?: number, taskSta?: number): number {
        // 作废任务
        if (taskSta === 5) {
            return 7; // CANCEL
        }
        
        // 已完成
        if (taskSta === 4 && taskAlloSta === 3) {
            return 6; // DONE
        }
        
        // 等待整改反馈/等待复检 (挂起状态)
        if (taskSta === 2 || taskSta === 3) {
            return 5; // HANGUP
        }
        
        // 已派工
        if (taskSta === 1) {
            return 4; // DISP
        }
        
        // 未派工状态，根据分配阶段判断
        if (taskSta === 0 || taskSta === undefined) {
            switch (taskAlloSta) {
                case 0: // 部门分配阶段
                    return 1; // DEPART - 部门已指定，等待科室分配
                case 1: // 科室分配阶段
                    return 2; // OFFICE - 科室已指定，等待人员分配
                case 2: // 责任人派工阶段
                    return 3; // PERSON - 责任人已确定，等待派工
                default:
                    return 0; // INIT - 初始状态
            }
        }
        
        return 0; // 默认初始状态
    }

    const mappedStatus = mapTaskStatus(
        firstTaskData.taskAlloSta !== undefined ? Number(firstTaskData.taskAlloSta) : undefined,
        firstTaskData.taskSta !== undefined ? Number(firstTaskData.taskSta) : undefined
    );
    
    console.log(`[TaskExtraction] Status mapping: taskAlloSta=${firstTaskData.taskAlloSta}, taskSta=${firstTaskData.taskSta} -> status=${mappedStatus}`);

    // 准备任务数据
    const taskData = {
        bsType: mapBusinessType(firstTaskData.opeType !== undefined ? Number(firstTaskData.opeType) : 0),
        date: firstTaskData.taskDate ? new Date(firstTaskData.taskDate) : new Date(),
        entrust: firstTaskData.busiType === '2',
        feeOk: false,
        ispu_id: BigInt(DEFAULT_UNIT_ID),
        liabler_id: liablerId,
        oldTaskTag: groupId,
        status: mappedStatus,
        servu_id: unitId,
    };

    if (existingTask) {
        // 更新已存在的 Task
        console.log(`[TaskExtraction] Updating existing Task ${existingTask.id} for group ${groupId}`);
        const updatedTask = await prisma.task.update({
            where: { id: existingTask.id },
            data: taskData as any,
        });
        console.log(`[TaskExtraction] Updated Task ${updatedTask.id} for group ${groupId}`);
        return updatedTask.id;
    }

    // 创建新 Task
    const newTask = await prisma.task.create({
        data: taskData as any,
    });

    console.log(`[TaskExtraction] Created Task ${newTask.id} for group ${groupId}`);
    return newTask.id;
}

// 使用 https 模块发送登录请求
async function loginToThirdParty(): Promise<{ access_token: string; brief_token: string; expires_in: number }> {
    const authConfig = getAuthConfig();
    
    if (!authConfig.username || !authConfig.password || !authConfig.userUuid) {
        throw new Error('Third-party auth configuration missing. Please set THIRD_PARTY_USERNAME, THIRD_PARTY_PASSWORD, and THIRD_PARTY_USER_UUID');
    }

    const loginData = {
        containerId: '',
        digCertSign: '',
        loginType: authConfig.loginType,
        password: authConfig.password,
        userType: authConfig.userType,
        username: authConfig.username,
        uuid: authConfig.userUuid,
    };

    const postData = JSON.stringify(loginData);
    const timestamp = Date.now();
    const url = new URL(`${authConfig.baseUrl}/auth/login?time=${timestamp}`);

    return new Promise((resolve, reject) => {
        const options: https.RequestOptions = {
            hostname: url.hostname,
            port: url.port || 443,
            path: `${url.pathname}${url.search}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Origin': authConfig.baseUrl,
                'Referer': `${authConfig.baseUrl}/`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            rejectUnauthorized: false,
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.code !== 200 || !result.data) {
                        reject(new Error(`Login failed: ${result.msg || 'Unknown error'}`));
                    } else {
                        resolve(result.data);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e}`));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 获取有效的 access_token（带缓存）
async function getAccessToken(): Promise<string> {
    // 检查缓存的 token 是否有效（预留 60 秒缓冲）
    if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
        console.log('[TaskExtraction] Using cached access token');
        return tokenCache.accessToken;
    }

    // Token 已过期或不存在，重新登录
    console.log('[TaskExtraction] Fetching new access token...');
    const loginResult = await loginToThirdParty();
    
    tokenCache = {
        accessToken: loginResult.access_token,
        briefToken: loginResult.brief_token,
        expiresAt: Date.now() + loginResult.expires_in * 1000 * 60, // expires_in 是分钟
    };
    
    console.log('[TaskExtraction] New access token cached');
    return loginResult.access_token;
}

// 使用 https 模块发送请求（支持自签名证书）
function httpsGetJson(url: string, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: `${parsedUrl.pathname}${parsedUrl.search}`,
            method: 'GET',
            headers: {
                ...headers,
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            rejectUnauthorized: false, // 允许自签名证书
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// 从旧平台获取任务详情
async function fetchTaskDetail(taskId: string, accessToken: string): Promise<any> {
    const timestamp = Date.now();
    const url = `${OLD_PLATFORM_API.baseUrl}/busimge/task/${taskId}?time=${timestamp}`;
    
    console.log(`[TaskExtraction] Fetching task detail: ${taskId}`);
    //'https://36.212.134.165:10443/prod-api/busimge/task/1602847-1602848?time=1776920812584'
    const result = await httpsGetJson(url, {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    });
    
    if (result.code !== 200) {
        throw new Error(`API error: ${result.msg || 'Unknown error'}`);
    }
    
    return Array.isArray(result.data) ? result.data[0] : result.data;
}

// 从旧平台获取设备台账详情
async function fetchEquipmentDetail(eqpCod: string, accessToken: string): Promise<any> {
    const timestamp = Date.now();
    //java后端却是用 /"prod-api/busimge/eqp/"+eqpid 接口去获取的；
    const url = `${OLD_PLATFORM_API.baseUrl}/busimge/eqp/getByEqpCod/${eqpCod}?curMenuId=10001829&curMenuName=%E8%AE%BE%E5%A4%87%E6%83%85%E5%86%B5%E6%9F%A5%E8%AF%A2&time=${timestamp}`;
    
    console.log(`[TaskExtraction] Fetching equipment detail: ${eqpCod}`);
    
    const result = await httpsGetJson(url, {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    });
    
    if (result.code !== 200) {
        throw new Error(`Equipment API error: ${result.msg || 'Unknown error'}`);
    }
    
    return result.data;
}



// 转换并保存任务到本地数据库（核心业务表同步）
async function saveTaskToLocal(
    taskData: any, 
    accessToken: string,
    groupId: string,
    existingTaskId?: bigint
): Promise<{ success: boolean; taskId: string; error?: string }> {
    const taskId = taskData.id || taskData.taskId;
    
    if (!taskId || taskId.trim() === '') {
        throw new Error('Task ID is required and cannot be empty');
    }
    
    try {
        console.log(`[TaskExtraction] Processing task data: ${taskId}`);
        
        // 第一步：从 taskData 提取任务字段
        const taskFields: ExtractedTask = {
            taskId: taskData.id || taskData.taskId,
            taskDate: taskData.taskDate,
            eqpCod: taskData.eqpCod,
            oidno: taskData.oidno,
            opeType: taskData.opeType,
            repType: taskData.repType,
            busiType: taskData.busiType,
            taskSta: taskData.taskSta,
            taskAlloSta: taskData.taskAlloSta,
            projUserId: taskData.projUserId,
            jyMen: taskData.jyMen,
            applyCod: taskData.applyCod,
            reportCod: taskData.reportCod,
            ispId: taskData.ispId,
            eqpType: taskData.eqpType,
            eqpSort: taskData.eqpSort,
            eqpVart: taskData.eqpVart,
            subEqpVart: taskData.subEqpVart,
            taskDatabase: taskData.taskDatabase,
            eqpInnerCod: taskData.eqpInnerCod,
            factoryCod: taskData.factoryCod,
        };
        
        console.log(`[TaskExtraction] Extracted task fields:`, {
            taskId: taskFields.taskId,
            eqpCod: taskFields.eqpCod,
            oidno: taskFields.oidno,
        });
        
        // 第二步：获取设备台账数据（仅 taskDatabase=1 且 eqpCod 有有效值时才需要）
        const taskDatabase = taskData.taskDatabase;
        let equipmentData: ExtractedEquipment | null = null;
        if (taskDatabase === '1' && taskFields.eqpCod && taskFields.eqpCod.trim() !== '') {
            try {
                const rawEquipmentData = await fetchEquipmentDetail(taskFields.eqpCod, accessToken);
                console.log(`[TaskExtraction] Equipment data fetched for ${taskFields.eqpCod}`);
                
                // 转换设备数据
                equipmentData = {
                    ...rawEquipmentData,
                    techParam: rawEquipmentData.techParam,
                };
            } catch (eqpError: any) {
                console.warn(`[TaskExtraction] Failed to fetch equipment detail for ${taskFields.eqpCod}:`, eqpError.message);
                // 设备获取失败不影响任务保存，继续处理
            }
        }
        
        // 第三步(提前): 先同步设备参数到 Eqp 表
        // 这样 syncTaskToCore 就不需要再处理设备参数转换保存
        let preSyncedEqpId: bigint | undefined;
        if (equipmentData && taskFields.eqpCod && taskFields.eqpCod.trim() !== '') {
            try {
                preSyncedEqpId = await prisma.$transaction(async (tx) => {
                    // regUntId 的解析在 syncEquipment 内部自动完成
                    return await syncEquipment(tx, taskFields, equipmentData, accessToken);
                });
                console.log(`[TaskExtraction] Equipment pre-synced with eqpId: ${preSyncedEqpId}`);
            } catch (eqpSyncError: any) {
                console.warn(`[TaskExtraction] Equipment pre-sync failed:`, eqpSyncError.message);
                // 设备同步失败不影响主流程，syncTaskToCore 会回退到内部同步
            }
        }
        
        // 第四步：同步到核心业务表（Isp -> Detail -> Task），跳过设备同步
        console.log(`[TaskExtraction] Syncing to core business tables...`);
        const syncResult = await syncTaskToCore(taskFields, equipmentData, groupId, existingTaskId, preSyncedEqpId, accessToken);
        
        if (!syncResult.success) {
            console.error(`[TaskExtraction] Core sync failed for task ${taskId}:`, syncResult.error);
            return { success: false, taskId, error: syncResult.error };
        }
                
        console.log(`[TaskExtraction] Task synced to core tables: ${taskId}, eqpId: ${syncResult.eqpId}, ispId: ${syncResult.ispId}`);
        return { success: true, taskId };
        
    } catch (error: any) {
        console.error(`[TaskExtraction] Failed to save task ${taskId}:`, error);
        return { success: false, taskId, error: error.message };
    }
}

// 通知 Next.js 前端任务进度/完成
async function notifyNextJs(
    userId: string,
    type: 'progress' | 'completed' | 'failed',
    data: any,
    processInstanceKey?: string
): Promise<void> {
    try {
        const notifyUrl = `${NEXTJS_API.baseUrl}/task-extraction/notify`;

        const body: any = {
            userId,                    // 使用用户ID作为路由键
            processInstanceKey,        // 保留流程实例Key用于参考
            type,
            timestamp: new Date().toISOString(),
        };

        if (type === 'progress') {
            body.progress = data;
        } else if (type === 'completed') {
            body.result = data;
        } else if (type === 'failed') {
            body.error = data.error;
            body.result = data;
        }

        const response = await fetch(notifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.warn(`[TaskExtraction] Failed to notify Next.js: ${response.status}`);
        } else {
            console.log(`[TaskExtraction] Notified Next.js: ${type} for user ${userId}`);
        }
    } catch (error) {
        console.error(`[TaskExtraction] Error notifying Next.js:`, error);
    }
}

// 主任务处理函数, job类型定义来自camunda API;
export async function extractTaskFromOldPlatform(job: any) {
    const { userId, taskGroups } = job.variables;
    const processInstanceKey= job.processInstanceKey;
    
    // taskGroups 格式: [{ groupId: string, taskIds: string[] }]
    const groups: Array<{ groupId: string; taskIds: string[] }> = taskGroups || [];
    
    // 计算总任务数
    const totalTasks = groups.reduce((sum, group) => sum + (group.taskIds?.length || 0), 0);
    
    console.log(`[TaskExtraction] Starting extraction for ${groups.length} groups, ${totalTasks} total tasks`);
    console.log(`[TaskExtraction] ProcessInstanceKey: ${processInstanceKey}, UserId: ${userId}`);
    
    // 使用 userId 作为通知路由键，如果没有则使用 processInstanceKey 作为后备
    const notifyTargetUser = userId || processInstanceKey;
    
    // 获取 Admin-Token（服务器端自动获取，不需要从流程变量传递）
    let accessToken: string;
    try {
        accessToken = await getAccessToken();
        console.log('[TaskExtraction] Admin-Token obtained successfully');
    } catch (error: any) {
        console.error('[TaskExtraction] Failed to get Admin-Token:', error.message);
        throw new Error(`Failed to get Admin-Token: ${error.message}`);
    }
    
    const results = {
        total: totalTasks,
        success: 0,
        failed: 0,
        details: [] as { taskId: string; groupId: string; success: boolean; error?: string }[],
    };
    
    let processedCount = 0;
    
    try {
        // 按组处理任务
        for (const group of groups) {
            const groupId = group.groupId;
            const groupTaskIds = group.taskIds || [];
            
            console.log(`[TaskExtraction] Processing group ${groupId} with ${groupTaskIds.length} tasks`);
            
            // 用于保存该组的 Task ID（在组内第一个任务获取后创建）
            let groupTaskId: bigint | undefined;
            
            // 逐个处理组内的任务
            for (let i = 0; i < groupTaskIds.length; i++) {
                const taskId = groupTaskIds[i];
                processedCount++;
                
                console.log(`[TaskExtraction] Processing task ${processedCount}/${totalTasks} (group: ${groupId}, index: ${i + 1}/${groupTaskIds.length}): ${taskId}`);
                
                try {
                    // 1. 从旧平台获取任务详情
                    const taskDetail = await fetchTaskDetail(taskId, accessToken);
                    
                    // 2. 如果是组内第一个任务，先创建 Task 实体
                    if (i === 0 && !groupTaskId) {
                        const firstTaskFields: ExtractedTask = {
                            taskId: taskDetail.id || taskDetail.taskId,
                            taskDate: taskDetail.taskDate,
                            eqpCod: taskDetail.eqpCod,
                            oidno: taskDetail.oidno,
                            opeType: taskDetail.opeType,
                            repType: taskDetail.repType,
                            busiType: taskDetail.busiType,
                            taskSta: taskDetail.taskSta,
                            taskAlloSta: taskDetail.taskAlloSta,
                            projUserId: taskDetail.projUserId,
                            jyMen: taskDetail.jyMen,
                            applyCod: taskDetail.applyCod,
                            reportCod: taskDetail.reportCod,
                            ispId: taskDetail.ispId,
                            eqpType: taskDetail.eqpType,
                            eqpSort: taskDetail.eqpSort,
                            eqpVart: taskDetail.eqpVart,
                            subEqpVart: taskDetail.subEqpVart,
                            useUntId: taskDetail.useUntId,
                        };
                        groupTaskId = await findOrCreateTaskForGroup(groupId, firstTaskFields);
                    }
                    
                    // 3. 转换并保存到本地数据库（传入已创建的 Task ID 用于关联）
                    const saveResult = await saveTaskToLocal(taskDetail, accessToken, groupId, groupTaskId);
                    
                    if (saveResult.success) {
                        results.success++;
                    } else {
                        results.failed++;
                    }
                    
                    results.details.push({ ...saveResult, groupId });
                    
                } catch (error: any) {
                    console.error(`[TaskExtraction] Failed to process task ${taskId} in group ${groupId}:`, error);
                    results.failed++;
                    results.details.push({ taskId, groupId, success: false, error: error.message });
                }
                
                // 每处理完一个任务，更新进度
                const progress = {
                    current: processedCount,
                    total: totalTasks,
                    percentage: Math.round((processedCount / totalTasks) * 100),
                    currentGroup: groupId,
                    groupProgress: {
                        current: i + 1,
                        total: groupTaskIds.length,
                    },
                };

                // 通知 Next.js 进度更新（按用户ID路由）
                await notifyNextJs(notifyTargetUser, 'progress', progress, processInstanceKey);

                // 短暂暂停，避免请求过快
                if (processedCount < totalTasks) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        // 所有任务处理完成
        const finalResult = {
            success: true,
            completedAt: new Date().toISOString(),
            results,
        };

        // 通知 Next.js 完成（按用户ID路由）
        await notifyNextJs(notifyTargetUser, 'completed', finalResult, processInstanceKey);

        // 完成 Job
        return job.complete(finalResult);

    } catch (error: any) {
        console.error(`[TaskExtraction] Job failed:`, error);

        const errorResult = {
            success: false,
            error: error.message,
            results,
        };

        // 通知 Next.js 失败（按用户ID路由）
        await notifyNextJs(notifyTargetUser, 'failed', errorResult, processInstanceKey);

        return job.fail({
            errorMessage: `Task extraction failed: ${error.message}`,
            retries: 0,
        });
    }
}

// 启动 Worker 的函数
export function startTaskExtractionWorker(camundaClient: any) {
    const worker = camundaClient.createJobWorker({
        jobType: "task-extraction-from-old-platform",
        maxParallelJobs: 3,
        jobTimeoutMs: 30 * 60 * 1000, // 30分钟
        jobHandler: extractTaskFromOldPlatform,
    });
    
    console.log(`[TaskExtraction] Worker started: 从旧平台提取任务到本地`);
    
    return worker;
}
