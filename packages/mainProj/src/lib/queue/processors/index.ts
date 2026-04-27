/**
 * 任务处理器统一导出
 */

export { 
  migrationProcessor, 
  registerMigrationProcessor, 
  createDivisionMigrationJob,
  type MigrationJobData,
  type MigrationProgress,
} from './migration-processor';

export { 
  reportProcessor, 
  registerReportProcessor, 
  createReportJob,
  type ReportJobData,
  type ReportProgress,
} from './report-processor';

export { 
  batchProcessor, 
  registerBatchProcessor, 
  createBatchJob,
  type BatchJobData,
  type BatchProgress,
} from './batch-processor';

export { 
  userSyncProcessor, 
  registerUserSyncProcessor, 
  createUserSyncJob,
  createBatchUserSyncJob,
  type UserSyncJobData,
  type BatchUserSyncJobData,
  type UserSyncProgress,
} from './user-sync-processor';
