/**
 * BullMQ 队列配置
 * 分布式任务调度系统配置
 */

import { QueueOptions, WorkerOptions, JobOptions } from 'bullmq';
import IORedis from 'ioredis';

// Redis 连接配置
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // BullMQ 要求设置为 null
  enableReadyCheck: false,    // BullMQ 要求设置为 false
});

// 队列名称枚举
export enum QueueName {
  DATA_MIGRATION = 'data-migration',      // 数据迁移队列
  REPORT_GENERATION = 'report-generation', // 报表生成队列
  FILE_PROCESSING = 'file-processing',     // 文件处理队列
  BATCH_OPERATION = 'batch-operation',     // 批量操作队列
  SCHEDULED_TASK = 'scheduled-task',       // 定时任务队列
}

// 默认队列配置
export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,                    // 默认重试次数
    backoff: {
      type: 'exponential',          // 指数退避
      delay: 1000,                  // 初始延迟 1 秒
    },
    removeOnComplete: {
      count: 100,                   // 保留最近 100 个完成的任务
      age: 24 * 3600,               // 保留 24 小时
    },
    removeOnFail: {
      count: 50,                    // 保留最近 50 个失败的任务
    },
  },
};

// Worker 默认配置
export const defaultWorkerOptions: Partial<WorkerOptions> = {
  connection: redisConnection,
  concurrency: 5,                   // 默认并发数
  limiter: {
    max: 10,                        // 每秒最多处理 10 个任务
    duration: 1000,
  },
};

// 任务优先级
export enum JobPriority {
  CRITICAL = 1,    // 紧急
  HIGH = 2,        // 高
  NORMAL = 3,      // 普通
  LOW = 4,         // 低
  BACKGROUND = 5,  // 后台
}

// 任务状态
export enum JobStatus {
  PENDING = 'pending',       // 等待中
  ACTIVE = 'active',         // 执行中
  COMPLETED = 'completed',   // 已完成
  FAILED = 'failed',         // 失败
  DELAYED = 'delayed',       // 延迟中
  PAUSED = 'paused',         // 已暂停
}

// 队列配置映射
export const queueConfigs: Record<QueueName, QueueOptions> = {
  [QueueName.DATA_MIGRATION]: {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 5,
      backoff: { type: 'fixed', delay: 5000 },
    },
  },
  [QueueName.REPORT_GENERATION]: {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 3,
      timeout: 300000, // 5 分钟超时
    },
  },
  [QueueName.FILE_PROCESSING]: {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 2,
      timeout: 600000, // 10 分钟超时
    },
  },
  [QueueName.BATCH_OPERATION]: {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 3,
    },
  },
  [QueueName.SCHEDULED_TASK]: {
    ...defaultQueueOptions,
    defaultJobOptions: {
      ...defaultQueueOptions.defaultJobOptions,
      attempts: 3,
    },
  },
};

// Worker 配置映射
export const workerConfigs: Record<QueueName, Partial<WorkerOptions>> = {
  [QueueName.DATA_MIGRATION]: {
    ...defaultWorkerOptions,
    concurrency: 2, // 数据迁移并发数较低，避免数据库压力过大
  },
  [QueueName.REPORT_GENERATION]: {
    ...defaultWorkerOptions,
    concurrency: 3,
  },
  [QueueName.FILE_PROCESSING]: {
    ...defaultWorkerOptions,
    concurrency: 2,
  },
  [QueueName.BATCH_OPERATION]: {
    ...defaultWorkerOptions,
    concurrency: 5,
  },
  [QueueName.SCHEDULED_TASK]: {
    ...defaultWorkerOptions,
    concurrency: 1, // 定时任务串行执行
  },
};
