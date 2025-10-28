# PWA 缓存键问题修复说明

## 问题描述

之前使用 URL fragment（`#html` 和 `#rsc`）来区分 HTML 和 RSC 版本的缓存，但 **Cache API 不支持 fragment 作为缓存键的一部分**。

### 问题表现

1. 第一次点击"重新预缓存"：创建 `#html` 结尾的缓存条目 ✓
2. 第二次点击"重新预缓存"：缓存条目变成 `#rsc` 结尾 ✗
3. 离线访问时显示 RSC 源码而不是 HTML 页面 ✗

### 根本原因

\`\`\`javascript
// ❌ 错误做法：使用 fragment
cache.put("https://example.com/page#html", htmlResponse)
cache.put("https://example.com/page#rsc", rscResponse)
// 结果：第二个 put 覆盖第一个，因为 Cache API 忽略 fragment！
\`\`\`

## 解决方案

使用**查询参数** `?_v=html` 和 `?_v=rsc` 代替 fragment：

\`\`\`javascript
// ✓ 正确做法：使用查询参数
cache.put("https://example.com/page?_v=html", htmlResponse)
cache.put("https://example.com/page?_v=rsc", rscResponse)
// 结果：两个不同的缓存键，不会互相覆盖！
\`\`\`

## 修改内容

### 1. `normalizeReportCacheKey` 函数

**之前**：
\`\`\`typescript
const suffix = isRSC ? "#rsc" : "#html"
const normalizedUrl = `${url.origin}${normalizedPath}${searchParams}${suffix}`
\`\`\`

**现在**：
\`\`\`typescript
searchParams.set("_v", isRSC ? "rsc" : "html")
const normalizedUrl = `${url.origin}${normalizedPath}?${searchParams.toString()}`
\`\`\`

### 2. 缓存验证

添加了验证逻辑，确保 HTML 和 RSC 两个版本都成功缓存：

\`\`\`typescript
if (htmlCached && rscCached) {
    console.log(`✓✓ 完整缓存: ${url} (HTML + RSC)`)
} else if (htmlCached || rscCached) {
    console.warn(`⚠️ 部分缓存: ${url}`)
}
\`\`\`

## 使用说明

### 重新缓存

修复后，需要**清空旧缓存并重新缓存**：

1. 访问 `/pwa` 页面
2. 点击"完全重置"清空所有旧缓存
3. 刷新页面
4. 点击"重新预缓存"

### 验证修复

在浏览器 DevTools 中检查缓存：

1. Application → Cache Storage → `report-pages-normalized`
2. 应该看到成对的条目：
   - `/rep/*/INDPL_DJ/1/ConcAppendix?_v=html`
   - `/rep/*/INDPL_DJ/1/ConcAppendix?_v=rsc`

### 离线测试

1. 缓存完成后，停止 Next.js 服务器
2. 访问报告页面
3. 应该显示正常的 HTML 页面，而不是 RSC 源码

## 技术细节

### Cache API 规范

根据 [Cache API 规范](https://w3c.github.io/ServiceWorker/#cache-interface)：

> The cache key is the request URL **without the fragment identifier**.

这意味着：
- `https://example.com/page#html` → 缓存键：`https://example.com/page`
- `https://example.com/page#rsc` → 缓存键：`https://example.com/page`
- 两者是**同一个键**，会互相覆盖！

### 为什么使用 `_v` 参数

- `_v` = version（版本标识）
- 短小精悍，不会与业务参数冲突
- 明确表示这是缓存版本区分参数

## 常见问题

### Q: 为什么不使用不同的 cache name？

A: 可以，但会增加复杂度：
- 需要维护两个 cache：`report-pages-html` 和 `report-pages-rsc`
- 缓存清理和管理更复杂
- 使用查询参数更简洁

### Q: `_v` 参数会影响服务器吗？

A: 不会，因为：
1. 这个参数只在 Service Worker 中使用
2. 实际的 fetch 请求不包含这个参数
3. 服务器看到的是原始 URL

### Q: 旧缓存会自动清理吗？

A: 不会，需要手动清理：
- 使用"完全重置"功能
- 或者在 DevTools 中手动删除旧缓存

## 总结

这个修复解决了 PWA 离线模式下显示 RSC 源码的问题，确保：

✓ HTML 和 RSC 版本分别缓存，不会互相覆盖  
✓ 离线访问时显示正常的 HTML 页面  
✓ 缓存键清晰明确，易于调试  
✓ 符合 Cache API 规范
