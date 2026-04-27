/**
 * 队列管理器
 * 统一管理所有 BullMQ 队列和 Worker
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { 
  redisConnection, 
  QueueName, 
  queueConfigs, 
  workerConfigs,
  JobPriority,
  JobStatus 
} from './bullmq-config';

// 任务处理器类型
type JobProcessor<T = any> = (job: Job<T>) => Promise<any>;

// 队列事件回调
type QueueEventCallbacks = {
  onCompleted?: (job: Job, result: any) => void;
  onFailed?: (job: Job, err: Error) => void;
  onProgress?: (job: Job, progress: number) => void;
  onActive?: (job: Job) => void;
  onWaiting?: (jobId: string) => void;
};

class QueueManager {
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Map<QueueName, Worker> = new Map();
  private queueEvents: Map<QueueName, QueueEvents> = new Map();
  private processors: Map<QueueName, JobProcessor> = new Map();

  // 单例模式
  private static instance: QueueManager;
  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  /**
   * 获取或创建队列
   */
  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const config = queueConfigs[name];
      const queue = new Queue(name, config);
      this.queues.set(name, queue);
      console.log(`[QueueManager] Queue '${name}' initialized`);
    }
    return this.queues.get(name)!;
  }

  /**
   * 注册任务处理器
   */
  registerProcessor(name: QueueName, processor: JobProcessor, callbacks?: QueueEventCallbacks): void {
    if (this.processors.has(name)) {
      console.warn(`[QueueManager] Processor for '${name}' already registered, skipping...`);
      return;
    }

    this.processors.set(name, processor);

    // 创建 Worker
    const config = workerConfigs[name];
    const worker = new Worker(name, processor, {
      ...config,
      connection: redisConnection,
    } as any);

    this.workers.set(name, worker);

    // 设置 Worker 事件监听
    worker.on('completed', (job, result) => {
      console.log(`[Worker:${name}] Job ${job.id} completed`);
      callbacks?.onCompleted?.(job, result);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker:${name}] Job ${job?.id} failed:`, err.message);
      callbacks?.onFailed?.(job!, err);
    });

    worker.on('progress', (job, progress) => {
      callbacks?.onProgress?.(job, progress);
    });

    worker.on('active', (job) => {
      console.log(`[Worker:${name}] Job ${job.id} started`);
      callbacks?.onActive?.(job);
    });

    // 创建 QueueEvents 用于监听队列级别事件
    const queueEvents = new QueueEvents(name, { connection: redisConnection });
    this.queueEvents.set(name, queueEvents);

    queueEvents.on('waiting', ({ jobId }) => {
      callbacks?.onWaiting?.(jobId);
    });

    console.log(`[QueueManager] Worker for '${name}' registered`);
  }

  /**
   * 添加任务到队列
   */
  async addJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: {
      priority?: JobPriority;
      delay?: number;
      attempts?: number;
      backoff?: { type: 'fixed' | 'exponential'; delay: number };
      timeout?: number;
      jobId?: string;
    }
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    
    const jobOptions = {
      priority: options?.priority ?? JobPriority.NORMAL,
      delay: options?.delay,
      attempts: options?.attempts,
      backoff: options?.backoff,
      timeout: options?.timeout,
      jobId: options?.jobId,
    };

    const job = await queue.add(jobName, data, jobOptions);
    console.log(`[QueueManager] Job '${jobName}' added to '${queueName}' with ID: ${job.id}`);
    return job;
  }

  /**
   * 添加定时任务（Cron）
   */
  async addCronJob<T = any>(
    queueName: QueueName,
    jobName: string,
    data: T,
    cron: string,
    options?: {
      priority?: JobPriority;
      jobId?: string;
    }
  ): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    
    const job = await queue.add(jobName, data, {
      repeat: { cron },
      priority: options?.priority ?? JobPriority.NORMAL,
      jobId: options?.jobId,
    });
    
    console.log(`[QueueManager] Cron job '${jobName}' added to '${queueName}' with pattern: ${cron}`);
    return job;
  }

  /**
   * 获取任务状态
   */
  async getJobStatus(queueName: QueueName, jobId: string): Promise<JobStatus | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return state as JobStatus;
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(queueName: QueueName) {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    // 检查队列是否暂停（通过获取队列状态）
    const isPaused = await queue.isPaused();

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused: isPaused ? waiting : 0, // 如果队列暂停，等待中的任务算作暂停状态
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * 获取所有队列统计
   */
  async getAllQueueStats(): Promise<Record<QueueName, Awaited<ReturnType<typeof this.getQueueStats>>>> {
    const stats: any = {};
    for (const name of Object.values(QueueName)) {
      stats[name] = await this.getQueueStats(name as QueueName);
    }
    return stats;
  }

  /**
   * 获取任务列表
   */
  async getJobs(queueName: QueueName, status: JobStatus, start = 0, end = 100): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    
    switch (status) {
      case JobStatus.WAITING:
        return queue.getWaiting(start, end);
      case JobStatus.ACTIVE:
        return queue.getActive(start, end);
      case JobStatus.COMPLETED:
        return queue.getCompleted(start, end);
      case JobStatus.FAILED:
        return queue.getFailed(start, end);
      case JobStatus.DELAYED:
        return queue.getDelayed(start, end);
      default:
        return [];
    }
  }

  /**
   * 暂停队列
   */
  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    console.log(`[QueueManager] Queue '${queueName}' paused`);
  }

  /**
   * 恢复队列
   */
  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    console.log(`[QueueManager] Queue '${queueName}' resumed`);
  }

  /**
   * 清空队列
   */
  async cleanQueue(queueName: QueueName, gracePeriod = 0, status?: JobStatus): Promise<void> {
    const queue = this.getQueue(queueName);
    
    if (status) {
      await queue.clean(gracePeriod, 0, status as any);
    } else {
      // 清空所有状态
      await Promise.all([
        queue.clean(gracePeriod, 0, 'completed'),
        queue.clean(gracePeriod, 0, 'failed'),
        queue.clean(gracePeriod, 0, 'wait'),
        queue.clean(gracePeriod, 0, 'delayed'),
      ]);
    }
    console.log(`[QueueManager] Queue '${queueName}' cleaned`);
  }

  /**
   * 重试失败的任务
   */
  async retryFailedJob(queueName: QueueName, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
      console.log(`[QueueManager] Job ${jobId} retried`);
    }
  }

  /**
   * 删除任务
   */
  async removeJob(queueName: QueueName, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[QueueManager] Job ${jobId} removed`);
    }
  }

  /**
   * 关闭所有队列和 Worker
   */
  async closeAll(): Promise<void> {
    console.log('[QueueManager] Closing all queues and workers...');
    
    // 关闭 Workers
    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`[QueueManager] Worker '${name}' closed`);
    }

    // 关闭 QueueEvents
    for (const [name, events] of this.queueEvents) {
      await events.close();
    }

    // 关闭队列
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`[QueueManager] Queue '${name}' closed`);
    }

    // 关闭 Redis 连接
    await redisConnection.quit();
    console.log('[QueueManager] All connections closed');
  }
}

// 导出单例
export const queueManager = QueueManager.getInstance();
