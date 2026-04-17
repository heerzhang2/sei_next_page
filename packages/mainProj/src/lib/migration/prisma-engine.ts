import { prisma } from '@/lib/prisma';
import type { 
  MigrationTask, 
  MigrationConfig, 
  MigrationProgress, 
  FieldMapping,
  DataTransformer 
} from './types';
import { MigrationStatus, LogLevel, RecordStatus, Prisma } from '@prisma/client';

// 扩展的迁移上下文，支持关联查询
export interface MigrationContext {
  // 已加载的实体缓存
  entityCache: Map<string, any>;
  // 已处理的记录（用于去重）
  processedKeys: Set<string>;
  // 统计信息
  stats: {
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  // 自定义数据
  customData: Map<string, any>;
}

// 高级迁移处理器接口
export interface MigrationHandler {
  // 数据转换前处理
  beforeTransform?(rawData: any, context: MigrationContext): Promise<any>;
  // 自定义数据转换
  transform?(rawData: any, context: MigrationContext): Promise<any>;
  // 关联实体查询
  resolveRelations?(data: any, context: MigrationContext): Promise<any>;
  // 保存前处理
  beforeSave?(data: any, context: MigrationContext): Promise<any>;
  // 自定义保存逻辑
  save?(data: any, context: MigrationContext): Promise<any>;
  // 保存后处理
  afterSave?(savedData: any, rawData: any, context: MigrationContext): Promise<void>;
}

export class PrismaMigrationEngine {
  private abortControllers = new Map<string, AbortController>();
  private handlers = new Map<string, MigrationHandler>();

  // 注册处理器
  registerHandler(taskType: string, handler: MigrationHandler) {
    this.handlers.set(taskType, handler);
  }

  // 创建迁移任务
  async createTask(name: string, config: MigrationConfig): Promise<MigrationTask> {
    const task = await prisma.migrationTask.create({
      data: {
        name,
        sourceUrl: config.sourceUrl,
        targetTable: config.targetTable,
        status: MigrationStatus.PENDING,
        config: config as any,
      },
    });

    return this.toMigrationTask(task);
  }

  // 开始迁移
  async startMigration(taskId: string, handlerType?: string): Promise<void> {
    const task = await prisma.migrationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new Error('Task not found');
    if (task.status === MigrationStatus.RUNNING) throw new Error('Task already running');

    const controller = new AbortController();
    this.abortControllers.set(taskId, controller);

    // 更新状态为运行中
    await prisma.migrationTask.update({
      where: { id: taskId },
      data: { 
        status: MigrationStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    // 记录日志
    await this.addLog(taskId, LogLevel.INFO, '迁移任务开始执行');

    try {
      const config = task.config as unknown as MigrationConfig;
      const handler = handlerType ? this.handlers.get(handlerType) : undefined;
      
      await this.executeMigration(taskId, config, handler, controller.signal);

      // 更新为完成状态
      await prisma.migrationTask.update({
        where: { id: taskId },
        data: { 
          status: MigrationStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await this.addLog(taskId, LogLevel.INFO, '迁移任务完成');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await prisma.migrationTask.update({
        where: { id: taskId },
        data: { 
          status: MigrationStatus.FAILED,
          errorMessage,
          completedAt: new Date(),
        },
      });

      await this.addLog(taskId, LogLevel.ERROR, `迁移失败: ${errorMessage}`);
      throw error;
    } finally {
      this.abortControllers.delete(taskId);
    }
  }

  // 取消迁移
  async cancelMigration(taskId: string): Promise<void> {
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
    }

    await prisma.migrationTask.update({
      where: { id: taskId },
      data: { 
        status: MigrationStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    await this.addLog(taskId, LogLevel.WARN, '迁移任务被取消');
  }

  // 执行迁移（核心逻辑）
  private async executeMigration(
    taskId: string,
    config: MigrationConfig,
    handler: MigrationHandler | undefined,
    signal: AbortSignal
  ): Promise<void> {
    // 1. 获取源数据
    await this.addLog(taskId, LogLevel.INFO, `开始从 ${config.sourceUrl} 获取数据`);
    const sourceData = await this.fetchSourceData(config, signal);
    
    await prisma.migrationTask.update({
      where: { id: taskId },
      data: { totalRecords: sourceData.length },
    });

    await this.addLog(taskId, LogLevel.INFO, `获取到 ${sourceData.length} 条记录`);

    // 2. 初始化上下文
    const context: MigrationContext = {
      entityCache: new Map(),
      processedKeys: new Set(),
      stats: { inserted: 0, updated: 0, skipped: 0, failed: 0 },
      customData: new Map(),
    };

    // 3. 预加载关联实体（如果有配置）
    if (config.preloadEntities) {
      await this.preloadEntities(config.preloadEntities, context);
    }

    // 4. 批处理
    const batchSize = config.batchSize || 100;
    
    for (let i = 0; i < sourceData.length; i += batchSize) {
      if (signal.aborted) {
        throw new Error('Migration cancelled');
      }

      const batch = sourceData.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sourceData.length / batchSize);

      await this.processBatch(taskId, batch, currentBatch, totalBatches, config, handler, context);

      // 更新进度
      await this.updateProgress(taskId, context);
    }

    await this.addLog(taskId, LogLevel.INFO, 
      `迁移完成: 插入 ${context.stats.inserted}, 更新 ${context.stats.updated}, ` +
      `跳过 ${context.stats.skipped}, 失败 ${context.stats.failed}`
    );
  }

  // 处理批次
  private async processBatch(
    taskId: string,
    batch: any[],
    currentBatch: number,
    totalBatches: number,
    config: MigrationConfig,
    handler: MigrationHandler | undefined,
    context: MigrationContext
  ): Promise<void> {
    await this.addLog(taskId, LogLevel.INFO, `处理批次 ${currentBatch}/${totalBatches}`);

    for (const rawData of batch) {
      try {
        // 步骤 1: 转换前处理
        let data = handler?.beforeTransform 
          ? await handler.beforeTransform(rawData, context)
          : rawData;

        // 步骤 2: 字段映射和转换
        data = handler?.transform 
          ? await handler.transform(data, context)
          : this.applyFieldMapping(data, config.fieldMapping, config.transformers);

        // 步骤 3: 去重检查
        if (config.deduplication?.enabled) {
          const key = this.generateDedupKey(data, config.deduplication.keyFields);
          if (context.processedKeys.has(key)) {
            context.stats.skipped++;
            continue;
          }
          context.processedKeys.add(key);
        }

        // 步骤 4: 关联实体解析
        if (handler?.resolveRelations) {
          data = await handler.resolveRelations(data, context);
        } else if (config.relations) {
          data = await this.resolveRelations(data, config.relations, context);
        }

        // 步骤 5: 保存前处理
        if (handler?.beforeSave) {
          data = await handler.beforeSave(data, context);
        }

        // 步骤 6: 保存数据
        let savedData: any;
        if (handler?.save) {
          savedData = await handler.save(data, context);
        } else {
          savedData = await this.saveToDatabase(data, config.targetTable, config.upsertConfig);
        }

        // 更新统计
        if (savedData._action === 'update') {
          context.stats.updated++;
        } else {
          context.stats.inserted++;
        }

        // 步骤 7: 保存后处理
        if (handler?.afterSave) {
          await handler.afterSave(savedData, rawData, context);
        }

      } catch (error) {
        context.stats.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        await this.addLog(taskId, LogLevel.ERROR, `处理记录失败: ${errorMsg}`, { rawData });
      }
    }
  }

  // 应用字段映射
  private applyFieldMapping(
    data: any, 
    fieldMapping: FieldMapping[],
    transformers?: DataTransformer[]
  ): any {
    const result: any = {};

    for (const mapping of fieldMapping) {
      let value = this.extractValue(data, mapping.sourceField);

      // 应用转换器
      if (transformers) {
        value = this.applyTransformers(value, mapping.targetField, transformers);
      }

      // 类型转换
      value = this.convertType(value, mapping.dataType);

      // 默认值
      if (value == null && mapping.defaultValue !== undefined) {
        value = mapping.defaultValue;
      }

      result[mapping.targetField] = value;
    }

    return result;
  }

  // 解析关联实体
  private async resolveRelations(
    data: any,
    relations: any[],
    context: MigrationContext
  ): Promise<any> {
    for (const rel of relations) {
      const { field, entityType, queryField, targetField } = rel;
      const queryValue = data[field];

      if (!queryValue) continue;

      // 先从缓存查找
      const cacheKey = `${entityType}:${queryValue}`;
      let entity = context.entityCache.get(cacheKey);

      if (!entity) {
        // 从数据库查询
        entity = await this.findEntity(entityType, queryField, queryValue);
        if (entity) {
          context.entityCache.set(cacheKey, entity);
        }
      }

      if (entity) {
        data[targetField || `${field}Id`] = entity.id;
      } else if (rel.required) {
        throw new Error(`关联实体未找到: ${entityType}.${queryField}=${queryValue}`);
      }
    }

    return data;
  }

  // 查找实体（使用 Prisma）
  private async findEntity(entityType: string, field: string, value: any): Promise<any> {
    const where: any = { [field]: value };

    switch (entityType) {
      case 'user':
        return await prisma.user.findFirst({ where });
      case 'department':
        return await prisma.department.findFirst({ where });
      case 'role':
        return await prisma.role.findFirst({ where });
      default:
        // 动态查询 migrated_records 表
        if (entityType.startsWith('migrated_')) {
          return await prisma.migratedRecord.findFirst({
            where: {
              ...where,
              dataType: entityType.replace('migrated_', ''),
            },
          });
        }
        return null;
    }
  }

  // 保存到数据库
  private async saveToDatabase(
    data: any,
    targetTable: string,
    upsertConfig?: any
  ): Promise<any> {
    // 使用 Prisma 的动态模型访问
    const model = (prisma as any)[targetTable];
    if (!model) {
      throw new Error(`未知的目标表: ${targetTable}`);
    }

    if (upsertConfig?.enabled && upsertConfig.keyFields?.length > 0) {
      // UPSERT 逻辑
      const where: any = {};
      for (const field of upsertConfig.keyFields) {
        where[field] = data[field];
      }

      const existing = await model.findFirst({ where });
      
      if (existing) {
        const updated = await model.update({
          where: { id: existing.id },
          data,
        });
        return { ...updated, _action: 'update' };
      }
    }

    const created = await model.create({ data });
    return { ...created, _action: 'create' };
  }

  // 预加载实体到缓存
  private async preloadEntities(entities: any[], context: MigrationContext): Promise<void> {
    for (const { entityType, field, values } of entities) {
      const where: any = { [field]: { in: values } };
      
      let results: any[] = [];
      switch (entityType) {
        case 'user':
          results = await prisma.user.findMany({ where });
          break;
        case 'department':
          results = await prisma.department.findMany({ where });
          break;
        case 'role':
          results = await prisma.role.findMany({ where });
          break;
      }

      for (const entity of results) {
        context.entityCache.set(`${entityType}:${entity[field]}`, entity);
      }
    }
  }

  // 从外部 API 获取数据
  private async fetchSourceData(config: MigrationConfig, signal: AbortSignal): Promise<any[]> {
    const response = await fetch(config.sourceUrl, {
      method: config.sourceMethod || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...config.sourceHeaders,
      },
      body: config.sourceBody ? JSON.stringify(config.sourceBody) : undefined,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 处理常见的 API 响应格式
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.records && Array.isArray(data.records)) return data.records;
    if (data.list && Array.isArray(data.list)) return data.list;
    if (data.items && Array.isArray(data.items)) return data.items;
    
    return [data];
  }

  // 辅助方法
  private extractValue(data: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private applyTransformers(value: any, field: string, transformers: DataTransformer[]): any {
    for (const t of transformers) {
      if (t.field !== field) continue;
      switch (t.type) {
        case 'uppercase': return String(value).toUpperCase();
        case 'lowercase': return String(value).toLowerCase();
        case 'trim': return String(value).trim();
        case 'replace': return t.params 
          ? String(value).replace(new RegExp(t.params.search, 'g'), t.params.replace)
          : value;
        default: return value;
      }
    }
    return value;
  }

  private convertType(value: any, dataType?: string): any {
    if (value == null) return null;
    switch (dataType) {
      case 'number': return Number(value);
      case 'boolean': return Boolean(value);
      case 'date': return new Date(value);
      case 'json': return typeof value === 'string' ? value : JSON.stringify(value);
      default: return String(value);
    }
  }

  private generateDedupKey(data: any, keyFields: string[]): string {
    return keyFields.map(f => data[f]).join('|');
  }

  private async addLog(taskId: string, level: LogLevel, message: string, details?: any): Promise<void> {
    await prisma.migrationLog.create({
      data: {
        taskId,
        level,
        message,
        details: details || undefined,
      },
    });
  }

  private async updateProgress(taskId: string, context: MigrationContext): Promise<void> {
    const total = context.stats.inserted + context.stats.updated + 
                  context.stats.skipped + context.stats.failed;
    
    await prisma.migrationTask.update({
      where: { id: taskId },
      data: {
        processedRecords: context.stats.inserted + context.stats.updated,
        failedRecords: context.stats.failed,
      },
    });
  }

  private toMigrationTask(task: any): MigrationTask {
    return {
      id: task.id,
      name: task.name,
      sourceUrl: task.sourceUrl,
      targetTable: task.targetTable,
      status: task.status.toLowerCase() as any,
      totalRecords: task.totalRecords,
      processedRecords: task.processedRecords,
      failedRecords: task.failedRecords,
      createdAt: task.createdAt,
      startedAt: task.startedAt || undefined,
      completedAt: task.completedAt || undefined,
      errorMessage: task.errorMessage || undefined,
      config: task.config as any,
    };
  }

  // 公共方法
  async getTask(taskId: string): Promise<MigrationTask | null> {
    const task = await prisma.migrationTask.findUnique({
      where: { id: taskId },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 100 } },
    });
    return task ? this.toMigrationTask(task) : null;
  }

  async getAllTasks(): Promise<MigrationTask[]> {
    const tasks = await prisma.migrationTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(t => this.toMigrationTask(t));
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.cancelMigration(taskId);
    await prisma.migrationTask.delete({ where: { id: taskId } });
  }

  // 获取任务日志
  async getTaskLogs(taskId: string, limit: number = 100) {
    return await prisma.migrationLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

// 导出单例
export const prismaMigrationEngine = new PrismaMigrationEngine();
