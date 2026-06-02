/**
 * 任务提取状态查询 API
 * 用于用户上线时查询进行中的任务状态（弥补 SSE 可能丢失的消息）
 * 支持多个流程实例同时跟踪
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const TASK_STATUS_PREFIX = 'task-extraction:status:';
const TASK_TTL = 7 * 24 * 60 * 60; // 7天过期

// 单个流程实例状态
interface ProcessInstanceStatus {
    processInstanceKey: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: { current: number; total: number; percentage: number };
    result?: any;
    error?: string;
    updatedAt: string;
}

/**
 * 获取用户的所有任务状态（从 Redis）
 * GET /api/task-extraction/status?userId=xxx
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

        // 从 Redis 获取用户的所有任务状态
        const key = `${TASK_STATUS_PREFIX}${userId}`;
        const data = await redis.get(key);

        if (!data) {
            return NextResponse.json({
                success: true,
                data: [],
                message: 'No active tasks found',
            });
        }

        // 解析任务状态列表
        const taskStatuses: ProcessInstanceStatus[] = JSON.parse(data);

        // 过滤过期任务（超过24小时的completed/failed任务视为过期）
        const now = Date.now();
        const validStatuses = taskStatuses.filter((task) => {
            const updatedAt = new Date(task.updatedAt).getTime();
            const isCompleted = task.status === 'completed' || task.status === 'failed';
            const isExpired = isCompleted && (now - updatedAt > 24 * 60 * 60 * 1000);
            return !isExpired;
        });

        // 如果有任务过期，更新 Redis
        if (validStatuses.length !== taskStatuses.length) {
            if (validStatuses.length === 0) {
                await redis.del(key);
            } else {
                await redis.setex(key, TASK_TTL, JSON.stringify(validStatuses));
            }
        }

        return NextResponse.json({
            success: true,
            data: validStatuses,
            count: validStatuses.length,
        });

    } catch (error: any) {
        console.error('[TaskStatus] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * 确认已读并清理已完成的任务状态
 * POST /api/task-extraction/status
 * Body: { userId: string, processInstanceKeys?: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, processInstanceKeys } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Missing userId' },
                { status: 400 }
            );
        }

        // 如果指定了流程实例Key，删除这些任务
        if (processInstanceKeys && Array.isArray(processInstanceKeys) && processInstanceKeys.length > 0) {
            for (const key of processInstanceKeys) {
                await deleteTaskStatus(userId, key);
            }
            return NextResponse.json({
                success: true,
                message: `已删除 ${processInstanceKeys.length} 个任务状态`,
            });
        }

        // 否则清理所有已完成的旧任务
        await cleanupCompletedTasks(userId);

        return NextResponse.json({
            success: true,
            message: '已清理已完成的任务状态',
        });

    } catch (error: any) {
        console.error('[TaskStatus] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * 更新任务状态（由 notify API 调用）
 * 支持多个流程实例，按 processInstanceKey 区分
 */
export async function updateTaskStatus(
    userId: string,
    status: {
        processInstanceKey: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress?: { current: number; total: number; percentage: number };
        result?: any;
        error?: string;
    }
) {
    try {
        const key = `${TASK_STATUS_PREFIX}${userId}`;
        
        // 获取现有状态列表
        const existingData = await redis.get(key);
        let taskStatuses: ProcessInstanceStatus[] = existingData ? JSON.parse(existingData) : [];
        
        // 查找是否已存在该流程实例的状态
        const existingIndex = taskStatuses.findIndex(
            (t) => t.processInstanceKey === status.processInstanceKey
        );
        
        const newStatus: ProcessInstanceStatus = {
            ...status,
            updatedAt: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
            // 更新现有状态
            taskStatuses[existingIndex] = newStatus;
        } else {
            // 添加新状态
            taskStatuses.push(newStatus);
        }
        
        // 清理过期任务
        const now = Date.now();
        taskStatuses = taskStatuses.filter((task) => {
            const updatedAt = new Date(task.updatedAt).getTime();
            const isCompleted = task.status === 'completed' || task.status === 'failed';
            const isExpired = isCompleted && (now - updatedAt > 24 * 60 * 60 * 1000);
            return !isExpired;
        });
        
        // 限制最大跟踪数量（最多50个流程实例）
        if (taskStatuses.length > 50) {
            taskStatuses = taskStatuses.slice(-50);
        }

        // 存储到 Redis，设置过期时间
        await redis.setex(key, TASK_TTL, JSON.stringify(taskStatuses));

        return true;
    } catch (error) {
        console.error('[TaskStatus] Failed to update status:', error);
        return false;
    }
}

/**
 * 删除指定流程实例的任务状态
 */
export async function deleteTaskStatus(userId: string, processInstanceKey: string) {
    try {
        const key = `${TASK_STATUS_PREFIX}${userId}`;
        const existingData = await redis.get(key);
        
        if (!existingData) return true;
        
        let taskStatuses: ProcessInstanceStatus[] = JSON.parse(existingData);
        taskStatuses = taskStatuses.filter((t) => t.processInstanceKey !== processInstanceKey);
        
        if (taskStatuses.length === 0) {
            await redis.del(key);
        } else {
            await redis.setex(key, TASK_TTL, JSON.stringify(taskStatuses));
        }
        
        return true;
    } catch (error) {
        console.error('[TaskStatus] Failed to delete status:', error);
        return false;
    }
}

/**
 * 删除用户的所有任务状态
 */
export async function deleteAllTaskStatus(userId: string) {
    try {
        const key = `${TASK_STATUS_PREFIX}${userId}`;
        await redis.del(key);
        return true;
    } catch (error) {
        console.error('[TaskStatus] Failed to delete all status:', error);
        return false;
    }
}

/**
 * 清理已完成的旧任务状态（保留最近24小时的）
 * 用于前端确认已读后的清理
 */
export async function cleanupCompletedTasks(userId: string) {
    try {
        const key = `${TASK_STATUS_PREFIX}${userId}`;
        const existingData = await redis.get(key);
        
        if (!existingData) return true;
        
        let taskStatuses: ProcessInstanceStatus[] = JSON.parse(existingData);
        const now = Date.now();
        
        // 保留：
        // 1. 运行中的任务
        // 2. 已完成/失败但不超过24小时的任务
        const validStatuses = taskStatuses.filter((task) => {
            if (task.status === 'processing' || task.status === 'pending') {
                return true;
            }
            const updatedAt = new Date(task.updatedAt).getTime();
            return now - updatedAt < 24 * 60 * 60 * 1000;
        });
        
        if (validStatuses.length === 0) {
            await redis.del(key);
        } else if (validStatuses.length !== taskStatuses.length) {
            await redis.setex(key, TASK_TTL, JSON.stringify(validStatuses));
        }
        
        return true;
    } catch (error) {
        console.error('[TaskStatus] Failed to cleanup completed tasks:', error);
        return false;
    }
}
