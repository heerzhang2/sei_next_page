# PWA 离线功能使用指南

## 问题背景

Next.js 使用代码分割（code-splitting），每个路由都有独立的 JavaScript chunks，文件名包含 hash（如 `1701-8b66dffca0bcde26.js`）。每次 `build` 后，这些 hash 会改变，导致：

1. 旧缓存的 chunks 文件名与新 build 的不匹配
2. 如果没有访问过某个页面，该页面的 chunks 不会被缓存
3. 离线时访问未缓存的页面会失败，报 `no-response` 错误

## 解决方案

### 1. Service Worker 自动缓存策略

**位置**: `src/sw.ts`

**功能**:
- **CacheFirst 策略**: 所有 Next.js chunks (`/_next/static/chunks/`, webpack 文件) 优先使用缓存，缓存 30 天
- **CACHE_URLS 消息处理**: 接收来自 PWA 页面的批量缓存请求，自动缓存 HTML 和 RSC 两个版本
- **智能错误提示**: 当离线时缺少资源，会提示用户访问 `/pwa` 页面进行预缓存

**关键代码**:
\`\`\`typescript
// 1. Chunks 缓存策略
{
matcher: ({ url: { pathname }, sameOrigin }) =>
sameOrigin && (pathname.startsWith("/_next/static/chunks/") || ...),
handler: new CacheFirst({
cacheName: "next-chunks",
plugins: [
new ExpirationPlugin({
maxEntries: 500,
maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
}),
],
}),
}

// 2. 批量缓存处理
self.addEventListener("message", (event) => {
if (data?.type === "CACHE_URLS") {
event.waitUntil(cacheUrls(data.payload.urlsToCache))
}
})
\`\`\`

### 2. PWA 预缓存页面

**位置**: `src/app/(reprel)/pwa/page.tsx`

**功能**:
- **离线报告管理**: 从 `localStorage("offline-reports")` 读取需要离线的报告列表
- **模板配置读取**: 从每个模板的 `config.ts` 读取 `cacheUrls` 和 `changeTime`
- **缓存状态检查**: 对比模板更新时间和缓存时间，自动检测需要更新的模板
- **批量预缓存**: 一键缓存所有离线报告的所有页面（包括子路由）
- **自动预热提示**: 检测到超过 24 小时未预热缓存时，自动提示用户

**使用流程**:
1. 在其他页面将报告添加到 `localStorage("offline-reports")`
2. 访问 `/pwa` 页面
3. 系统自动检测需要缓存的模板
4. 点击"重新预缓存"按钮
5. 等待缓存完成（会显示进度）

### 3. 模板配置文件

**位置**: `src/app/rep/[repId]/{templateId}/{version}/config.ts`

**必需字段**:
\`\`\`typescript
export const cacheUrls = [
"/rep/sample/SLIDING_JJ/1/ALL",
"/rep/sample/SLIDING_JJ/1/Witness",
"/rep/sample/SLIDING_JJ/1/T1-1",
// ... 所有需要离线访问的子路由
]

export const changeTime = 1704067200000 // 模板最后修改时间的时间戳
\`\`\`

**重要**: 每次修改模板代码后，必须更新 `changeTime`，这样 PWA 页面才能检测到需要重新缓存。

## 使用步骤

### 首次部署后

1. **在线访问 `/pwa` 页面**
2. **点击"重新预缓存"按钮**
3. **等待所有模板缓存完成**
4. **现在可以离线使用了**

### 每次 Build 后

**方法一：手动预缓存（推荐）**
1. 部署新版本后，在线访问 `/pwa` 页面
2. 系统会自动检测到模板更新（如果你更新了 `changeTime`）
3. 点击"自动更新"按钮，只缓存有变化的模板
4. 或点击"重新预缓存"缓存所有模板

**方法二：自动预热提示**
- 用户访问 `/pwa` 页面时，如果超过 24 小时未预缓存
- 系统会自动弹出提示，询问是否立即预热缓存
- 点击"立即预热"即可

**方法三：访问关键页面**
- 由于使用了 `CacheFirst` 策略
- 在线访问任何页面时，该页面的 chunks 会自动缓存
- 但这需要访问每个页面，不如批量预缓存方便

## 离线模式工作原理

### 缓存层级

1. **Precache（预缓存）**:
    - Service Worker 安装时缓存的静态资源
    - 包括 `next.config.ts` 中 `additionalPrecacheEntries` 定义的路由

2. **Runtime Cache（运行时缓存）**:
    - **next-chunks**: Next.js 代码分割的 chunks，CacheFirst，30 天
    - **report-pages-normalized**: 报告页面，NetworkFirst，7 天
    - **cross-origin**: 跨域资源（如 GraphQL API），NetworkFirst，4 小时

3. **Manual Cache（手动缓存）**:
    - 通过 `/pwa` 页面的"重新预缓存"功能
    - 批量缓存所有配置的 URLs

### 缓存键标准化

报告页面使用标准化的缓存键，移除动态参数：
- `/rep/[repId]/SLIDING_JJ/1/Witness` → `/rep/*/SLIDING_JJ/1/Witness`
- 移除 `subrid`, `redId`, `from`, `original` 等查询参数
- 区分 HTML 和 RSC 版本（`#html` 和 `#rsc` 后缀）

这样不同的 `repId` 可以共享同一个缓存，大大减少缓存大小。

## 故障排除

### 问题：离线时页面显示错误

**原因**: 该页面的 chunks 未被缓存

**解决**:
1. 在线访问 `/pwa` 页面
2. 点击"重新预缓存"
3. 确保该页面的路由已添加到模板的 `config.ts` 的 `cacheUrls` 中

### 问题：Build 后离线功能失效

**原因**: 新 build 生成了新的 chunk 文件名，旧缓存失效

**解决**:
1. 部署后立即在线访问 `/pwa` 页面
2. 点击"重新预缓存"
3. 或者让用户在线访问一次所有关键页面

### 问题：缓存占用空间太大

**查看**: `/pwa` 页面右上角显示当前缓存大小

**清理**:
1. 点击"完全重置"按钮清除所有缓存
2. 或在浏览器设置中清除站点数据
3. Service Worker 会自动清理过期缓存（根据 `maxAgeSeconds`）

### 问题：Service Worker 未激活

**症状**: 页面提示"Service Worker 未激活"

**解决**:
1. 刷新页面（F5）
2. 如果仍未激活，硬刷新（Ctrl+Shift+R）
3. 检查浏览器控制台是否有 Service Worker 注册错误

## 最佳实践

1. **每次修改模板代码后更新 `changeTime`**: 这样 PWA 页面能自动检测更新
2. **在 `cacheUrls` 中包含所有子路由**: 确保离线时所有编辑器都能访问
3. **定期访问 `/pwa` 页面检查缓存状态**: 查看是否有模板需要更新
4. **部署后立即预缓存**: 避免用户在离线时遇到问题
5. **监控缓存大小**: 如果缓存过大，考虑减少 `maxEntries` 或 `maxAgeSeconds`

## 技术细节

### 为什么需要缓存 HTML 和 RSC 两个版本？

Next.js App Router 使用 React Server Components (RSC)：
- **HTML 版本**: 首次访问页面时加载
- **RSC 版本**: 客户端导航时加载（更快，只传输数据）

两个版本都需要缓存才能保证离线时的完整体验。

### 为什么使用 CacheFirst 而不是 NetworkFirst？

对于 JavaScript chunks：
- 文件名包含 hash，内容不变则文件名不变
- 使用 CacheFirst 可以完全避免网络请求，加载更快
- 当文件更新时，文件名会变化，自动加载新版本

对于报告页面：
- 使用 NetworkFirst 确保在线时总是获取最新数据
- 离线时回退到缓存版本

## 相关文件

- `src/sw.ts` - Service Worker 主文件
- `src/app/(reprel)/pwa/page.tsx` - PWA 管理页面
- `next.config.ts` - Serwist 配置
- `src/app/rep/[repId]/{templateId}/{version}/config.ts` - 模板配置
- `src/common/UserAuthed.tsx` - 离线模式认证跳过逻辑

## 环境变量

无需额外配置环境变量，Service Worker 自动工作。

## 浏览器兼容性

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 支持（iOS 11.3+）
- 不支持 Service Worker 的浏览器会自动降级为普通网页模式
