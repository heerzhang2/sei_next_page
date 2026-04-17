// 数据迁移任务类型定义

export interface MigrationTask {
  id: string;
  name: string;
  sourceUrl: string;
  targetTable: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  config: MigrationConfig;
}

export interface MigrationConfig {
  // 数据源配置
  sourceType: 'api' | 'file' | 'database';
  sourceUrl: string;
  sourceMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  sourceHeaders?: Record<string, string>;
  sourceBody?: any;
  
  // 数据映射配置
  fieldMapping: FieldMapping[];
  
  // 目标表配置
  targetTable: string;
  
  // 批处理配置
  batchSize: number;
  
  // 转换配置
  transformers?: DataTransformer[];
  
  // 去重配置
  deduplication?: {
    enabled: boolean;
    keyFields: string[];
  };

  // 关联实体配置（类似 JPA @ManyToOne）
  relations?: EntityRelation[];

  // 预加载实体配置（批量查询优化）
  preloadEntities?: {
    entityType: string;
    field: string;
    values: any[];
  }[];

  // UPSERT 配置
  upsertConfig?: {
    enabled: boolean;
    keyFields: string[];
  };
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  defaultValue?: any;
}

export interface DataTransformer {
  field: string;
  type: 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'custom';
  params?: Record<string, any>;
}

// 关联实体配置
export interface EntityRelation {
  // 源数据中的字段
  field: string;
  // 目标实体类型（如 'user', 'department'）
  entityType: string;
  // 查询字段（默认为 'id'）
  queryField?: string;
  // 映射到目标数据的字段（默认为 field + 'Id'）
  targetField?: string;
  // 是否必须
  required?: boolean;
}

export interface MigrationProgress {
  taskId: string;
  status: MigrationTask['status'];
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  message?: string;
  timestamp: Date;
  // 详细统计
  stats?: {
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
  };
}

export interface MigrationLog {
  id: string;
  taskId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
  createdAt: Date;
}

// 迁移处理器配置
export interface MigrationHandlerConfig {
  // 处理器类型标识
  type: string;
  // 处理器描述
  description?: string;
  // 需要的关联实体
  requiredEntities?: string[];
  // 自定义配置
  options?: Record<string, any>;
}
