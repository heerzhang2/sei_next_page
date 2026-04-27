/**
 * 任务提取进度 SSE (Server-Sent Events) API
 * 前端通过 EventSource 连接此接口实时接收进度更新
 * 
 * 按用户ID路由：用户无论在哪个页面都能收到自己的通知
 */

import { NextRequest } from 'next/server';
import { taskExtractionJobs } from '../notify/route';

// SSE 客户端连接管理 - 按用户ID索引
const clients = new Map<string, ReadableStreamDefaultController>();

/**
 * GET /api/task-extraction/events?userId=xxx
 * SSE 端点，用于实时推送任务提取进度
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    // 创建 SSE 流
    const stream = new ReadableStream({
        start(controller) {
            console.log(`[SSE] Client connected for user ${userId}`);
            
            // 存储客户端连接（按用户ID）
            clients.set(userId, controller);

            // 发送初始连接成功消息
            const initialData = {
                type: 'connected',
                userId,
                timestamp: new Date().toISOString(),
            };
            
            controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

            // 立即发送当前状态（如果有）
            const currentJob = taskExtractionJobs.get(userId);
            if (currentJob) {
                const statusData = {
                    type: 'status',
                    ...currentJob,
                    timestamp: new Date().toISOString(),
                };
                controller.enqueue(`data: ${JSON.stringify(statusData)}\n\n`);
            }

            // 心跳保持连接
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(`: heartbeat\n\n`);
                } catch {
                    clearInterval(heartbeat);
                    clients.delete(userId);
                }
            }, 30000); // 30秒心跳

            // 清理函数
            request.signal.addEventListener('abort', () => {
                console.log(`[SSE] Client disconnected for user ${userId}`);
                clearInterval(heartbeat);
                clients.delete(userId);
                controller.close();
            });
        },
        cancel() {
            console.log(`[SSE] Stream cancelled for user ${userId}`);
            clients.delete(userId);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

/**
 * 向指定用户ID的所有客户端广播消息
 */
export function broadcastToClients(userId: string, data: any) {
    const controller = clients.get(userId);
    if (controller) {
        try {
            const message = {
                type: data.type || 'update',
                ...data,
                timestamp: new Date().toISOString(),
            };
            controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
            return true;
        } catch (error) {
            console.error(`[SSE] Failed to broadcast to user ${userId}:`, error);
            clients.delete(userId);
            return false;
        }
    }
    return false;
}

/**
 * 广播进度更新
 */
export function broadcastProgress(userId: string, progress: { current: number; total: number; percentage: number }) {
    return broadcastToClients(userId, {
        type: 'progress',
        progress,
    });
}

/**
 * 广播完成通知
 */
export function broadcastCompletion(userId: string, result: any) {
    return broadcastToClients(userId, {
        type: 'completed',
        result,
    });
}

/**
 * 广播失败通知
 */
export function broadcastFailure(userId: string, error: string) {
    return broadcastToClients(userId, {
        type: 'failed',
        error,
    });
}

/**
 * 广播通用通知消息
 */
export function broadcastNotification(
    userId: string, 
    title: string, 
    message: string, 
    notificationType: 'info' | 'success' | 'warning' | 'error' = 'info',
    data?: any
) {
    return broadcastToClients(userId, {
        type: 'notification',
        title,
        message,
        notificationType,
        data,
    });
}
