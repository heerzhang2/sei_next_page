/**
 * 数据迁移任务处理器
 * 处理部门数据、用户数据等迁移任务
 */

import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { QueueName, JobPriority } from '../bullmq-config';
import { queueManager } from '../queue-manager';
import { DIVISION_DATA, DEFAULT_UNIT_ID, DivisionData } from '@/lib/migration/division-data';
import { userSyncProcessor, UserSyncJobData } from './user-sync-processor';

// 迁移任务数据类型
export interface MigrationJobData {
  taskType: 'division' | 'user' | 'custom' | 'user_sync';
  unitId?: string;
  deptId?: string;
  deptName?: string;
  batchSize?: number;
  options?: Record<string, any>;
}

// 迁移进度类型
export interface MigrationProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  currentItem?: string;
  percentage: number;
}

/**
 * 部门数据迁移处理器
 * 根据 Division schema: id(BigInt, @id, AUTO_RANDOM), name, unit_id(BigInt, required)
 * id 由数据库自动生成，不主动提供
 */
async function processDivisionMigration(job: Job<MigrationJobData>): Promise<any> {
  const unitId = job.data.unitId || DEFAULT_UNIT_ID;
  const batchSize = job.data.batchSize || 10;
  
  console.log(`[MigrationProcessor] Starting division migration for unit ${unitId}`);

  // 更新任务状态为处理中
  await updateMigrationTask(job.id!, 'PROCESSING', { totalCount: DIVISION_DATA.length });

  const results = {
    total: DIVISION_DATA.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[],
  };

  // 分批处理
  for (let i = 0; i < DIVISION_DATA.length; i += batchSize) {
    const batch = DIVISION_DATA.slice(i, i + batchSize);
    
    for (const division of batch) {
      try {
        const unitIdBigInt = BigInt(unitId);
        
        // 检查是否已存在（通过 name + unit_id）
        const existing = await (prisma as any).division.findFirst({
          where: { 
            name: division.name,
            unit_id: unitIdBigInt,
          },
        });

        if (existing) {
          // 部门已存在，更新名称（如果不同）
          if (existing.name !== division.name) {
            await (prisma as any).division.update({
              where: { id: existing.id },
              data: { name: division.name },
            });
            console.log(`[MigrationProcessor] Division ${division.name} updated`);
            results.updated++;
          } else {
            console.log(`[MigrationProcessor] Division ${division.name} already exists, skipping`);
            results.skipped++;
          }
        } else {
          // 创建新记录 - id 由数据库自动生成 (AUTO_RANDOM)
          await (prisma as any).division.create({
            data: {
              name: division.name,
              unit_id: unitIdBigInt,
            },
          });
          console.log(`[MigrationProcessor] Division ${division.name} created`);
          results.created++;
        }

        // 更新进度
        const processed = results.created + results.updated + results.skipped + results.failed;
        const progress: MigrationProgress = {
          total: results.total,
          processed,
          succeeded: results.created + results.updated + results.skipped,
          failed: results.failed,
          currentItem: division.name,
          percentage: Math.round((processed / results.total) * 100),
        };

        await job.updateProgress(progress);
        await updateMigrationTask(job.id!, 'PROCESSING', { 
          processedCount: processed,
          failCount: results.failed,
        });

      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to process ${division.name}: ${error.message}`);
        console.error(`[MigrationProcessor] Failed to process division ${division.name}:`, error);
      }
    }

    // 每批处理完后短暂暂停，避免数据库压力过大
    if (i + batchSize < DIVISION_DATA.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 更新最终状态
  const finalStatus = results.failed === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
  await updateMigrationTask(job.id!, finalStatus, {
    processedCount: results.created + results.updated + results.skipped,
    failCount: results.failed,
    errorMessage: results.failed > 0 ? JSON.stringify(results.errors.slice(0, 5)) : null,
  });

  console.log(`[MigrationProcessor] Division migration completed:`, results);
  return results;
}

/**
 * 通用数据迁移处理器
 */
async function processCustomMigration(job: Job<MigrationJobData>): Promise<any> {
  const { options } = job.data;
  
  console.log(`[MigrationProcessor] Starting custom migration:`, options);

  // 这里可以实现自定义迁移逻辑
  // 例如：从外部 API 导入数据、Excel 文件导入等

  await job.updateProgress(50);
  
  // 模拟处理
  await new Promise(resolve => setTimeout(resolve, 2000));

  await job.updateProgress(100);

  return {
    success: true,
    message: 'Custom migration completed',
    options,
  };
}

/**
 * 更新迁移任务状态到数据库
 * 注：由于 migration_task 表没有 taskId 字段，我们通过创建时间和状态来定位最新记录
 */
async function updateMigrationTask(
  jobId: string,
  status: string,
  updates: {
    totalCount?: number;
    processedCount?: number;
    successCount?: number;
    failCount?: number;
    progress?: number;
    errorMessage?: string | null;
  }
): Promise<void> {
  try {
    // 找到最新的 PENDING 或 PROCESSING 状态的任务记录
    const latestTask = await (prisma as any).migration_task.findFirst({
      where: {
        taskType: 'DIVISION_MIGRATION',
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: { createTime: 'desc' },
    });

    if (latestTask) {
      // 构建更新数据，只包含 migration_task 表存在的字段
      const updateData: any = {
        status,
        updateTime: new Date(),
      };

      // 添加可选字段
      if (updates.totalCount !== undefined) updateData.totalCount = BigInt(updates.totalCount);
      if (updates.processedCount !== undefined) updateData.processedCount = BigInt(updates.processedCount);
      if (updates.successCount !== undefined) updateData.successCount = BigInt(updates.successCount);
      if (updates.failCount !== undefined) updateData.failCount = BigInt(updates.failCount);
      if (updates.progress !== undefined) updateData.progress = updates.progress;
      if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;

      // 计算进度
      if (updates.totalCount && updates.processedCount) {
        updateData.progress = Math.round((updates.processedCount / updates.totalCount) * 100);
      }

      // 完成时设置完成时间
      if (status === 'COMPLETED' || status === 'COMPLETED_WITH_ERRORS') {
        updateData.completeTime = new Date();
      }

      await (prisma as any).migration_task.update({
        where: { id: latestTask.id },
        data: updateData,
      });
    }
  } catch (error) {
    console.error('[MigrationProcessor] Failed to update migration task:', error);
  }
}

/**
 * 主迁移处理器
 */
export async function migrationProcessor(job: Job<MigrationJobData>): Promise<any> {
  console.log(`[MigrationProcessor] Processing job ${job.id}, type: ${job.data.taskType}`);

  switch (job.data.taskType) {
    case 'division':
      return processDivisionMigration(job);
    case 'custom':
      return processCustomMigration(job);
    case 'user_sync':
    case 'batch_user_sync':
      // 转发到用户同步处理器
      return userSyncProcessor(job as Job<any>);
    default:
      throw new Error(`Unknown migration task type: ${job.data.taskType}`);
  }
}

/**
 * 注册迁移处理器
 */
export function registerMigrationProcessor(): void {
  queueManager.registerProcessor(
    QueueName.DATA_MIGRATION,
    migrationProcessor,
    {
      onCompleted: (job, result) => {
        console.log(`[MigrationProcessor] Job ${job.id} completed successfully:`, result);
      },
      onFailed: (job, err) => {
        console.error(`[MigrationProcessor] Job ${job.id} failed:`, err);
        // 可以在这里发送通知（邮件、钉钉等）
      },
      onProgress: (job, progress) => {
        console.log(`[MigrationProcessor] Job ${job.id} progress:`, progress);
      },
    }
  );
}

/**
 * 创建部门迁移任务
 */
export async function createDivisionMigrationJob(
  unitId?: string,
  priority: JobPriority = JobPriority.NORMAL
): Promise<string> {
  // 先添加到 BullMQ 队列获取 jobId
  const job = await queueManager.addJob(
    QueueName.DATA_MIGRATION,
    'division-migration',
    {
      taskType: 'division',
      unitId: unitId || DEFAULT_UNIT_ID,
      batchSize: 5,
    },
    {
      priority,
      timeout: 300000, // 5分钟超时
    }
  );

  // 在数据库中创建任务记录（使用 job.id 作为标识）
  await (prisma as any).migration_task.create({
    data: {
      taskName: '部门数据初始化',
      taskType: 'DIVISION_MIGRATION',
      status: 'PENDING',
      totalCount: DIVISION_DATA.length,
      processedCount: 0,
      failCount: 0,
      createTime: new Date(),
      updateTime: new Date(),
    },
  });

  return job.id!;
}
