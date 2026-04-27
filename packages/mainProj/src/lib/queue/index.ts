/**
 * 队列系统统一导出
 */

// 配置
export { 
  redisConnection, 
  QueueName, 
  JobPriority, 
  JobStatus,
  queueConfigs,
  workerConfigs,
} from './bullmq-config';

// 队列管理器
export { queueManager, QueueManager } from './queue-manager';

// 处理器
export {
  // 迁移处理器
  migrationProcessor,
  registerMigrationProcessor,
  createDivisionMigrationJob,
  type MigrationJobData,
  type MigrationProgress,
  
  // 报表处理器
  reportProcessor,
  registerReportProcessor,
  createReportJob,
  type ReportJobData,
  type ReportProgress,
  
  // 批量处理器
  batchProcessor,
  registerBatchProcessor,
  createBatchJob,
  type BatchJobData,
  type BatchProgress,
  
  // 用户同步处理器
  userSyncProcessor,
  registerUserSyncProcessor,
  createUserSyncJob,
  createBatchUserSyncJob,
  type UserSyncJobData,
  type BatchUserSyncJobData,
  type UserSyncProgress,
} from './processors';

// 初始化
export { initQueueSystem, isQueueSystemInitialized } from './init';
