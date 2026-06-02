/**
 * 任务提取数据仓库
 * 使用 Prisma 直接操作数据库
 * 
 * 注意：当前实现直接将数据同步到核心业务表(Eqp, Isp, Detail, Task)
 * 不再使用 extracted_task 临时表
 */

import prisma from './prisma';

// 从统一类型定义文件导入
import type { ExtractedTask, ExtractedEquipment } from '../types/task-extraction';
export type { ExtractedTask, ExtractedEquipment };

// 重新导出同步服务的方法
export { syncTaskToCore, syncTaskGroup } from './task-sync-service';

// 为了保持兼容性，保留这些方法但直接调用同步服务
export async function saveExtractedTask(
  task: ExtractedTask,
  equipment: ExtractedEquipment | null,
  groupId: string
): Promise<{ success: boolean; taskId: string; error?: string }> {
  const { syncTaskToCore } = await import('./task-sync-service');
  const result = await syncTaskToCore(task, equipment, groupId);
  return {
    success: result.success,
    taskId: task.taskId,
    error: result.error,
  };
}

export async function saveExtractedTasksBatch(
  items: Array<{ task: ExtractedTask; equipment: ExtractedEquipment | null; groupId: string }>
): Promise<{ success: boolean; saved: number; failed: number }> {
  const { syncTaskGroup } = await import('./task-sync-service');
  
  // 按 groupId 分组
  const groupMap = new Map<string, { tasks: ExtractedTask[]; equipments: Map<string, ExtractedEquipment> }>();
  
  for (const item of items) {
    if (!groupMap.has(item.groupId)) {
      groupMap.set(item.groupId, { tasks: [], equipments: new Map() });
    }
    const group = groupMap.get(item.groupId)!;
    group.tasks.push(item.task);
    if (item.equipment) {
      group.equipments.set(item.task.eqpCod, item.equipment);
    }
  }
  
  let saved = 0;
  let failed = 0;
  
  for (const [groupId, { tasks, equipments }] of groupMap) {
    const result = await syncTaskGroup(tasks, equipments, groupId);
    saved += result.processed;
    failed += result.failed;
  }
  
  return { success: failed === 0, saved, failed };
}

export default {
  saveExtractedTask,
  saveExtractedTasksBatch,
  syncTaskToCore: async (...args: Parameters<typeof import('./task-sync-service').syncTaskToCore>) => {
    const { syncTaskToCore } = await import('./task-sync-service');
    return syncTaskToCore(...args);
  },
  syncTaskGroup: async (...args: Parameters<typeof import('./task-sync-service').syncTaskGroup>) => {
    const { syncTaskGroup } = await import('./task-sync-service');
    return syncTaskGroup(...args);
  },
};
