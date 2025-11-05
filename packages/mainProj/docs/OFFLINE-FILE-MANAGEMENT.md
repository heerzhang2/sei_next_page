# 离线文件管理系统

## 概述

为 PWA 应用提供完整的离线文件上传和删除支持，确保用户在网络不稳定或离线状态下的操作不会丢失。

## 核心功能

### 1. 文件操作队列

- **持久化存储**: 使用 IndexedDB 存储待处理的文件操作
- **自动重试**: 失败的操作自动重试（最多3次）
- **状态跟踪**: pending → processing → completed/failed
- **类型支持**: 上传和删除两种操作类型

### 2. Uppy 状态持久化

- **状态快照**: 保存 Uppy 实例的完整状态（文件、进度、元数据）
- **自动恢复**: 用户返回编辑器时自动恢复未完成的上传
- **文件数据**: 保存文件的 ArrayBuffer 数据，支持离线重新上传

### 3. 自动处理机制

- **在线检测**: 监听网络状态变化
- **自动处理**: 网络恢复时自动处理队列中的操作
- **进度通知**: Toast 提示操作成功或失败

## 使用方法

### 基础用法

\`\`\`typescript
import { useOfflineUppyUpload } from "@/report/hook/useOfflineUppyUpload"

function MyEditor() {
const [uploadDom] = useOfflineUppyUpload({
repId: rep?.id!,
maxFile: 5,
onFinish: (files, deleted) => {
// 处理上传完成
console.log("Files:", files)
},
storeObj: storage?.pictures || [],
liveDays: 10,
hash: "FxDiagram_pf",
maxSize: 6,
})

return <div>{uploadDom}</div>
}
\`\`\`

### 监控队列状态

\`\`\`typescript
import { useOfflineFileOperations } from "@/hooks/useOfflineFileOperations"

function QueueMonitor() {
const { pendingOperations, isProcessing, processQueue } = useOfflineFileOperations()

return (
<div>
<p>待处理操作: {pendingOperations.length}</p>
<p>处理中: {isProcessing ? '是' : '否'}</p>
<button onClick={processQueue}>手动处理队列</button>
</div>
)
}
\`\`\`

## 工作流程

### 上传流程

1. 用户选择文件 → Uppy 添加文件
2. 用户点击上传 → 保存 Uppy 状态到 IndexedDB
3. 如果在线 → 直接上传
4. 如果离线 → 添加到操作队列
5. 网络恢复 → 自动从队列处理上传
6. 上传成功 → 更新 storageContext，清除队列和状态

### 删除流程

1. 用户点击删除 → 添加删除操作到队列
2. 如果在线 → 立即执行删除
3. 如果离线 → 等待网络恢复
4. 网络恢复 → 自动处理删除操作
5. 删除成功 → 更新 storageContext，清除队列

### 状态恢复流程

1. 用户离开编辑器 → 保存 Uppy 状态
2. 用户返回编辑器 → 加载保存的状态
3. 恢复文件列表 → 用户可以继续操作
4. 如果有待处理操作 → 显示提示

## 数据结构

### FileOperation

\`\`\`typescript
{
id: string                    // 唯一ID
type: 'upload' | 'delete'     // 操作类型
repId: string                 // 报告ID
subrid?: string               // 子报告ID
hash: string                  // 编辑器标识
status: 'pending' | 'processing' | 'failed' | 'completed'
retryCount: number            // 重试次数
file?: {                      // 上传文件数据
name: string
type: string
size: number
data: ArrayBuffer
}
deleteUrl?: string            // 删除文件URL
result?: any                  // 操作结果
}
\`\`\`

### UppyStateSnapshot

\`\`\`typescript
{
key: string                   // "repId:subrid:hash"
repId: string
hash: string
timestamp: number
files: Array<{                // 文件列表
id: string
name: string
type: string
size: number
data?: ArrayBuffer
progress?: number
}>
meta: any                     // Uppy 元数据
oldfiles?: any                // 已上传文件
}
\`\`\`

## 最佳实践

1. **及时清理**: 定期调用 `fileOperationsQueue.cleanup()` 清理旧数据
2. **错误处理**: 监听操作失败，提供重试或取消选项
3. **用户提示**: 显示待处理操作数量，让用户知道有未完成的操作
4. **数据同步**: 操作成功后立即更新 storageContext
5. **状态一致性**: 确保 Uppy 状态、队列状态和 storageContext 保持一致

## 注意事项

1. **文件大小限制**: ArrayBuffer 存储有大小限制，建议单文件不超过 50MB
2. **浏览器兼容性**: 需要 IndexedDB 支持
3. **存储配额**: 注意浏览器存储配额限制
4. **并发处理**: 队列按顺序处理，避免并发冲突
5. **网络状态**: 依赖 NetworkStatusContext 提供的网络状态

## 故障排除

### 文件无法恢复

- 检查 IndexedDB 是否正常
- 确认 repId 和 hash 是否正确
- 查看浏览器控制台日志

### 队列不自动处理

- 确认网络状态检测正常
- 检查 useOfflineFileOperations hook 是否正确使用
- 查看是否有错误阻止处理

### 操作重复执行

- 确保操作完成后正确清除队列
- 检查状态更新逻辑
- 避免多次调用 processQueue
