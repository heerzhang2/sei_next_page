/**
 * 任务提取进度 SSE (Server-Sent Events) API
 * 前端通过 EventSource 连接此接口实时接收进度更新
 * 
 * 支持集群环境：使用 Redis Pub/Sub 实现跨服务器消息广播
 * 支持同一用户的多个客户端同时连接
 */

import { NextRequest } from 'next/server';
import { taskExtractionJobs } from '../notify/route';
import { redis } from '@/lib/redis';

// 生成唯一客户端ID
function generateClientId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// SSE 客户端连接管理（本机内存）
const localClients = new Map<string, Map<string, ReadableStreamDefaultController>>();

// Redis 订阅客户端（用于接收其他服务器的广播）
let redisSubscriber: ReturnType<typeof redis.duplicate> | null = null;
let subscriberInitialized = false;

// 初始化 Redis 订阅
async function initRedisSubscriber() {
    if (subscriberInitialized) return;
    
    redisSubscriber = redis.duplicate();
    //根据用户账户ID订阅频道，频道命名规则：sse:{userId}，例如sse:123456 监听该用户的Redis集群订阅信息频道；
    redisSubscriber.on('message', (channel: string, message: string) => {
        // 验证频道名格式，确保是我们系统的消息
        if (!channel.startsWith('sse:')) {
            console.warn(`[SSE] Ignoring message from unknown channel: ${channel}`);
            return;
        }
        
        const userId = channel.slice(4); // 去掉 'sse:' 前缀
        
        // 验证 userId 不为空
        if (!userId || userId.trim() === '') {
            console.warn('[SSE] Ignoring message with empty userId');
            return;
        }
        
        try {
            const data = JSON.parse(message);
            
            // 验证消息格式，确保包含必要的字段
            if (!data || typeof data !== 'object') {
                console.warn('[SSE] Ignoring invalid message format');
                return;
            }
            
            // 可选：验证消息来源，确保是我们系统发送的
            if (data._source !== 'sei-task-extraction') {
                console.warn(`[SSE] Ignoring message from unknown source: ${data._source}`);
            }
            
            broadcastToLocalClients(userId, data);
        } catch (e) {
            console.error('[SSE] Failed to parse Redis message:', e);
        }
    });
    
    subscriberInitialized = true;
    console.log('[SSE] Redis subscriber initialized');
}

/**
 * 向本机内存中的客户端广播消息
 */
function broadcastToLocalClients(userId: string, data: any) {
    const userClients = localClients.get(userId);
    if (!userClients || userClients.size === 0) {
        return false;
    }

    const message = {
        type: data.type || 'update',
        ...data,
        timestamp: new Date().toISOString(),
    };
    
    const messageStr = `data: ${JSON.stringify(message)}\n\n`;
    let successCount = 0;
    const failedClients: string[] = [];

    userClients.forEach((controller, clientId) => {
        try {
            controller.enqueue(messageStr);
            successCount++;
        } catch (error) {
            console.error(`[SSE] Failed to broadcast to user ${userId}, client ${clientId}:`, error);
            failedClients.push(clientId);
        }
    });

    failedClients.forEach(clientId => userClients.delete(clientId));
    
    if (userClients.size === 0) {
        localClients.delete(userId);
        redisSubscriber?.unsubscribe(`sse:${userId}`);
    }

    return successCount > 0;
}

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

    // 确保 Redis 订阅已初始化
    await initRedisSubscriber();

    // 订阅该用户的 Redis 频道
    await redisSubscriber?.subscribe(`sse:${userId}`);

    // 生成唯一客户端ID
    const clientId = generateClientId();

    // 创建 SSE 流
    const stream = new ReadableStream({
        start(controller) {
            console.log(`[SSE] Client connected: user=${userId}, clientId=${clientId}`);
            
            // 获取或创建该用户的客户端集合
            let userClients = localClients.get(userId);
            if (!userClients) {
                userClients = new Map();
                localClients.set(userId, userClients);
            }
            
            // 存储客户端连接
            userClients.set(clientId, controller);

            // 发送初始连接成功消息
            const initialData = {
                type: 'connected',
                userId,
                clientId,
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
                    removeClient(userId, clientId);
                }
            }, 30000); // 30秒心跳

            // 清理函数
            request.signal.addEventListener('abort', () => {
                console.log(`[SSE] Client disconnected: user=${userId}, clientId=${clientId}`);
                clearInterval(heartbeat);
                removeClient(userId, clientId);
                controller.close();
            });
        },
        cancel() {
            console.log(`[SSE] Stream cancelled: user=${userId}, clientId=${clientId}`);
            removeClient(userId, clientId);
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
 * 移除指定客户端连接
 */
function removeClient(userId: string, clientId: string) {
    const userClients = localClients.get(userId);
    if (userClients) {
        userClients.delete(clientId);
        // 如果该用户没有更多客户端，清理用户条目并取消订阅
        if (userClients.size === 0) {
            localClients.delete(userId);
            redisSubscriber?.unsubscribe(`sse:${userId}`);
        }
    }
}

/**
 * 向指定用户ID的所有客户端广播消息（支持集群）
 * 1. 发布到 Redis，让其他服务器接收
 * 2. 同时发送到本机内存中的客户端
 */
export async function broadcastToClients(userId: string, data: any) {
    // 添加消息来源标识，用于接收端验证
    const messageWithSource = {
        ...data,
        _source: 'sei-task-extraction',
        _timestamp: Date.now(),
    };

    // 发布到 Redis（让集群中的其他服务器也能收到）
    try {
        await redis.publish(`sse:${userId}`, JSON.stringify(messageWithSource));
    } catch (error) {
        console.error(`[SSE] Failed to publish to Redis for user ${userId}:`, error);
    }

    // 同时发送到本机客户端（不需要 _source 字段）
    return broadcastToLocalClients(userId, data);
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
export function broadcastFailure(userId: string, error: string, processInstanceKey?: string) {
    return broadcastToClients(userId, {
        type: 'failed',
        error,
        processInstanceKey,
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

/**
 * 获取当前连接的统计信息（用于监控）
 */
export function getConnectionStats() {
    const stats = {
        totalUsers: localClients.size,
        totalConnections: 0,
        users: [] as { userId: string; connections: number }[],
    };

    localClients.forEach((userClients, userId) => {
        stats.totalConnections += userClients.size;
        stats.users.push({ userId, connections: userClients.size });
    });

    return stats;
}
