# PWA 离线模式故障排查与解决方案

## 问题描述

添加 Nginx/APISIX 代理层后,离线访问 `https://192.168.171.3:9443/report/pwa` 返回 502 Bad Gateway,而不是跳转到 `/report/~offline`

## 根本原因

### 请求流程对比

**直接访问 Next.js (正常工作)**:
```
用户请求 /report/pwa
  ↓
浏览器拦截
  ↓
Service Worker 检查网络
  ├─ 网络可用 → 转发到 Next.js
  └─ 网络不可用 → 返回缓存的 /report/~offline ✅
```

**通过 Nginx/APISIX (问题出现)**:
```
用户请求 /report/pwa
  ↓
Nginx 转发到 APISIX
  ↓
APISIX 尝试转发到 Next.js
  ↓
Next.js 不可用 → 返回 502
  ↓
502 错误直接返回给浏览器 ❌
  ↓
浏览器收到 502,Service Worker 无法介入
```

### 核心问题

**Service Worker 的工作机制依赖于成功的 HTTP 请求/响应循环**:

1. Service Worker 在 `fetch` 事件中拦截请求
2. 可以决定返回缓存或转发到网络
3. 但如果代理层在 Service Worker 介入之前就返回错误,SW 就没机会处理

## 解决方案

### 方案 1: Nginx 层的智能回退 (推荐 ⭐⭐⭐⭐⭐)

**原理**: 在 Nginx 检测到上游不可用时,返回一个包含重定向逻辑的 HTML 页面

**优点**:
- 实现简单
- 无需修改 APISIX 配置
- 对用户友好

**实现步骤**:

1. 使用提供的 `nginx-apisix-with-pwa-support.conf` 替换现有配置

2. 配置关键点:
   ```nginx
   # 关键: 允许拦截上游错误
   proxy_intercept_errors on;

   # 自定义 502 错误处理
   error_page 502 503 504 = @service_unavailable;

   # 返回包含重定向逻辑的 HTML
   location @service_unavailable {
       return 200 '<html>...自动重定向到离线页面...</html>';
   }
   ```

3. 重启 Nginx:
   ```bash
   docker-compose restart nginx
   ```

### 方案 2: APISIX 健康检查与故障转移 (推荐 ⭐⭐⭐⭐)

**原理**: 在 APISIX 配置主动健康检查,在服务不可用时快速失败

**优点**:
- 提高系统可靠性
- 快速检测服务状态
- 避免长时间等待

**实现步骤**:

1. 应用提供的 `apisix-pwa-route-config.json` 配置

2. 关键配置:
   ```json
   {
     "healthcheck": {
       "active": {
         "http_path": "/healthz",
         "timeout": 3,
         "unhealthy": {
           "interval": 2,
           "http_failures": 3
         }
       }
     },
     "timeout": {
       "connect": 5,
       "read": 30
     }
   }
   ```

3. 通过 APISIX Admin API 应用配置:
   ```bash
   curl http://127.0.0.1:9180/apisix/admin/routes/1 \
     -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' \
     -X PUT -d @apisix-pwa-route-config.json
   ```

### 方案 3: Service Worker 优化 (推荐 ⭐⭐⭐)

**原理**: 增强 Service Worker 的错误处理能力,即使在收到部分错误响应时也能提供回退

**实现步骤**:

1. 修改 `sw.tsx` 的 `fetch` 处理逻辑

2. 添加自定义 fetch 插件:
   ```typescript
   const aggressiveOfflinePlugin = {
     fetchWillFail: async ({ request }: { request: Request }) => {
       console.log(`[SW] 预期网络失败: ${request.url}`);

       // 对于文档请求,尝试返回离线页面
       if (request.destination === 'document') {
         const offlineResponse = await caches.match('/report/~offline');
         if (offlineResponse) {
           return offlineResponse;
         }

         // 构造离线响应
         return new Response(OFFLINE_FALLBACK_HTML, {
           headers: { 'Content-Type': 'text/html' }
         });
       }

       return undefined;
     }
   };
   ```

3. 在 Serwist 配置中添加该插件

### 方案 4: 客户端预缓存强化 (推荐 ⭐⭐⭐⭐)

**原理**: 确保所有关键资源都被预缓存,即使后续请求失败也能工作

**实现步骤**:

1. 在 PWA 页面(`/report/pwa`)加载时自动触发预缓存

2. 确保以下资源被缓存:
   - `/report/sw.js` - Service Worker 脚本
   - `/report/~offline` - 离线页面
   - `/report/pwa` - PWA 管理页面
   - 所有关键的 JavaScript/CSS 静态资源

3. 修改 `next.config.mjs` 添加预缓存配置

### 方案 5: 双端口架构 (不推荐,复杂)

**原理**: 提供两个访问端口
- 主端口: 正常访问,走 Nginx/APISIX
- 备用端口: 直接访问 Next.js,用于离线场景

**缺点**:
- 增加复杂度
- 不利于统一管理
- 需要用户手动切换

## 推荐实施顺序

### 快速修复 (15分钟)

1. **方案 1**: 应用 Nginx 配置
   - 无需重启整个系统
   - 立即缓解问题
   - 对现有系统影响最小

### 中期优化 (1-2天)

2. **方案 2**: 配置 APISIX 健康检查
   - 提升系统稳定性
   - 更快的服务恢复检测

3. **方案 4**: 强化预缓存策略
   - 确保关键资源始终可用
   - 改善离线体验

### 长期改进 (1周+)

4. **方案 3**: Service Worker 深度优化
   - 更智能的离线处理
   - 更好的用户体验

## 验证方法

### 测试离线功能

1. **正常访问测试**:
   ```bash
   curl https://192.168.171.3:9443/report/pwa
   # 应返回 PWA 管理页面
   ```

2. **离线访问测试**:
   ```bash
   # 1. 关闭 Next.js 容器
   kubectl scale deployment sei-nextjs --replicas=0 -n seirep

   # 2. 访问 PWA 页面
   curl https://192.168.171.3:9443/report/pwa

   # 期望: 返回 200 和重定向到离线页面的 HTML
   # 而不是 502 Bad Gateway
   ```

3. **浏览器测试**:
   - 在 Chrome DevTools 中打开 Network 面板
   - 选择 "Offline" 模式
   - 访问 `https://192.168.171.3:9443/report/pwa`
   - 应看到自动跳转到 `/report/~offline`

### 检查点

- [ ] Service Worker 已注册并激活
- [ ] `/report/sw.js` 可访问
- [ ] `/report/~offline` 页面已缓存
- [ ] 离线时返回正确的 HTML 而非 502
- [ ] 恢复网络后能正常刷新

## 常见问题

### Q1: 为什么 502 不会被 Service Worker 拦截?

**A**: Service Worker 拦截的是从浏览器发出的请求。当 Nginx 返回 502 时,这个响应已经从代理层返回给浏览器了,SW 的 `fetch` 事件监听器还没有机会介入。

### Q2: proxy_intercept_errors 是如何工作的?

**A**:
```nginx
proxy_intercept_errors on;  # 启用错误拦截
error_page 502 503 504 = @service_unavailable;  # 定义错误处理
```

当上游返回 502/503/504 时,Nginx 不直接传递这个错误,而是调用 `@service_unavailable` location,可以返回自定义的响应。

### Q3: 为什么需要预缓存 `/report/sw.js`?

**A**: Service Worker 脚本本身必须先被缓存,才能在离线时工作。如果 SW 脚本都无法加载,整个 PWA 功能就失效了。

## 参考资源

- [Serwist 文档](https://serwist.pages.dev/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Next.js PWA 文档](https://nextjs.org/docs/app/building-your-application/configuring/pwa)
- [Nginx proxy_intercept_errors](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_intercept_errors)
- [APISIX Health Check](https://apisix.apache.org/docs/apisix/plugins/healthcheck/)

## 联系支持

如问题持续存在,请提供以下信息:
1. 完整的错误日志 (Nginx + APISIX)
2. 浏览器控制台截图
3. Service Worker 状态截图 (chrome://serviceworker-internals/)
4. kubectl logs -n seirep <pod-name>
