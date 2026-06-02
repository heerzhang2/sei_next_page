/**
 * 从旧平台获取任务列表 API
 * Admin-Token 使用当前登录用户的个人 token（从 uSERS.AUTH_RESPONSE 读取）
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

// 第三方 API 基础配置
export const OLD_PLATFORM_API = {
    baseUrl: 'https://36.212.134.165:10443/prod-api',
    timeout: 30000,
};

// 使用 https 模块发送 GET 请求（支持自签名证书）
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
            rejectUnauthorized: false,
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

// 使用 https 模块发送 POST 请求（支持自签名证书）
function httpsPostJson(url: string, body: Record<string, any>, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const bodyStr = JSON.stringify(body);
        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: `${parsedUrl.pathname}${parsedUrl.search}`,
            method: 'POST',
            headers: {
                ...headers,
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr).toString(),
            },
            rejectUnauthorized: false,
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
        req.write(bodyStr);
        req.end();
    });
}

/**
 * 获取当前登录用户的个人 Admin-Token
 * 从 uSERS.AUTH_RESPONSE 字段读取
 */
async function getAdminToken(): Promise<string | null> {
    try {
        const session = await auth();
        if (session?.user?.name) {
            console.log(`[OldTasksAPI] Looking up personal token for user: ${session.user.name}`);
            const userRecord = await prisma.uSERS.findUnique({
                where: { USERNAME: session.user.name },
                select: { AUTH_RESPONSE: true },
            });
            if (userRecord?.AUTH_RESPONSE) {
                let authData: any;
                if (typeof userRecord.AUTH_RESPONSE === 'string') {
                    authData = JSON.parse(userRecord.AUTH_RESPONSE);
                } else {
                    authData = userRecord.AUTH_RESPONSE;
                }
                if (authData?.access_token) {
                    console.log('[OldTasksAPI] Using personal token from AUTH_RESPONSE');
                    return authData.access_token;
                }
            }
            console.log('[OldTasksAPI] No personal token found for user');
        }
    } catch (error: any) {
        console.warn('[OldTasksAPI] Failed to get personal token:', error.message);
    }
    return null;
}

/**
 * GET /api/task-extraction/old-tasks
 * 从旧平台获取任务列表
 * 
 * 查询参数:
 * - projUserIds: 项目负责人ID (可选，为空时返回部门全部数据)
 * - taskDateStart: 任务日期开始 (默认: 2026-03-01)
 * - taskDateEnd: 任务日期结束 (默认: 2026-05-31)
 * - pageNum: 页码 (默认: 1)
 * - pageSize: 每页数量 (默认: 50)
 * - taskSta: 任务状态过滤，支持多选逗号分隔 (可选)
 * - busiType: 业务类型过滤 (可选)
 * - taskAlloSta: 任务分配状态过滤，单选 (可选)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
         //根据项目用户ID过滤
        const projUserIds =  searchParams.get('projUserIds');
        const taskDateStart = searchParams.get('taskDateStart') || '2026-03-01';
        const taskDateEnd = searchParams.get('taskDateEnd') || '2026-05-31';
        const pageNum = searchParams.get('pageNum') || '1';
        const pageSize = searchParams.get('pageSize') || '50';
        // 过滤参数
        const taskSta = searchParams.get('taskSta') || '';
        const busiType = searchParams.get('busiType') || '';
        const taskAlloSta = searchParams.get('taskAlloSta') || '';
        
        // 获取当前用户的个人 Admin-Token
        const accessToken = await getAdminToken();

        if (!accessToken) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: '无法获取访问令牌。请确保服务器已配置第三方系统登录凭证（THIRD_PARTY_USERNAME, THIRD_PARTY_PASSWORD, THIRD_PARTY_USER_UUID）',
                    code: 'NO_ACCESS_TOKEN'
                },
                { status: 401 }
            );
        }

        const timestamp = Date.now();
        // 构建 URL
        let url = `${OLD_PLATFORM_API.baseUrl}/busimge/task/group/list?` +
            `&pageNum=${pageNum}` +
            `&taskDate%5B0%5D=${taskDateStart}` +
            `&taskDate%5B1%5D=${taskDateEnd}` +
            `&pageSize=${pageSize}` +
            `&curMenuId=10001206` +
            `&time=${timestamp}`;
        if (projUserIds) {
            url += `&projUserIds=${encodeURIComponent(projUserIds)}`;
        }
        
        // 添加过滤参数
        if (taskSta) {
            // 任务状态支持多选，逗号分隔
            url += `&taskSta=${encodeURIComponent(taskSta)}`;
        }
        if (busiType) {
            url += `&busiType=${busiType}`;
        }
        if (taskAlloSta) {
            // 任务分配状态为单选
            url += `&taskAlloSta=${encodeURIComponent(taskAlloSta)}`;
        }

        console.log(`[OldTasksAPI] Fetching tasks for projUserIds: ${projUserIds}`);

        let result = await httpsGetJson(url, {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        });

        // Token 过期时自动刷新并重试
        if (result.code === 401 || result.msg?.includes('登录状态已过期') || result.msg?.includes('token')) {
            console.log('[OldTasksAPI] Token expired, attempting refresh...');
            try {
                const refreshResult = await httpsPostJson(
                    `${OLD_PLATFORM_API.baseUrl}/auth/refresh`,
                    {},
                    { 'Authorization': `Bearer ${accessToken}` }
                );
                console.log('[OldTasksAPI] Refresh response:', refreshResult);

                // 检查刷新是否成功（旧平台即使 LoginUser 为空也返回 R.ok()，但网关拦截会返回 401）
                if (refreshResult.code !== 200) {
                    console.error('[OldTasksAPI] Token refresh rejected (JWT expired), need re-login');
                    return NextResponse.json(
                        { success: false, error: '旧平台登录已过期，请重新登录', code: 'TOKEN_EXPIRED' },
                        { status: 401 }
                    );
                }

                // 更新数据库中的 AUTH_RESPONSE（刷新 savedAt）
                const session = await auth();
                if (session?.user?.name) {
                    const userRecord = await prisma.uSERS.findUnique({
                        where: { USERNAME: session.user.name },
                        select: { id: true, AUTH_RESPONSE: true },
                    });
                    if (userRecord?.AUTH_RESPONSE) {
                        let authData: any;
                        if (typeof userRecord.AUTH_RESPONSE === 'string') {
                            authData = JSON.parse(userRecord.AUTH_RESPONSE);
                        } else {
                            authData = userRecord.AUTH_RESPONSE;
                        }
                        authData.savedAt = new Date().toISOString();
                        await prisma.uSERS.update({
                            where: { id: userRecord.id },
                            data: { AUTH_RESPONSE: JSON.stringify(authData) as any },
                        });
                        console.log('[OldTasksAPI] AUTH_RESPONSE refreshed');
                    }
                }

                // 重试原请求
                result = await httpsGetJson(url, {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                });
                console.log('[OldTasksAPI] Retry result code:', result.code);
            } catch (refreshError: any) {
                console.error('[OldTasksAPI] Token refresh failed:', refreshError.message);
                return NextResponse.json(
                    { success: false, error: '旧平台登录已过期，请重新登录', code: 'TOKEN_EXPIRED' },
                    { status: 401 }
                );
            }
        }

        if (result.code !== 200) {
            return NextResponse.json(
                { success: false, error: result.msg || 'Failed to fetch tasks from old platform' },
                { status: 500 }
            );
        }

        // 简化任务数据，返回必要字段
        const tasks = (result.rows || []).map((task: any) => ({
            // 使用 taskIds 数组生成唯一标识（取前3个ID+哈希，避免过长）
            id: task.taskIds?.length > 0 
                ? (() => {
                    const sortedIds = task.taskIds.sort();
                    const prefix = sortedIds.slice(0, 3).join('-');
                    // 如果超过3个，添加哈希值
                    if (sortedIds.length > 3) {
                        const hash = sortedIds.join(',').split('').reduce((a, b) => {
                            a = ((a << 5) - a) + b.charCodeAt(0);
                            return a & a;
                        }, 0).toString(36).replace('-', 'n');
                        return `${prefix}~${hash}`;
                    }
                    return prefix;
                })()
                : `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            taskName: task.taskName,
            taskNo: task.taskNo,
            taskDate: task.taskDate,
            taskSta: task.taskSta,
            taskStaName: task.taskStaName,
            taskAlloStaName: task.taskAlloStaName,
            busiType: task.busiType,
            busiTypeName: task.busiTypeName,
            opeTypeName: task.opeTypeName,
            repTypeName: task.repTypeName,
            deptName: task.deptName,
            useUntName: task.useUntName,
            mantOrBuildUntName: task.mantOrBuildUntName,
            buildName: task.buildName,
            eqpAreaName: task.eqpAreaName,
            createBy: task.createBy,
            createTime: task.createTime,
            remark: task.remark,
            reIsp: task.reIsp,
            // 子任务统计
            taskCount: task.taskIds?.length || 0,
            taskIds: task.taskIds || [],
        }));

        return NextResponse.json({
            success: true,
            data: {
                tasks,
                total: result.total || 0,
                pageNum: parseInt(pageNum),
                pageSize: parseInt(pageSize),
            },
        });

    } catch (error: any) {
        console.error('[OldTasksAPI] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
