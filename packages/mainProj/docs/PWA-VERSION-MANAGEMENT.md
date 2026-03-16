# PWA 版本管理和 Chunk 错误处理

## 问题说明

### 为什么每次 build 都需要重新缓存？

Next.js 使用基于内容的 hash 来命名 chunk 文件（如 `4073-09dac8f02426c933.js`）。即使代码没有修改，重新 build 也可能导致 hash 变化，原因包括：

1. **构建时间戳** - 内嵌在代码中
2. **模块顺序** - Webpack 打包顺序可能变化
3. **依赖更新** - node_modules 中的依赖可能有微小变化
4. **Next.js 内部变化** - 框架内部代码的变化

### 问题表现

重新 build 后，如果不重新缓存：
- 访问页面时出现 `ChunkLoadError: Loading chunk 4073 failed`
- 必须 Ctrl+Shift+R 硬刷新才能正常访问
- 用户体验很差

## 解决方案

### 1. 自动 Chunk 错误处理

`ChunkErrorHandler` 组件会：
- 监听全局 chunk 加载错误
- 自动提示用户"检测到新版本"
- 2秒后自动刷新页面
- 无需手动 Ctrl+Shift+R

### 2. 版本检测机制

`VersionChecker` 组件会：
- 每 5 分钟检查一次服务器版本
- 监听 Service Worker 更新事件
- 发现新版本时显示提示
- 提供"立即刷新"按钮

### 3. Service Worker 版本管理

Service Worker 会：
- 记录当前版本号
- 激活时通知所有客户端
- 自动清理旧缓存

## 使用指南

### 开发流程

1. **修改代码并 build**
   \`\`\`bash
   npm run build
   npm run start:https
   \`\`\`

2. **首次访问页面**
   - 页面正常加载（从服务器获取新资源）
   - Service Worker 在后台更新

3. **后续访问**
   - 如果遇到 chunk 错误，会自动刷新
   - 如果检测到新版本，会显示提示

### PWA 缓存管理

**何时需要重新缓存？**

- ✅ **修改了任何模板代码** - 必须重新缓存该模板
- ✅ **重新 build 后** - 建议重新缓存所有模板
- ✅ **用户报告页面错误** - 重新缓存可以解决大部分问题

**如何重新缓存？**

1. 访问 `/pwa` 页面
2. 点击"完全重置"清空旧缓存
3. 刷新页面
4. 点击"重新预缓存"或"自动更新"

### 最佳实践

1. **每次 build 后提醒用户**
   - 在部署后通知用户刷新页面
   - 或使用自动刷新机制

2. **使用 changeTime 机制**
   - 只在代码实际修改时更新 `changeTime`
   - 使用"自动更新"只更新变化的模板

3. **监控错误日志**
   - 关注 ChunkLoadError 的频率
   - 如果频繁出现，考虑优化缓存策略

## 技术细节

### Chunk Hash 变化原因

\`\`\`javascript
// 即使代码相同，这些因素会导致 hash 变化：
const buildTime = Date.now() // 构建时间戳
const moduleId = Math.random() // 模块 ID 可能变化
const dependencies = require('./package.json') // 依赖版本
\`\`\`

### 缓存键设计

\`\`\`typescript
// HTML 版本
/rep/*/INDPL_DJ/1/ConcAppendix?_v=html

// RSC 版本
/rep/*/INDPL_DJ/1/ConcAppendix?_v=rsc
\`\`\`

使用 `?_v=html/rsc` 而不是 `#html/#rsc`，因为 Cache API 不支持 fragment 作为缓存键。

## 常见问题

**Q: 为什么不能避免重新缓存？**

A: Next.js 的 chunk hash 机制是为了缓存失效（cache busting）。即使代码没变，hash 也可能变化。这是 Next.js 的设计，无法完全避免。

**Q: 能否只缓存变化的模板？**

A: 可以！使用 `changeTime` 机制和"自动更新"功能，只更新实际修改的模板。但 Next.js 的共享 chunks 可能仍然需要更新。

**Q: SPA 应用是否更简单？**

A: 是的！SPA 没有 RSC 复杂性，只有一个版本的页面，缓存管理简单得多。Next.js 的 RSC 架构增加了显著的复杂度。
