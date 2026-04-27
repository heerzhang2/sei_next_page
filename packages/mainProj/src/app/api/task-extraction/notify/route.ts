/**
 * 任务提取完成通知 API
 * Camunda Worker 完成后调用此接口通知前端
 */

import { NextRequest, NextResponse } from 'next/server';
import { broadcastProgress, broadcastCompletion, broadcastFailure } from '../events/route';

// 存储进行中的任务状态（生产环境应使用 Redis）
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
            case 'progress':
                // 更新任务状态和进度
                taskExtractionJobs.set(targetUser, {
                    status: 'processing',
                    progress,
                    updatedAt: new Date(),
                });
                // 通过 SSE 广播进度（按用户ID）
                broadcastProgress(targetUser, progress);
                break;

            case 'completed':
                // 更新任务状态为完成
                taskExtractionJobs.set(targetUser, {
                    status: 'completed',
                    result,
                    updatedAt: new Date(),
                });
                // 通过 SSE 广播完成（按用户ID）
                broadcastCompletion(targetUser, result);
                break;

            case 'failed':
                // 更新任务状态为失败
                taskExtractionJobs.set(targetUser, {
                    status: 'failed',
                    result,
                    updatedAt: new Date(),
                });
                // 通过 SSE 广播失败（按用户ID）
                broadcastFailure(targetUser, error || 'Unknown error');
                break;

            default:
                // 兼容旧版本：只传 result 表示完成
                taskExtractionJobs.set(targetUser, {
                    status: result?.success ? 'completed' : 'failed',
                    result,
                    updatedAt: new Date(),
                });
                if (result?.success) {
                    broadcastCompletion(targetUser, result);
                } else {
                    broadcastFailure(targetUser, result?.error || 'Unknown error');
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
