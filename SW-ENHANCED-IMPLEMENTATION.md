# Service Worker 激进离线策略 - 实施指南

## 📋 概述

这个增强版 Service Worker (SW) 配置实现了更激进的离线策略,即使后端服务不可用,也能提供友好的离线体验。

## 🎯 核心改进

### 1. **预构建的离线页面**
- 内嵌完整的 HTML,不依赖网络加载
- 包含自动重试逻辑和状态检测
- 美观的渐变背景和动画效果

### 2. **自定义 Fetch 拦截器**
- 最高优先级的请求拦截
- 对所有文档请求进行智能路由
- 2秒超时,快速回退到缓存

### 3. **增强的错误处理**
- 拦截 5xx 错误(502/503/504)
- 智能搜索所有缓存存储
- 多级回退策略

### 4. **激进的网络策略**
- 降低所有超时时间
- 优先使用缓存
- 网络失败时立即返回缓存内容

## 🚀 快速开始

### 步骤 1: 备份现有 Service Worker

```bash
# 备份现有的 sw.tsx
cp packages/mainProj/src/app/sw.tsx packages/mainProj/src/app/sw.tsx.backup
```

### 步骤 2: 替换为增强版

```bash
# 复制增强版配置
cp packages/mainProj/src/app/sw-enhanced.tsx packages/mainProj/src/app/sw.tsx
```

### 步骤 3: 重新构建项目

```bash
# 在项目根目录执行
cd packages/mainProj
yarn build
```

### 步骤 4: 重新部署

```bash
# 推送镜像并部署
./build-push-aliyun.ps1

# 如果使用 Kubernetes
kubectl apply -f k8s-nextjs-deployment.yaml -n seirep
```

### 步骤 5: 测试离线功能

```bash
# 1. 访问 PWA 页面,确保 SW 已注册
open https://192.168.171.3:9443/report/pwa

# 2. 关闭 Next.js 服务
kubectl scale deployment sei-nextjs --replicas=0 -n seirep

# 3. 刷新页面,应该看到离线页面
# 访问 https://192.168.171.3:9443/report/pwa

# 4. 恢复服务
kubectl scale deployment sei-nextjs --replicas=2 -n seirep
```

## 🔧 关键配置说明

### 1. 网络超时时间

```typescript
// 静态资源: 1秒
networkTimeoutSeconds: 1

// 字体文件: 2秒
networkTimeoutSeconds: 2

// 报告页面: 2秒
networkTimeoutSeconds: 2

// API 请求: 不缓存,不超时
handler: new NetworkOnly()
```

### 2. 自定义 Fetch 拦截器

```typescript
self.addEventListener('fetch', (event: FetchEvent) => {
  // 只处理文档请求 (HTML 页面)
  if (event.request.destination === 'document') {
    // 2秒超时 + 错误拦截
    const networkPromise = fetch(event.request.clone())
      .then(response => {
        // 拦截 5xx 错误
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response;
      })
      .catch(error => {
        // 返回离线页面
        return caches.match(event.request)
          .then(cachedResponse => cachedResponse || offlinePage);
      });

    event.respondWith(networkPromise);
  }
});
```

### 3. 增强的错误处理插件

```typescript
const enhancedErrorHandlingPlugin = {
  // 拦截 5xx 错误
  fetchDidSucceed: async ({ request, response }) => {
    if (response.status >= 500 && response.status <= 599) {
      // 视为请求失败,触发离线模式
      throw new Error(`Server error: ${response.status}`);
    }
    return response;
  },

  // 处理错误
  handlerDidError: async ({ request, error }) => {
    // 1. 返回缓存的离线页面
    // 2. 搜索所有缓存存储
    // 3. 返回空响应作为最后兜底
  },
};
```

### 4. 预构建的离线页面

```typescript
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html>
  <head>
    <style>
      /* 渐变背景、动画效果、响应式设计 */
    </style>
    <script>
      // 自动重试逻辑
      // 在线/离线状态监听
      // 定期网络检查
    </script>
  </head>
  <body>
    <!-- 友好的离线提示 -->
  </body>
</html>`;
```

## 📊 对比原版配置

| 特性 | 原版 | 增强版 |
|------|------|--------|
| 5xx 错误处理 | ❌ 不拦截 | ✅ 自动转为离线 |
| 文档请求超时 | 3-10秒 | ⚡ 2秒 |
| 离线页面 | 依赖缓存 | ✅ 内嵌 HTML |
| 自动重试 | ❌ 无 | ✅ 最多5次 |
| 网络状态检测 | ❌ 无 | ✅ 实时检测 |
| 缓存搜索 | 单一缓存 | ✅ 多缓存搜索 |
| UI 体验 | 基础 | ✅ 动画+渐变 |

## 🧪 测试场景

### 场景 1: 正常访问

```
访问 /report/pwa
  ↓
SW 已激活
  ↓
返回正常页面 ✅
```

### 场景 2: 后端关闭,首次访问

```
访问 /report/pwa
  ↓
Next.js 关闭 → APISIX 返回 502
  ↓
SW 拦截 502 错误
  ↓
检查缓存,无匹配
  ↓
返回预构建的离线页面 ✅
```

### 场景 3: 后端关闭,已访问过

```
访问 /report/pwa
  ↓
Next.js 关闭
  ↓
SW 从缓存返回页面 ✅
```

### 场景 4: 网络恢复

```
离线页面正在显示
  ↓
检测到网络恢复
  ↓
自动刷新页面
  ↓
返回正常页面 ✅
```

## ⚠️ 注意事项

### 1. 浏览器兼容性

- ✅ Chrome 80+
- ✅ Firefox 76+
- ✅ Safari 13.1+
- ⚠️ IE 不支持

### 2. 缓存大小

增强版策略会增加缓存使用量:
- 离线页面: ~15KB (内嵌)
- 预缓存资源: ~50-200MB
- 总计: 建议预留 300MB 空间

### 3. 性能影响

- **首次加载**: 可能稍慢 (预缓存)
- **后续访问**: 更快 (优先缓存)
- **离线访问**: 即时响应 (2秒超时)

### 4. Service Worker 更新

当部署新版本时:
1. 新 SW 会等待所有客户端关闭
2. 用户刷新页面后激活新版本
3. 旧版本自动清理

## 🐛 故障排查

### 问题 1: 离线页面未显示

**检查清单**:
- [ ] SW 是否已注册 (Chrome DevTools → Application → Service Workers)
- [ ] SW 是否已激活
- [ ] 是否有网络错误 (Console)
- [ ] 缓存是否正常 (Cache Storage)

**解决方案**:
```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    location.reload();
  });
});
```

### 问题 2: 仍然显示 502

**原因**: APISIX/Nginx 在 SW 介入前返回了 502

**解决方案**:
1. 检查 Nginx 配置是否启用了 `proxy_intercept_errors`
2. 降低 Nginx 的 `proxy_connect_timeout`
3. 参考 `nginx-apisix-with-pwa-support.conf`

### 问题 3: 缓存未命中

**检查**:
```javascript
// 在浏览器控制台执行
caches.keys().then(keys => {
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`缓存 ${key}: ${requests.length} 个请求`);
      });
    });
  });
});
```

## 📈 监控和日志

### 启用调试日志

```typescript
// sw.tsx 中已启用
const serwist = new Serwist({
  disableDevLogs: false, // 启用调试日志
  // ...
});
```

### 查看日志

**Chrome DevTools**:
1. 打开 Console
2. 过滤 `[SW]`
3. 查看详细日志

**示例日志**:
```
[SW][自定义Fetch] GET /report/pwa
[SW][智能路由] 处理请求: https://192.168.171.3:9443/report/pwa
[SW][自定义Fetch] 网络失败: Server error: 502
[SW][自定义Fetch] 使用缓存: /report/pwa
```

## 🔄 回滚方案

如果需要恢复原版配置:

```bash
# 1. 恢复备份
cp packages/mainProj/src/app/sw.tsx.backup packages/mainProj/src/app/sw.tsx

# 2. 重新构建
cd packages/mainProj
yarn build

# 3. 重新部署
./build-push-aliyun.ps1

# 4. 清除客户端 SW 缓存
# 在浏览器控制台执行:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
  });
});
location.reload();
```

## 📚 相关文档

- [Serwist 官方文档](https://serwist.pages.dev/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA 最佳实践](https://web.dev/progressive-web-apps/)

## 💡 进一步优化建议

1. **后台同步**: 使用 Background Sync API 离线时缓存操作
2. **增量更新**: 只更新变化的资源,减少缓存压力
3. **缓存优先策略**: 对静态资源使用 CacheFirst
4. **智能预加载**: 基于用户行为预加载资源

---

**创建日期**: 2026-02-26
**适用版本**: sei-nextjs v0.5.1+
**作者**: AI Assistant
