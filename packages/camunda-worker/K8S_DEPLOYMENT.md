# Camunda Worker k3s 部署指南

## 前置条件

1. **Docker** 已安装并在运行
2. **kubectl** 已配置连接到 k3s 集群
3. **SSH** 能访问 k3s Master 节点 (192.168.109.66)
4. 已部署的服务：
   - Camunda REST API (k8s Service: `camunda-rest.camunda.svc.cluster.local:8080`)
   - RustFS (k8s Service: `rustfs.rustfs.svc.cluster.local:9000`)
   - PDF Service (需要部署或修改为外部地址)

## 部署步骤

### Windows 环境

```powershell
cd c:/home/sei_next_page/packages/camunda-worker
.\deploy.ps1
```

### Linux 环境

```bash
cd /home/sei_next_page/packages/camunda-worker
chmod +x deploy.sh
./deploy.sh
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CAMUNDA_REST_ADDRESS` | Camunda REST API 地址 | `http://camunda-rest.camunda.svc.cluster.local:8080` |
| `CAMUNDA_AUTH_STRATEGY` | 认证策略 | `BASIC` |
| `CAMUNDA_BASIC_AUTH_USERNAME` | 用户名 | `demo` |
| `CAMUNDA_BASIC_AUTH_PASSWORD` | 密码 | `demo` |
| `RUSTFS_ENDPOINT_URL` | RustFS 地址 | `http://rustfs.rustfs.svc.cluster.local:9000` |
| `RUSTFS_BUCKETNAME` | 存储桶名称 | `ywmast` |
| `PDF_SERVICE_URL` | PDF 服务地址 | 需要配置 |

### PDF 服务配置

当前代码中 PDF 服务地址是 `http://localhost:9389`，在 k3s 中无法访问。有两个解决方案：

**方案1：将 PDF Service 也部署到 k3s**
```yaml
env:
- name: PDF_SERVICE_URL
  value: "http://pdf-service.pdf.svc.cluster.local:8080/api/pdf"
```

**方案2：使用外部 PDF 服务**
```yaml
env:
- name: PDF_SERVICE_URL
  value: "http://192.168.171.3:9389/api/pdf"  # 替换为实际地址
```

修改 `k8s-deployment.yaml` 中的 `PDF_SERVICE_URL` 环境变量。

## 验证部署

### 查看 Pod 状态
```bash
kubectl get pods -n apisix -l app=camunda-worker
```

### 查看日志
```bash
kubectl logs -n apisix -l app=camunda-worker -f
```

### 检查 Worker 是否连接到 Camunda
```bash
kubectl logs -n apisix -l app=camunda-worker | grep "启动Worker"
```

## 常见问题

### 1. 镜像导入失败
确保 k3s 节点的 containerd 服务正常：
```bash
ssh root@192.168.109.66
systemctl status containerd
```

### 2. Worker 无法连接 Camunda
检查 Camunda Service 是否存在：
```bash
kubectl get svc -n camunda
```

### 3. Worker 无法连接 RustFS
检查 RustFS Service 是否存在：
```bash
kubectl get svc -n rustfs
```

### 4. Pod 频繁重启
查看详细日志：
```bash
kubectl logs -n apisix -l app=camunda-worker --previous
kubectl describe pod -n apisix -l app=camunda-worker
```

## 更新部署

修改代码后重新部署：
```powershell
# Windows
.\deploy.ps1

# Linux
./deploy.sh
```

或手动执行：
```bash
docker build -t camunda-worker:latest .
docker save camunda-worker:latest | ssh root@192.168.109.66 "ctr -n k8s.io images import -"
kubectl rollout restart deployment/camunda-worker -n apisix
```

## 扩容

增加 Worker 副本数：
```bash
kubectl scale deployment/camunda-worker --replicas=3 -n apisix
```

注意：当前代码有锁文件机制，多副本可能会有冲突。需要移除锁文件逻辑才能支持多副本。
