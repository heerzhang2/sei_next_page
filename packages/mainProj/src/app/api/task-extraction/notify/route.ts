/**
 * 任务提取完成通知 API
 * Camunda Worker 完成后调用此接口通知前端
 */

import { NextRequest, NextResponse } from 'next/server';
import { broadcastProgress, broadcastCompletion, broadcastFailure } from '../events/route';
import { updateTaskStatus } from '../status/route';

// 内存缓存（用于快速查询，实际数据存储在 Redis）
const taskExtractionJobs = new Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: { current: number; total: number; percentage: number };
    result?: any;
    updatedAt: Date;
}>();

/**
 * POST /api/task-extraction/notify
 * Camunda Worker 调用此接口通知任务进度/完成
 * 
 * 请求体:
 * {
 *   userId: string;              // 用户ID（路由键）
 *   processInstanceKey: string;  // 流程实例Key（参考）
 *   type: 'progress' | 'completed' | 'failed';
 *   progress?: { current: number; total: number; percentage: number };
 *   result?: any;
 *   error?: string;
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, processInstanceKey, type, progress, result, error } = body;

        // 使用 userId 作为路由键，如果没有则使用 processInstanceKey 作为后备
        const targetUser = userId || processInstanceKey;

        if (!targetUser) {
            return NextResponse.json(
                { success: false, error: 'Missing userId or processInstanceKey' },
                { status: 400 }
            );
        }

        console.log(`[TaskExtractionNotify] Received ${type} notification for user ${targetUser}`);

        // 根据通知类型处理
        switch (type) {
            case 'progress': {
                const status = {
                    status: 'processing' as const,
                    progress,
                    processInstanceKey,
                    updatedAt: new Date(),
                };
                // 更新内存缓存
                taskExtractionJobs.set(targetUser, status);
                // 持久化到 Redis
                await updateTaskStatus(targetUser, status);
                // 通过 SSE 广播进度（按用户ID）
                broadcastProgress(targetUser, {...progress, processInstanceKey });
                break;
            }

            case 'completed': {
                const completedStatus = {
                    status: 'completed' as const,
                    result,
                    processInstanceKey,
                    updatedAt: new Date(),
                };
                // 更新内存缓存
                taskExtractionJobs.set(targetUser, completedStatus);
                // 持久化到 Redis
                await updateTaskStatus(targetUser, completedStatus);
                // 通过 SSE 广播完成（按用户ID）
                broadcastCompletion(targetUser, {...result, processInstanceKey });
                break;
            }

            case 'failed': {
                const failedStatus = {
                    status: 'failed' as const,
                    error: error || 'Unknown error',
                    processInstanceKey,
                    updatedAt: new Date(),
                };
                // 更新内存缓存
                taskExtractionJobs.set(targetUser, failedStatus);
                // 持久化到 Redis
                await updateTaskStatus(targetUser, failedStatus);
                // 通过 SSE 广播失败（按用户ID）
                broadcastFailure(targetUser, error || 'Unknown error', processInstanceKey);
                break;
            }

            default: {
                // 兼容旧版本：只传 result 表示完成
                const defaultStatus = {
                    status: result?.success ? 'completed' as const : 'failed' as const,
                    result,
                    processInstanceKey,
                    updatedAt: new Date(),
                };
                taskExtractionJobs.set(targetUser, defaultStatus);
                await updateTaskStatus(targetUser, defaultStatus);
                if (result?.success) {
                    broadcastCompletion(targetUser, {...result, processInstanceKey });
                } else {
                    broadcastFailure(targetUser, result?.error || 'Unknown error', processInstanceKey);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Notification received',
        });

    } catch (error: any) {
        console.error('[TaskExtractionNotify] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/task-extraction/notify?userId=xxx
 * 前端轮询查询任务状态
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId' },
                { status: 400 }
            );
        }

        const job = taskExtractionJobs.get(userId);

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
        console.error('[TaskExtractionNotify] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// 导出任务状态存储（供其他模块使用）
export { taskExtractionJobs };
