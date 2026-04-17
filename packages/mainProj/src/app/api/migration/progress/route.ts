import { NextRequest, NextResponse } from 'next/server';
import { prismaMigrationEngine } from '@/lib/migration/prisma-engine';

// SSE 端点用于实时进度推送
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: taskId' },
        { status: 400 }
      );
    }

    // 创建 SSE 流
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // 发送初始进度
        const sendProgress = () => {
          const progress = prismaMigrationEngine.getProgress(taskId);
          const task = prismaMigrationEngine.getTask(taskId);
          
          if (!task) {
            controller.close();
            return;
          }

          const data = JSON.stringify({
            taskId,
            status: task.status,
            progress: progress || {
              taskId,
              status: task.status,
              totalRecords: task.totalRecords,
              processedRecords: task.processedRecords,
              failedRecords: task.failedRecords,
              percentage: task.totalRecords > 0 
                ? Math.round((task.processedRecords / task.totalRecords) * 100) 
                : 0,
            },
            timestamp: new Date().toISOString(),
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // 如果任务完成或失败，关闭流
          if (['completed', 'failed', 'cancelled'].includes(task.status)) {
            controller.close();
            return;
          }
        };

        // 立即发送一次
        sendProgress();

        // 每 2 秒发送一次进度
        const interval = setInterval(sendProgress, 2000);

        // 清理
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('获取迁移进度失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch migration progress' },
      { status: 500 }
    );
  }
}
