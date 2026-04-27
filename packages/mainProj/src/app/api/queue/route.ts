/**
 * 队列管理 API
 * 提供队列状态查询、任务管理等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  queueManager, 
  QueueName, 
  JobStatus,
  registerMigrationProcessor,
  registerReportProcessor,
  registerBatchProcessor,
} from '@/lib/queue';

// 确保处理器已注册
let processorsRegistered = false;
function ensureProcessors() {
  if (!processorsRegistered) {
    registerMigrationProcessor();
    registerReportProcessor();
    registerBatchProcessor();
    processorsRegistered = true;
    console.log('[Queue API] All processors registered');
  }
}

/**
 * GET /api/queue
 * 获取队列统计信息或任务列表
 */
export async function GET(request: NextRequest) {
  ensureProcessors();

  try {
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get('queue') as QueueName | null;
    const status = searchParams.get('status') as JobStatus | null;
    const action = searchParams.get('action');

    // 获取所有队列统计
    if (!queueName && action === 'stats') {
      const stats = await queueManager.getAllQueueStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // 获取特定队列统计
    if (queueName && action === 'stats') {
      const stats = await queueManager.getQueueStats(queueName);
      return NextResponse.json({ success: true, data: stats });
    }

    // 获取任务列表
    if (queueName && status) {
      const jobs = await queueManager.getJobs(queueName, status, 0, 100);
      const simplifiedJobs = jobs.map(job => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      }));
      return NextResponse.json({ success: true, data: simplifiedJobs });
    }

    // 获取所有队列名称
    if (action === 'queues') {
      return NextResponse.json({ 
        success: true, 
        data: Object.values(QueueName) 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid parameters. Use ?action=stats or ?queue={name}&status={status}',
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Queue API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/queue
 * 队列管理操作（暂停、恢复、清空等）
 */
export async function POST(request: NextRequest) {
  ensureProcessors();

  try {
    const body = await request.json();
    const { action, queueName, jobId, gracePeriod, status } = body;

    if (!queueName || !Object.values(QueueName).includes(queueName)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing queue name',
      }, { status: 400 });
    }

    switch (action) {
      case 'pause':
        await queueManager.pauseQueue(queueName);
        return NextResponse.json({
          success: true,
          message: `Queue '${queueName}' paused`,
        });

      case 'resume':
        await queueManager.resumeQueue(queueName);
        return NextResponse.json({
          success: true,
          message: `Queue '${queueName}' resumed`,
        });

      case 'clean':
        await queueManager.cleanQueue(queueName, gracePeriod || 0, status);
        return NextResponse.json({
          success: true,
          message: `Queue '${queueName}' cleaned`,
        });

      case 'retry':
        if (!jobId) {
          return NextResponse.json({
            success: false,
            error: 'Job ID is required for retry',
          }, { status: 400 });
        }
        await queueManager.retryFailedJob(queueName, jobId);
        return NextResponse.json({
          success: true,
          message: `Job ${jobId} retried`,
        });

      case 'remove':
        if (!jobId) {
          return NextResponse.json({
            success: false,
            error: 'Job ID is required for removal',
          }, { status: 400 });
        }
        await queueManager.removeJob(queueName, jobId);
        return NextResponse.json({
          success: true,
          message: `Job ${jobId} removed`,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported: pause, resume, clean, retry, remove',
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Queue API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
