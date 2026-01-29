# Camunda Worker + PDF Service 一对一部署指南

## Sidecar 模式（推荐）

每个 Camunda Worker Pod 包含一个 PDF 服务实例，通过 `localhost` 直接访问，实现一对一绑定。

### 架构图

```
Pod 1 (camunda-worker-xxx)
├── Container: camunda-worker
│   └── 访问 http://localhost:9389/api/pdf
└── Container: pdf-service
    └── 监听 0.0.0.0:9389

Pod 2 (camunda-worker-yyy)
├── Container: camunda-worker
│   └── 访问 http://localhost:9389/api/pdf
└── Container: pdf-service
    └── 监听 0.0.0.0:9389

...
```

### 优势

- ✅ 一对一绑定：每个 Worker 都有独立的 PDF 服务实例
- ✅ 低延迟：通过 localhost 通信，无需网络开销
- ✅ 自动扩容：增加 replicas 自动创建对应的 PDF 服务实例
- ✅ 简单管理：Pod 级别的生命周期管理

## 部署步骤

### 前置条件

1. PDF 服务镜像已构建
2. Camunda Worker 镜像已构建
3. k3s 集群正常运行

### Windows 环境

```powershell
cd c:/home/sei_next_page/packages/camunda-worker
.\deploy-sidecar.ps1
```

### Linux 环境

```bash
cd /home/sei_next_page/packages/camunda-worker
chmod +x deploy-sidecar.sh
./deploy-sidecar.sh
```

## 扩容部署

### 部署 3 个 Worker+PDF 实例

```bash
kubectl apply -f k8s-deployment-scaled.yaml -n apisix
```

或直接扩容：

```bash
kubectl scale deployment/camunda-worker --replicas=3 -n apisix
```

### 扩容后验证

```bash
# 查看所有 Pod
kubectl get pods -n apisix -l app=camunda-worker

# 输出示例：
# NAME                              READY   STATUS    RESTARTS   AGE
# camunda-worker-xxxxx-abcde         2/2     Running   0          1m
# camunda-worker-yyyyy-fghij         2/2     Running   0          1m
# camunda-worker-zzzzz-klmno        2/2     Running   0          1m
# (每个 Pod 都有 2 个容器：camunda-worker + pdf-service)
```

## 配置说明

### 关键环境变量

| 变量名 | 说明 | 值 |
|--------|------|-----|
| `PDF_SERVICE_URL` | PDF 服务地址 | `http://localhost:9389/api/pdf` (同一 Pod) |
| `CAMUNDA_REST_ADDRESS` | Camunda API | `http://camunda-rest.camunda.svc.cluster.local:8080` |
| `RUSTFS_ENDPOINT_URL` | RustFS 地址 | `http://rustfs.rustfs.svc.cluster.local:9000` |

## 验证部署

### 1. 查看 Pod 状态

```bash
kubectl get pods -n apisix -l app=camunda-worker
```

每个 Pod 应该显示 `2/2` Ready（2 个容器）。

### 2. 查看 Worker 日志

```bash
kubectl logs -n apisix -l app=camunda-worker -c camunda-worker -f
```

### 3. 查看 PDF 服务日志

```bash
kubectl logs -n apisix -l app=camunda-worker -c pdf-service -f
```

### 4. 进入 Pod 测试 PDF 服务

```bash
# 进入 Worker 容器
kubectl exec -n apisix <pod-name> -c camunda-worker -- sh

# 测试 PDF 服务连通性
curl http://localhost:9389/health
```

## 更新部署

### 修改代码后重新部署

```powershell
# Windows
.\deploy-sidecar.ps1

# Linux
./deploy-sidecar.sh
```

### 仅重启 Pod（不重建镜像）

```bash
kubectl rollout restart deployment/camunda-worker -n apisix
```

## 资源配置

每个 Pod（Worker + PDF）的总资源：

| 容器 | CPU Request | CPU Limit | Memory Request | Memory Limit |
|------|-------------|-----------|----------------|--------------|
| camunda-worker | 250m | 500m | 256Mi | 512Mi |
| pdf-service | 500m | 1000m | 512Mi | 1Gi |
| **总计** | **750m** | **1500m** | **768Mi** | **1.5Gi** |

3 个副本总资源：~2.25 CPU, ~2.25 Gi Memory

## 常见问题

### 1. Pod 无法启动（CrashLoopBackOff）

查看容器日志：

```bash
# 查看 Worker 容器日志
kubectl logs -n apisix <pod-name> -c camunda-worker --previous

# 查看 PDF 服务日志
kubectl logs -n apisix <pod-name> -c pdf-service --previous
```

### 2. Worker 无法连接 PDF 服务

检查 PDF 服务是否正常运行：

```bash
kubectl exec -n apisix <pod-name> -c camunda-worker -- curl http://localhost:9389/health
```

### 3. 扩容后新 Pod 一直 Pending

检查集群资源是否足够：

```bash
kubectl describe nodes
kubectl top nodes
```

### 4. 如何只扩容 Worker 不扩容 PDF 服务？

Sidecar 模式下无法实现。如果需要，可以考虑：

**方案1**：独立的 PDF Service 部署多个实例，Worker 通过负载均衡访问

**方案2**：使用 DaemonSet 部署 PDF 服务，每节点一个实例

## 监控

### 查看 Pod 资源使用

```bash
kubectl top pods -n apisix -l app=camunda-worker
```

### 查看 Worker 作业处理情况

```bash
kubectl logs -n apisix -l app=camunda-worker -c camunda-worker | grep "新的流程"
```

## 清理部署

```bash
kubectl delete deployment/camunda-worker -n apisix
kubectl delete secret/rustfs-secret -n apisix
```
