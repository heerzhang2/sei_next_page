/**
 * 旧平台任务提取 Worker
 * 从第三方旧平台提取任务到本地数据库
 */

import https from 'https';
import dotenv from 'dotenv';
import path from 'path';

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
    
    return result.data;
}

// 转换并保存任务到本地数据库
async function saveTaskToLocal(taskData: any): Promise<{ success: boolean; taskId: string; error?: string }> {
    try {
        // TODO: 调用 Next.js API 或直连数据库保存任务
        // 这里需要实现具体的转换逻辑
        
        console.log(`[TaskExtraction] Saving task: ${taskData.id}`);
        
        // 模拟转换保存
        // 实际实现时，可以：
        // 1. 直接连接数据库保存
        // 2. 调用 Next.js 的 API 端点保存
        // 3. 通过消息队列发送给 Next.js 处理
        
        return { success: true, taskId: taskData.id };
    } catch (error: any) {
        console.error(`[TaskExtraction] Failed to save task:`, error);
        return { success: false, taskId: taskData.id, error: error.message };
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

// 主任务处理函数
export async function extractTaskFromOldPlatform(job: any) {
    const { taskIds, processInstanceKey, userId } = job.variables;
    
    console.log(`[TaskExtraction] Starting extraction for ${taskIds?.length || 0} tasks`);
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
        total: taskIds?.length || 0,
        success: 0,
        failed: 0,
        details: [] as { taskId: string; success: boolean; error?: string }[],
    };
    
    try {
        // 逐个处理任务
        for (let i = 0; i < taskIds.length; i++) {
            const taskId = taskIds[i];
            
            console.log(`[TaskExtraction] Processing task ${i + 1}/${taskIds.length}: ${taskId}`);
            
            try {
                // 1. 从旧平台获取任务详情
                const taskDetail = await fetchTaskDetail(taskId, accessToken);
                
                // 2. 转换并保存到本地
                const saveResult = await saveTaskToLocal(taskDetail);
                
                if (saveResult.success) {
                    results.success++;
                } else {
                    results.failed++;
                }
                
                results.details.push(saveResult);
                
            } catch (error: any) {
                console.error(`[TaskExtraction] Failed to process task ${taskId}:`, error);
                results.failed++;
                results.details.push({ taskId, success: false, error: error.message });
            }
            
            // 每处理完一个任务，更新进度
            const progress = {
                current: i + 1,
                total: taskIds.length,
                percentage: Math.round(((i + 1) / taskIds.length) * 100),
            };

            // 通知 Next.js 进度更新（按用户ID路由）
            await notifyNextJs(notifyTargetUser, 'progress', progress, processInstanceKey);

            // 更新 Camunda Job 进度
            await job.complete({
                progress,
                partialResults: results,
            });

            // 短暂暂停，避免请求过快
            if (i < taskIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
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
