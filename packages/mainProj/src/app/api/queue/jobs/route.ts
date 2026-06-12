/**异步任务，队列执行。但是不支持定时间点方式执行。BullMQ 是基于 Redis 构建的 消息+任务队列。
 * 任务提交 API
 * 用于提交各种类型的后台任务
 Next.js 层 queue 不是 XXL-JOB 的。用的是 BullMQ 基于 Redis 的 Node.js 任务队列； 
 自建 Redis 队列（BullMQ）任务分配=「谁先抢到谁干」的分布式消费，要定期 updateProgress，既能续期又能展示进度；
 简单场景够用，但需要分片、失败转移、定时触发这些高级功能时就力不从心了。
 *  相反的； PK：
  对 PowerJob 和 XXL-JOB 来说都是一样的结构。 独立部署，连接自己的 DB;
  PowerJob 和 XXL-JOB 的好处是自带UI 管理界面和一键分片，但为此要多维护一个独立后端服务进程额外要部署。
  数据库表： xxl_job_info，  xxl_job_log  真的页没有利用到！
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  queueManager, 
  QueueName, 
  JobPriority,
  createDivisionMigrationJob,
  createReportJob,
  createBatchJob,
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
  }
}

/**
 * POST /api/queue/jobs
 * 提交新任务到队列
 */
export async function POST(request: NextRequest) {
  ensureProcessors();

  try {
    const body = await request.json();
    const { 
      queue: queueName, 
      jobType, 
      data, 
      priority = 'normal',
      delay,
      attempts,
    } = body;

    // 验证队列名称
    if (!queueName || !Object.values(QueueName).includes(queueName)) {
      return NextResponse.json({
        success: false,
        error: `Invalid queue name. Valid queues: ${Object.values(QueueName).join(', ')}`,
      }, { status: 400 });
    }

    // 转换优先级
    const priorityMap: Record<string, JobPriority> = {
      'critical': JobPriority.CRITICAL,
      'high': JobPriority.HIGH,
      'normal': JobPriority.NORMAL,
      'low': JobPriority.LOW,
      'background': JobPriority.BACKGROUND,
    };
    const jobPriority = priorityMap[priority] || JobPriority.NORMAL;

    let jobId: string;

    // 根据队列类型处理
    switch (queueName) {
      case QueueName.DATA_MIGRATION:
        if (jobType === 'division-migration') {
          jobId = await createDivisionMigrationJob(data?.unitId, jobPriority);
        } else {
          const job = await queueManager.addJob(queueName, jobType || 'custom-migration', data, {
            priority: jobPriority,
            delay,
            attempts,
          });
          jobId = job.id!;
        }
        break;

      case QueueName.REPORT_GENERATION:
        if (data?.reportType && data?.templateId) {
          jobId = await createReportJob(data.reportType, data.templateId, data.parameters || {}, jobPriority);
        } else {
          const job = await queueManager.addJob(queueName, jobType || 'generate-report', data, {
            priority: jobPriority,
            delay,
            attempts,
            timeout: 600000,
          });
          jobId = job.id!;
        }
        break;

      case QueueName.BATCH_OPERATION:
        if (data?.operation && data?.entityType) {
          jobId = await createBatchJob(data.operation, data.entityType, data, jobPriority);
        } else {
          const job = await queueManager.addJob(queueName, jobType || 'batch-operation', data, {
            priority: jobPriority,
            delay,
            attempts,
            timeout: 1800000,
          });
          jobId = job.id!;
        }
        break;

      default:
        const job = await queueManager.addJob(queueName, jobType || 'default-job', data, {
          priority: jobPriority,
          delay,
          attempts,
        });
        jobId = job.id!;
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        queue: queueName,
        status: 'pending',
      },
    });

  } catch (error: any) {
    console.error('[Queue Jobs API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/queue/jobs
 * 获取任务详情
 */
export async function GET(request: NextRequest) {
  ensureProcessors();

  try {
    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get('queue') as QueueName;
    const jobId = searchParams.get('jobId');

    if (!queueName || !jobId) {
      return NextResponse.json({
        success: false,
        error: 'Queue name and job ID are required',
      }, { status: 400 });
    }

    const queue = queueManager.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found',
      }, { status: 404 });
    }

    const state = await job.getState();

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        name: job.name,
        data: job.data,
        state,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        returnvalue: job.returnvalue,
      },
    });

  } catch (error: any) {
    console.error('[Queue Jobs API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
