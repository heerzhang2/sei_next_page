# BullMQ 分布式任务队列系统

基于 BullMQ + Redis 的分布式任务调度系统，类似 Spring Boot 的 Quartz/XXL-JOB。

## 功能特性

- **多队列支持**: 数据迁移、报表生成、文件处理、批量操作、定时任务
- **任务优先级**: 紧急、高、普通、低、后台 五级优先级
- **失败重试**: 指数退避重试策略
- **进度追踪**: 实时任务进度更新
- **任务监控**: 可视化队列状态和任务管理
- **Worker 集群**: 支持多 Worker 并发处理

## 快速开始

### 1. 确保 Redis 已启动

```bash
# 检查 Redis 连接
redis-cli ping
```

### 2. 启动 Worker（方式一：集成在 Next.js 中）

API 路由会自动初始化处理器，无需额外操作。

### 3. 启动 Worker（方式二：独立进程）

```bash
# 开发环境
npx ts-node src/lib/queue/worker.ts

# 生产环境（使用 PM2）
pm2 start src/lib/queue/worker.ts --name queue-worker
```

### 4. 访问管理界面

打开 `https://192.168.171.3:9443/report/queue`

## API 使用

### 提交任务

```typescript
import { createDivisionMigrationJob, JobPriority } from '@/lib/queue';

// 创建部门迁移任务
const jobId = await createDivisionMigrationJob('unit-id', JobPriority.HIGH);

// 创建报表任务
import { createReportJob } from '@/lib/queue';
const jobId = await createReportJob('pdf', 'template-1', { param: 'value' });

// 创建批量任务
import { createBatchJob } from '@/lib/queue';
const jobId = await createBatchJob('import', 'User', { sourceData: [...] });
```

### 自定义任务处理器

```typescript
import { queueManager, QueueName, JobPriority } from '@/lib/queue';

// 注册处理器
queueManager.registerProcessor(
  QueueName.BATCH_OPERATION,
  async (job) => {
    // 处理任务
    await job.updateProgress(50);
    return { success: true };
  },
  {
    onCompleted: (job, result) => console.log('完成:', result),
    onFailed: (job, err) => console.error('失败:', err),
  }
);

// 添加任务
await queueManager.addJob(
  QueueName.BATCH_OPERATION,
  'my-job',
  { data: 'value' },
  { priority: JobPriority.HIGH }
);
```

## 队列配置

| 队列名称 | 用途 | 并发数 | 超时 |
|---------|------|-------|------|
| data-migration | 数据迁移 | 2 | 5分钟 |
| report-generation | 报表生成 | 3 | 10分钟 |
| file-processing | 文件处理 | 2 | 10分钟 |
| batch-operation | 批量操作 | 5 | 30分钟 |
| scheduled-task | 定时任务 | 1 | - |

## 环境变量

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```
