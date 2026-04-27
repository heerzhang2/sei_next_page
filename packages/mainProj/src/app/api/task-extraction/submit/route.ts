/**
 * 提交任务提取请求 API
 * 创建 Camunda 流程实例来异步执行提取
 * 
 * Admin-Token 完全由服务器端管理：
 * 1. 服务器端内存缓存（优先）
 * 2. Cookie 中的 Admin-Token（兼容已有登录）
 * 3. 服务器端自动登录获取（使用环境变量配置）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProcessInstanceRest } from '@/lib/camunda';
import { getAccessToken } from '@/lib/third-party/auth';
import { requireRole } from '@/lib/role-auth';

// 存储进行中的任务（生产环境应使用 Redis）
const extractionJobs = new Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    processInstanceKey?: string;
    createdAt: Date;
}>();

/**
 * 获取 Admin-Token
 * 优先级：
 * 1. 服务器端自动登录获取（使用环境变量，优先）
 * 2. Cookie 中的 Admin-Token（兼容已有登录）
 */
async function getAdminToken(request: NextRequest): Promise<string | null> {
    // 1. 服务器端自动登录获取（优先）
    try {
        console.log('[TaskExtractionSubmit] Trying server-side auto-login...');
        const token = await getAccessToken();
        console.log('[TaskExtractionSubmit] Server-side auto-login successful');
        return token;
    } catch (error: any) {
        console.error('[TaskExtractionSubmit] Server-side auto-login failed:', error.message);
    }

    // 2. 从 Cookie 获取（兼容方式）
    const cookies = request.headers.get('cookie') || '';
    const adminTokenMatch = cookies.match(/Admin-Token=([^;]+)/);
    if (adminTokenMatch) {
        console.log('[TaskExtractionSubmit] Using token from Cookie');
        return adminTokenMatch[1];
    }

    console.error('[TaskExtractionSubmit] No access token available');
    return null;
}

/**
 * POST /api/task-extraction/submit
 * 提交任务提取请求
 *
 * 请求体:
 * {
 *   taskGroups: {           // 任务分组（保持分组结构）
 *     groupId: string;      // 分组ID（卡片ID）
 *     taskIds: string[];    // 该分组下的子任务ID列表
 *   }[];
 *   deptId: string;         // 部门ID
 *   deptName?: string;      // 部门名称
 *   projUserIds?: string[]; // 项目负责人ID列表（第三方账户ID，即 authName）
 *   officeId?: string;      // 科室ID
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { taskGroups, deptId, deptName, projUserIds, officeId } = body;

        // 验证参数 - 支持新的分组格式或旧的扁平格式
        let normalizedTaskGroups: { groupId: string; taskIds: string[] }[] = [];

        if (taskGroups && Array.isArray(taskGroups) && taskGroups.length > 0) {
            // 新的分组格式
            normalizedTaskGroups = taskGroups;
        } else if (body.taskIds && Array.isArray(body.taskIds) && body.taskIds.length > 0) {
            // 兼容旧的扁平格式 - 将所有 taskIds 作为一个组
            normalizedTaskGroups = [{ groupId: 'default', taskIds: body.taskIds }];
        } else {
            return NextResponse.json(
                { success: false, error: 'Missing or invalid taskGroups or taskIds' },
                { status: 400 }
            );
        }

        if (!deptId) {
            return NextResponse.json(
                { success: false, error: 'Missing deptId' },
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

        // 计算总任务数
        const totalTaskCount = normalizedTaskGroups.reduce((sum, group) => sum + group.taskIds.length, 0);
        console.log(`[TaskExtractionSubmit] Submitting ${normalizedTaskGroups.length} groups, ${totalTaskCount} total tasks`);
        console.log(`[TaskExtractionSubmit] Groups:`, normalizedTaskGroups.map(g => `${g.groupId}(${g.taskIds.length})`).join(', '));
        console.log(`[TaskExtractionSubmit] Dept: ${deptName || deptId}`);
        console.log(`[TaskExtractionSubmit] Project Leaders: ${projUserIds?.join(', ') || 'none'}`);

        // 从 session 和 Redis 缓存获取当前用户信息
        const roleCheckResult = await requireRole(["JyUser"]);

        if (!roleCheckResult.success) {
            return NextResponse.json(
                { success: false, error: roleCheckResult.error },
                { status: 401 }
            );
        }

        const currentUsername = roleCheckResult.session?.user?.name || 'anonymous';
        console.log(`[TaskExtractionSubmit] Current user: ${currentUsername}`);

        // 创建 Camunda 流程实例
        // 注意：需要在 Camunda 中先部署流程定义 "task-extraction-process"
        const processInstance = await createProcessInstanceRest('task-extraction-process', {
            taskGroups: normalizedTaskGroups,  // 保持分组结构的任务数据
            taskIds: normalizedTaskGroups.flatMap(g => g.taskIds), // 同时传递扁平化的 taskIds 供 worker 使用
            deptId,
            deptName: deptName || deptId,
            projUserIds: projUserIds || [],
            officeId: officeId || null,
            userId: currentUsername,  // 使用真实用户名作为通知路由键
            submitTime: new Date().toISOString(),
        });

        const jobId = processInstance.processInstanceKey;

        // 记录任务状态
        extractionJobs.set(jobId, {
            status: 'pending',
            processInstanceKey: jobId,
            createdAt: new Date(),
        });

        console.log(`[TaskExtractionSubmit] Process instance created: ${jobId}`);

        return NextResponse.json({
            success: true,
            data: {
                jobId,
                processInstanceKey: jobId,
                processDefinitionId: processInstance.processDefinitionId,
                taskCount: taskIds.length,
                message: `Task extraction job created with ${taskIds.length} tasks`,
            },
        });

    } catch (error: any) {
        console.error('[TaskExtractionSubmit] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/task-extraction/submit?jobId=xxx
 * 查询任务提取状态
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Missing jobId' },
                { status: 400 }
            );
        }

        const job = extractionJobs.get(jobId);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: job,
        });

    } catch (error: any) {
        console.error('[TaskExtractionSubmit] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// 导出任务存储（供通知接口使用）
export { extractionJobs };
