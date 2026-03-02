# PWA 离线模式快速修复指南

## 问题摘要

**症状**: 添加 Nginx/APISIX 代理层后,关闭 Next.js 服务,访问 `https://192.168.171.3:9443/report/pwa` 返回 `502 Bad Gateway`

**期望**: 自动跳转到 `/report/~offline` 显示离线页面

**根本原因**: Service Worker 无法拦截从代理层返回的 502 错误

---

## 🚀 快速修复 (5分钟)

### Windows 用户

```powershell
# 以管理员身份运行 PowerShell,执行:
.\fix-pwa-offline-issue.ps1
```

### Linux/Mac 用户

```bash
# 添加执行权限
chmod +x fix-pwa-offline-issue.sh

# 执行脚本
./fix-pwa-offline-issue.sh
```

---

## ✅ 验证步骤

### 1. 在线预缓存

访问 PWA 管理页面并完成预缓存:
```
https://192.168.171.3:9443/report/pwa
```

### 2. 模拟离线

关闭 Next.js 服务:
```bash
kubectl scale deployment sei-nextjs --replicas=0 -n seirep
```

### 3. 测试离线访问

访问 PWA 页面:
```
https://192.168.171.3:9443/report/pwa
```

**期望结果**:
- ❌ **不应该看到**: `502 Bad Gateway`
- ✅ **应该看到**: 友好的错误提示页面,包含"🔄 立即重试"按钮

### 4. 恢复服务

```bash
kubectl scale deployment sei-nextjs --replicas=2 -n seirep
```

---

## 🔧 技术原理

### 问题流程 (修复前)

```
浏览器 → Nginx → APISIX → Next.js (关闭)
                  ↓
                返回 502
                  ↓
               浏览器显示 502 ❌
               (Service Worker 无法介入)
```

### 解决方案流程 (修复后)

```
浏览器 → Nginx → APISIX → Next.js (关闭)
                  ↓
                返回 502
                  ↓
            Nginx 拦截错误 (proxy_intercept_errors)
                  ↓
          返回友好的 HTML 页面 (含自动重试逻辑)
                  ↓
           浏览器显示错误页面 ✅
```

### 关键配置

**Nginx 配置要点**:
```nginx
# 1. 启用错误拦截
proxy_intercept_errors on;

# 2. 定义 502 错误处理
error_page 502 503 504 = @service_unavailable;

# 3. 自定义错误响应
location @service_unavailable {
    return 200 '<html>...友好的错误提示...</html>';
}
```

---

## 📁 相关文件

| 文件 | 说明 |
|------|------|
| `fix-pwa-offline-issue.ps1` | Windows 修复脚本 |
| `fix-pwa-offline-issue.sh` | Linux/Mac 修复脚本 |
| `nginx-apisix-with-pwa-support.conf` | 增强 Nginx 配置 |
| `apisix-pwa-route-config.json` | APISIX 路由配置 (可选) |
| `PWA-OFFLINE-TROUBLESHOOTING.md` | 完整故障排查文档 |
| `sw.tsx` | Service Worker 配置 (无需修改) |

---

## 🎯 三种解决方案对比

| 方案 | 难度 | 效果 | 推荐度 | 时间 |
|------|------|------|--------|------|
| **Nginx 层回退** | ⭐ | ⭐⭐⭐⭐⭐ | ✅ 推荐首选 | 5分钟 |
| **APISIX 健康检查** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 推荐中期 | 30分钟 |
| **Service Worker 优化** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⏰ 长期优化 | 2小时 |

---

## 💡 额外建议

### 1. 预缓存关键资源

确保以下资源始终被缓存:
- `/report/sw.js` - Service Worker 脚本
- `/report/~offline` - 离线页面
- `/report/pwa` - PWA 管理页面

### 2. 缩短连接超时

降低 `proxy_connect_timeout` 从 60s → 5s,快速失败

### 3. 启用 APISIX 健康检查

可选的优化,提供更好的服务状态监控

---

## ❓ 常见问题

### Q: 为什么不直接修复 Service Worker?

A: Service Worker 工作在浏览器层,无法拦截代理层已返回的 502 错误。Nginx 在网络层拦截更合适。

### Q: 修复后会影响正常访问吗?

A: 不会。只有在 Next.js 服务确实不可用时才会触发回退逻辑,正常访问不受影响。

### Q: 需要重启整个系统吗?

A: 不需要。只需重启 Nginx 容器即可,不影响 APISIX 和 Next.js。

### Q: 可以在 Kubernetes 中使用吗?

A: 可以。将配置应用到 Kubernetes 中的 Nginx Ingress 或使用 Nginx Sidecar。

---

## 📞 获取帮助

如果修复后问题仍然存在:

1. **查看 Nginx 日志**:
   ```bash
   docker logs nginx --tail 100
   ```

2. **查看 APISIX 日志**:
   ```bash
   docker logs apisix --tail 100
   ```

3. **检查 Service Worker 状态**:
   - Chrome: `chrome://serviceworker-internals/`
   - Firefox: `about:debugging#workers`

4. **详细排查**: 参考 `PWA-OFFLINE-TROUBLESHOOTING.md`

---

## 🎉 预期结果

修复成功后,离线访问将显示:

```
┌─────────────────────────────────┐
│        🔧                        │
│    服务暂时不可用                │
│  后端服务正在维护或暂时无法访问 ⟳ │
│                                 │
│  如果您之前访问过此应用,         │
│  浏览器可能会自动加载已缓存的内容。 │
│                                 │
│  [🔄 立即重试] [📊 PWA管理]      │
└─────────────────────────────────┘
```

而不是冷冰冰的:

```
502 Bad Gateway
openresty
Powered by APISIX
```

---

**最后更新**: 2026-02-26
**适用版本**: sei-nextjs v0.5.1+
