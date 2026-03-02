# Service Worker 增强版 - 快速参考

## 📦 文件清单

| 文件 | 用途 |
|------|------|
| `packages/mainProj/src/app/sw-enhanced.tsx` | 增强版 Service Worker 源码 |
| `SW-ENHANCED-IMPLEMENTATION.md` | 完整实施指南 |
| `deploy-enhanced-sw.ps1` | 自动化部署脚本 |

## 🚀 一键部署

### Windows PowerShell

```powershell
# 备份 + 替换配置
.\deploy-enhanced-sw.ps1

# 备份 + 替换 + 构建
.\deploy-enhanced-sw.ps1 -Build

# 备份 + 替换 + 构建 + 部署
.\deploy-enhanced-sw.ps1 -Build -Deploy

# 备份 + 替换 + 构建 + 部署 + 测试
.\deploy-enhanced-sw.ps1 -Build -Deploy -Test
```

### 手动部署

```bash
# 1. 备份现有配置
cp packages/mainProj/src/app/sw.tsx packages/mainProj/src/app/sw.tsx.backup

# 2. 替换为增强版
cp packages/mainProj/src/app/sw-enhanced.tsx packages/mainProj/src/app/sw.tsx

# 3. 构建项目
cd packages/mainProj
yarn build

# 4. 部署
cd ../..
./build-push-aliyun.ps1
```

## 🎯 核心特性

### ✅ 已实现

- [x] 预构建离线页面 (内嵌 HTML)
- [x] 自定义 Fetch 拦截器
- [x] 5xx 错误自动转离线
- [x] 智能缓存搜索 (多缓存存储)
- [x] 2秒超时快速回退
- [x] 自动重试逻辑 (最多5次)
- [x] 网络状态实时检测
- [x] 美观的离线 UI (动画+渐变)

### 🔧 超时配置

```typescript
静态资源: 1秒
字体文件: 2秒
报告页面: 2秒
API 请求: 无超时 (不缓存)
```

## 🧪 测试命令

### 1. 检查 Service Worker 状态

```javascript
// 浏览器控制台
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    console.log('Scope:', registration.scope);
    console.log('Active:', registration.active);
    console.log('State:', registration.active?.state);
  });
});
```

### 2. 手动注册 Service Worker

```javascript
navigator.serviceWorker.register('/report/sw.js')
  .then(registration => {
    console.log('SW 已注册:', registration);
  })
  .catch(error => {
    console.error('SW 注册失败:', error);
  });
```

### 3. 清除所有缓存

```javascript
caches.keys().then(cacheNames => {
  Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    .then(() => console.log('所有缓存已清除'));
});
```

### 4. 查看缓存内容

```javascript
caches.keys().then(cacheNames => {
  cacheNames.forEach(cacheName => {
    caches.open(cacheName).then(cache => {
      cache.keys().then(requests => {
        console.log(`缓存 ${cacheName}:`, requests);
      });
    });
  });
});
```

### 5. 测试离线模式

```bash
# 关闭 Next.js 服务
kubectl scale deployment sei-nextjs --replicas=0 -n seirep

# 访问 PWA 页面
open https://192.168.171.3:9443/report/pwa

# 恢复服务
kubectl scale deployment sei-nextjs --replicas=2 -n seirep
```

## 🔍 调试技巧

### 查看 Service Worker 日志

1. 打开 Chrome DevTools (F12)
2. 切换到 Console 标签
3. 过滤 `[SW]` 查看日志

### 查看网络请求

1. Chrome DevTools → Network 标签
2. 筛选 `Doc` 类型
3. 查看 `/report/pwa` 请求的响应

### 检查 Service Worker 详情

Chrome 访问: `chrome://serviceworker-internals/`

### 查看缓存存储

Chrome DevTools → Application → Cache Storage

## ⚠️ 常见问题速查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 仍显示 502 | Nginx/APISIX 未配置 | 应用 `nginx-apisix-with-pwa-support.conf` |
| 离线页面未显示 | SW 未激活 | 强制刷新 (Ctrl+Shift+R) |
| 缓存未命中 | 未预缓存 | 访问 `/report/pwa` 触发预缓存 |
| 旧版本仍在使用 | SW 未更新 | 手动注销: `registration.unregister()` |
| 离线页面丑陋 | CSS 未加载 | 使用内嵌样式 (已实现) |

## 🔄 版本切换

### 切换到增强版

```bash
cp packages/mainProj/src/app/sw-enhanced.tsx packages/mainProj/src/app/sw.tsx
```

### 回滚到原版

```bash
cp packages/mainProj/src/app/sw.tsx.backup packages/mainProj/src/app/sw.tsx
```

## 📊 对比表

| 特性 | 原版 | 增强版 |
|------|------|--------|
| **离线页面** | 从缓存加载 | 内嵌 HTML |
| **5xx 处理** | ❌ 不处理 | ✅ 自动转离线 |
| **超时时间** | 3-10秒 | 1-2秒 |
| **自动重试** | ❌ 无 | ✅ 最多5次 |
| **网络检测** | ❌ 无 | ✅ 实时 |
| **UI 效果** | 基础 | 动画+渐变 |
| **缓存搜索** | 单一 | 多缓存 |
| **错误处理** | 基础 | 智能多级 |

## 📞 获取帮助

1. **完整文档**: `SW-ENHANCED-IMPLEMENTATION.md`
2. **故障排查**: `PWA-OFFLINE-TROUBLESHOOTING.md`
3. **快速修复**: `fix-pwa-offline-issue.ps1`
4. **Serwist 文档**: https://serwist.pages.dev/

## ✅ 检查清单

部署后确认:

- [ ] Service Worker 已注册 (DevTools → Application)
- [ ] Service Worker 已激活
- [ ] 控制台有 `[SW]` 日志输出
- [ ] 访问 `/report/pwa` 显示正常页面
- [ ] 关闭 Next.js 后访问 `/report/pwa` 显示离线页面
- [ ] 恢复 Next.js 后自动刷新
- [ ] 离线页面 UI 正常显示 (渐变+动画)

---

**创建**: 2026-02-26
**版本**: 1.0
**状态**: ✅ 就绪
