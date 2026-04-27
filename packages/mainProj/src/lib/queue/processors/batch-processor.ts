/**
 * 批量操作任务处理器
 * 处理大数据量的批量操作，如批量更新、批量删除等
 */

import { Job } from 'bullmq';
import { QueueName, JobPriority } from '../bullmq-config';
import { queueManager } from '../queue-manager';

// 批量任务数据类型
export interface BatchJobData {
  operation: 'update' | 'delete' | 'import' | 'export' | 'transform';
  entityType: string;
  recordIds?: string[];
  filter?: Record<string, any>;
  updateData?: Record<string, any>;
  sourceData?: any[];
  batchSize?: number;
  options?: Record<string, any>;
}

// 批量操作进度
export interface BatchProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  estimatedTimeRemaining?: number; // 秒
}

/**
 * 批量更新处理器
 */
async function processBatchUpdate(job: Job<BatchJobData>): Promise<any> {
  const { entityType, recordIds, updateData, batchSize = 100 } = job.data;
  
  console.log(`[BatchProcessor] Starting batch update for ${entityType}`);

  const totalRecords = recordIds?.length || 1000;
  const totalBatches = Math.ceil(totalRecords / batchSize);
  
  const results = {
    total: totalRecords,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  const startTime = Date.now();

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, totalRecords);
    
    // 模拟批量更新操作
    for (let i = batchStart; i < batchEnd; i++) {
      try {
        // 模拟数据库操作
        await new Promise(resolve => setTimeout(resolve, 10));
        results.succeeded++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          id: `record-${i}`,
          error: error.message,
        });
      }
      results.processed++;
    }

    // 计算进度和预估剩余时间
    const elapsedTime = (Date.now() - startTime) / 1000;
    const avgTimePerRecord = elapsedTime / results.processed;
    const remainingRecords = totalRecords - results.processed;
    const estimatedTimeRemaining = Math.round(avgTimePerRecord * remainingRecords);

    const progress: BatchProgress = {
      total: totalRecords,
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      currentBatch: batchIndex + 1,
      totalBatches,
      percentage: Math.round((results.processed / totalRecords) * 100),
      estimatedTimeRemaining,
    };

    await job.updateProgress(progress);

    // 每处理完一批，短暂休息避免数据库压力过大
    if (batchIndex < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return {
    success: results.failed === 0,
    operation: 'update',
    entityType,
    ...results,
    duration: Date.now() - startTime,
  };
}

/**
 * 批量导入处理器
 */
async function processBatchImport(job: Job<BatchJobData>): Promise<any> {
  const { entityType, sourceData, batchSize = 50 } = job.data;
  
  console.log(`[BatchProcessor] Starting batch import for ${entityType}`);

  const totalRecords = sourceData?.length || 0;
  if (totalRecords === 0) {
    throw new Error('No data to import');
  }

  const totalBatches = Math.ceil(totalRecords / batchSize);
  
  const results = {
    total: totalRecords,
    processed: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as Array<{ index: number; error: string }>,
  };

  const startTime = Date.now();

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, totalRecords);
    const batch = sourceData!.slice(batchStart, batchEnd);

    // 处理每一批数据
    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      const globalIndex = batchStart + i;

      try {
        // 数据验证
        if (!record || typeof record !== 'object') {
          throw new Error('Invalid record format');
        }

        // 模拟导入操作（检查重复、插入/更新）
        const shouldUpdate = Math.random() > 0.8; // 模拟 20% 更新率
        
        await new Promise(resolve => setTimeout(resolve, 20));
        
        if (shouldUpdate) {
          results.updated++;
        } else {
          results.created++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: globalIndex,
          error: error.message,
        });
      }
      results.processed++;
    }

    const progress: BatchProgress = {
      total: totalRecords,
      processed: results.processed,
      succeeded: results.created + results.updated,
      failed: results.failed,
      currentBatch: batchIndex + 1,
      totalBatches,
      percentage: Math.round((results.processed / totalRecords) * 100),
    };

    await job.updateProgress(progress);

    // 批次间暂停
    if (batchIndex < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    success: results.failed === 0,
    operation: 'import',
    entityType,
    ...results,
    duration: Date.now() - startTime,
  };
}

/**
 * 批量删除处理器
 */
async function processBatchDelete(job: Job<BatchJobData>): Promise<any> {
  const { entityType, recordIds, filter } = job.data;
  
  console.log(`[BatchProcessor] Starting batch delete for ${entityType}`);

  // 模拟删除操作
  const totalRecords = recordIds?.length || 100;
  
  await job.updateProgress({
    total: totalRecords,
    processed: 0,
    percentage: 0,
  });

  // 模拟软删除检查
  await new Promise(resolve => setTimeout(resolve, 500));

  await job.updateProgress({
    total: totalRecords,
    processed: totalRecords,
    percentage: 100,
  });

  return {
    success: true,
    operation: 'delete',
    entityType,
    deletedCount: totalRecords,
  };
}

/**
 * 数据转换处理器
 */
async function processBatchTransform(job: Job<BatchJobData>): Promise<any> {
  const { entityType, sourceData, options } = job.data;
  
  console.log(`[BatchProcessor] Starting batch transform for ${entityType}`);

  const totalRecords = sourceData?.length || 0;
  const transformedData: any[] = [];

  for (let i = 0; i < totalRecords; i++) {
    const record = sourceData![i];
    
    // 模拟数据转换
    const transformed = {
      ...record,
      transformed: true,
      transformedAt: new Date().toISOString(),
    };
    
    transformedData.push(transformed);

    if (i % 100 === 0) {
      await job.updateProgress({
        total: totalRecords,
        processed: i,
        percentage: Math.round((i / totalRecords) * 100),
      });
    }
  }

  return {
    success: true,
    operation: 'transform',
    entityType,
    transformedCount: transformedData.length,
    transformedData: transformedData.slice(0, 10), // 只返回前10条作为示例
  };
}

/**
 * 主批量处理器
 */
export async function batchProcessor(job: Job<BatchJobData>): Promise<any> {
  console.log(`[BatchProcessor] Processing job ${job.id}, operation: ${job.data.operation}`);

  switch (job.data.operation) {
    case 'update':
      return processBatchUpdate(job);
    case 'import':
      return processBatchImport(job);
    case 'delete':
      return processBatchDelete(job);
    case 'transform':
      return processBatchTransform(job);
    default:
      throw new Error(`Unknown batch operation: ${job.data.operation}`);
  }
}

/**
 * 注册批量处理器
 */
export function registerBatchProcessor(): void {
  queueManager.registerProcessor(
    QueueName.BATCH_OPERATION,
    batchProcessor,
    {
      onCompleted: (job, result) => {
        console.log(`[BatchProcessor] Batch operation completed:`, result);
      },
      onFailed: (job, err) => {
        console.error(`[BatchProcessor] Batch operation failed:`, err);
      },
      onProgress: (job, progress) => {
        console.log(`[BatchProcessor] Job ${job.id} progress: ${JSON.stringify(progress)}`);
      },
    }
  );
}

/**
 * 创建批量任务
 */
export async function createBatchJob(
  operation: BatchJobData['operation'],
  entityType: string,
  data: Partial<BatchJobData>,
  priority: JobPriority = JobPriority.NORMAL
): Promise<string> {
  const job = await queueManager.addJob(
    QueueName.BATCH_OPERATION,
    `batch-${operation}`,
    {
      operation,
      entityType,
      ...data,
    },
    {
      priority,
      timeout: 1800000, // 30分钟超时
    }
  );

  return job.id!;
}
