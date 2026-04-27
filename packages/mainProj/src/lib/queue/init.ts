/**
 * 队列系统初始化
 * 在应用启动时注册所有任务处理器
 */

import {
  registerMigrationProcessor,
  registerReportProcessor,
  registerBatchProcessor,
  registerUserSyncProcessor,
} from './processors';

let initialized = false;

export function initQueueSystem(): void {
  if (initialized) {
    console.log('[QueueSystem] Already initialized');
    return;
  }

  console.log('[QueueSystem] Initializing...');

  // 注册所有处理器
  registerMigrationProcessor();
  registerReportProcessor();
  registerBatchProcessor();
  registerUserSyncProcessor();

  initialized = true;
  console.log('[QueueSystem] All processors registered successfully');
}

export function isQueueSystemInitialized(): boolean {
  return initialized;
}
