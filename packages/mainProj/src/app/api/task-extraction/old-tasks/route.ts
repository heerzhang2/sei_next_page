/**
 * 从旧平台获取任务列表 API
 * Admin-Token 完全由服务器端管理，支持以下获取方式：
 * 1. 服务器端内存缓存（优先）
 * 2. Cookie 中的 Admin-Token（兼容已有登录）
 * 3. 服务器端自动登录获取（使用环境变量配置）
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { getAccessToken } from '@/lib/third-party/auth';

// 第三方 API 基础配置
const OLD_PLATFORM_API = {
    baseUrl: 'https://36.212.134.165:10443/prod-api',
    timeout: 30000,
};

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

/**
 * 获取 Admin-Token
 * 优先级：
 * 1. 服务器端自动登录获取（使用环境变量，优先）
 * 2. Cookie 中的 Admin-Token（兼容已有登录）
 */
async function getAdminToken(request: NextRequest): Promise<string | null> {
    // 1. 服务器端自动登录获取（优先）
    try {
        console.log('[OldTasksAPI] Trying server-side auto-login...');
        const token = await getAccessToken();
        console.log('[OldTasksAPI] Server-side auto-login successful');
        return token;
    } catch (error: any) {
        console.error('[OldTasksAPI] Server-side auto-login failed:', error.message);
    }

    // 2. 从 Cookie 获取（兼容方式）
    const cookies = request.headers.get('cookie') || '';
    const adminTokenMatch = cookies.match(/Admin-Token=([^;]+)/);
    if (adminTokenMatch) {
        console.log('[OldTasksAPI] Using token from Cookie');
        return adminTokenMatch[1];
    }

    console.error('[OldTasksAPI] No access token available');
    return null;
}

/**
 * GET /api/task-extraction/old-tasks
 * 从旧平台获取任务列表
 * 
 * 查询参数:
 * - projUserIds: 项目负责人ID (必需)
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
        
        if (!projUserIds) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameter: projUserIds' },
                { status: 400 }
            );
        }

        // 获取 Admin-Token（服务器端管理）
        const accessToken = await getAdminToken(request);

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
            `&projUserIds=${projUserIds}` +
            `&taskDate%5B0%5D=${taskDateStart}` +
            `&taskDate%5B1%5D=${taskDateEnd}` +
            `&pageSize=${pageSize}` +
            `&curMenuId=10001206` +
            `&time=${timestamp}`;
        
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

        const result = await httpsGetJson(url, {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        });

        if (result.code !== 200) {
            // Token 可能过期，清除缓存让下次重新获取
            if (result.code === 401 || result.msg?.includes('token')) {
                const { clearTokenCache } = await import('@/lib/third-party/auth');
                clearTokenCache();
            }
            
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
