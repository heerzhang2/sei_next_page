# Camunda Worker Prisma 数据库直连方案

## 方案对比

### ❌ 方案1: Next.js 做 Worker（不推荐）
- Next.js 是短生命周期的 Serverless 进程
- 不适合长时间轮询 Camunda 获取任务
- 在 Vercel 等平台上会被频繁冷启动

### ✅ 方案2: Worker 直接用 Prisma（推荐）
- **安全**: 不暴露公共 API，直连数据库
- **性能**: 省去 HTTP 调用开销
- **事务**: 本地事务保证数据一致性
- **架构清晰**: Worker 专注数据处理

---

## 安装步骤

### 1. 安装依赖

```bash
cd packages/camunda-worker
yarn install
```

### 2. 配置环境变量

在 `.env.local` 或 `.env` 中添加数据库连接：

```env
# 数据库配置（Prisma 使用，复用 mainProj 的数据库）
DATABASE_URL=mysql://用户名:密码@主机:端口/数据库名

# 示例
DATABASE_URL=mysql://root:password@localhost:3306/sei_db
```

### 3. 生成 Prisma Client

```bash
# 在 camunda-worker 目录下运行
npx prisma generate --schema=../mainProj/prisma/schema.prisma
```

或者使用 package.json 中配置的快捷方式：

```bash
yarn prisma generate
```

### 4. 同步数据库表结构

如果 `extracted_task` 表不存在，需要在 mainProj 中执行迁移：

```bash
cd packages/mainProj
npx prisma migrate dev --name add_extracted_task
```

---

## 数据结构

### 任务组格式 (taskGroups)

```json
[
  {
    "groupId": "1606648",
    "taskIds": ["1606648"]
  },
  {
    "groupId": "1600928-1600929",
    "taskIds": ["1600928", "1600929"]
  }
]
```

### 保存的数据

任务数据保存到 `extracted_task` 表：

| 字段 | 说明 |
|------|------|
| taskId | 任务ID（唯一） |
| groupId | 所属组ID |
| eqpCod | 设备编码 |
| equipmentData | 设备台账JSON数据 |
| status | PENDING / PROCESSING / COMPLETED / ERROR |
| createTime | 创建时间 |

---

## 开发调试

### 启动 Worker

```bash
yarn dev
```

### 查看保存的数据

```bash
# 在 mainProj 中运行
npx prisma studio
```

---

## 生产部署

### 1. 构建镜像时生成 Prisma Client

```dockerfile
# Dockerfile 中添加
RUN npx prisma generate --schema=../mainProj/prisma/schema.prisma
```

### 2. K8s 配置中添加数据库连接字符串

```yaml
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: url
```

---

## 文件结构

```
camunda-worker/
├── src/
│   ├── lib/
│   │   ├── prisma.ts           # Prisma Client 单例
│   │   └── task-repository.ts  # 数据访问层
│   ├── task-extraction-worker.ts  # Worker 主逻辑
│   └── index.ts
├── prisma/
│   └── schema.prisma           # 指向 mainProj 的 schema
├── package.json
└── .env
```

---

## 注意事项

1. **数据库连接池**: Worker 是长期运行的服务，Prisma 会自动管理连接池
2. **事务处理**: 批量保存使用 `$transaction` 保证原子性
3. **重复处理**: 使用 `upsert` 避免重复插入同一任务
4. **错误处理**: 设备获取失败不影响任务保存
