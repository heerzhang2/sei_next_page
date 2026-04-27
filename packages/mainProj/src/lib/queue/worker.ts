/**
 * 独立 Worker 进程
 * 用于在单独进程中运行任务处理器
 * 
 * 启动方式:
 * npx ts-node src/lib/queue/worker.ts
 * 
 * 或使用 PM2:
 * pm2 start src/lib/queue/worker.ts --name queue-worker
 */

import { initQueueSystem } from './init';

console.log('[Worker] Starting queue worker process...');

// 初始化队列系统（注册所有处理器）
initQueueSystem();

console.log('[Worker] Worker is running and waiting for jobs...');
console.log('[Worker] Press Ctrl+C to stop');

// 保持进程运行
process.stdin.resume();

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down gracefully...');
  const { queueManager } = await import('./queue-manager');
  await queueManager.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down gracefully...');
  const { queueManager } = await import('./queue-manager');
  await queueManager.closeAll();
  process.exit(0);
});
