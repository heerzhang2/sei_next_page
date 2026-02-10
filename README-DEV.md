# Next.js 开发模式指南（Live Server + 反向代理）

## 架构说明

```
用户浏览器 → https://192.168.109.66:30443/report
                   ↓
            nginx-proxy (K3s)
                   ↓
            dev-proxy (nginx in K3s)
                   ↓
            http://192.168.171.3:3000
                   ↓
            Next.js Dev Server (Windows 本地)
```

## 快速开始

### 1. 部署开发代理到 K3s

```batch
deploy-dev-proxy.bat
```

或者在 K3s 服务器上执行：
```bash
kubectl apply -f k8s-dev-proxy.yaml -n seirep
```

### 2. 在 Windows 本地启动开发服务器

```batch
start-dev.bat
```

或直接运行：
```bash
npm run dev
```

### 3. 访问应用

在浏览器中打开：
```
https://192.168.109.66:30443/report
```

## 管理命令

### 查看 Proxy 状态
```bash
kubectl get pods -n seirep -l app=dev-proxy
kubectl logs -n seirep -l app=dev-proxy
```

### 重启 Proxy
```bash
kubectl rollout restart deployment/dev-proxy -n seirep
```

### 删除开发代理
```bash
kubectl delete -f k8s-dev-proxy.yaml -n seirep
```

### 切换回生产环境
```bash
# 删除开发代理
kubectl delete -f k8s-dev-proxy.yaml -n seirep

# 更新 APISIX 路由指向生产服务
# （需要手动配置 APISIX upstream 指向 sei-nextjs:3765）
```

## 注意事项

1. **Windows 防火墙**：确保端口 3000 允许入站连接
   - 控制面板 → Windows Defender 防火墙 → 高级设置
   - 入站规则 → 新建规则 → 端口 → 3000 → 允许连接

2. **网络连接**：确保 K3s 节点能访问 192.168.171.3:3000
   ```bash
   curl http://192.168.171.3:3000
   ```

3. **热更新**：代码修改后，Next.js 会自动重新编译，浏览器会自动刷新

4. **端口冲突**：确保 Windows 上没有其他应用占用 3000 端口

## 故障排查

### 问题1：无法访问应用
```bash
# 检查 dev-proxy 是否运行
kubectl get pods -n seirep -l app=dev-proxy

# 检查日志
kubectl logs -n seirep -l app=dev-proxy

# 检查 Windows 防火墙
netsh advfirewall firewall show rule name=all | findstr 3000
```

### 问题2：502 Bad Gateway
- 确认 Windows 上的 Next.js 开发服务器正在运行
- 确认 K3s 能访问 192.168.171.3:3000

### 问题3：修改代码不生效
- 确认是开发模式（development）
- 检查浏览器控制台是否有错误
- 重启 Next.js 开发服务器
