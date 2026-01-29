# Camunda Worker + Page2PDF Server Sidecar 部署配置

## 部署架构

```
Pod: camunda-worker-pdf
├── Container: camunda-worker
│   └── 访问 page2pdf: http://localhost:9389
└── Container: page2pdf-server
    └── 端口: 9389
```

---

## 部署步骤

### 1. 构建镜像

```bash
# 构建 camunda-worker 镜像
cd c:\home\sei_next_page\packages\camunda-worker
docker buildx build --platform linux/amd64 -t camunda-worker:latest --load .

# 构建 page2pdf-server 镜像
cd c:\home\page2pdf-server\packages\server
build-docker-image.bat
```

### 2. 推送到镜像仓库（如果需要）

```bash
docker tag camunda-worker:latest your-registry/camunda-worker:latest
docker push your-registry/camunda-worker:latest

docker tag page2pdf-server:latest your-registry/page2pdf-server:latest
docker push your-registry/page2pdf-server:latest
```

### 3. 部署到 k3s

```bash
kubectl apply -f camunda-worker-pdf-pod.yaml
```

### 4. 查看状态

```bash
kubectl logs -f camunda-worker-pdf -c camunda-worker
kubectl logs -f camunda-worker-pdf -c page2pdf-server
```

---

## 配置说明

### 环境变量

#### camunda-worker 容器
| 变量 | 说明 | 默认值 |
|------|------|----------|
| `CAMUNDA_REST_ADDRESS` | Camunda API 地址 | `http://192.168.109.66:30000` |
| `CAMUNDA_AUTH_STRATEGY` | 认证策略 | `BASIC` |
| `CAMUNDA_BASIC_AUTH_USERNAME` | 用户名 | `demo` |
| `CAMUNDA_BASIC_AUTH_PASSWORD` | 密码 | `demo` |
| `PDF_SERVICE_URL` | PDF 服务地址 | `http://localhost:9389/api/pdf` (Sidecar 固定) |
| `RUSTFS_ENDPOINT_URL` | RustFS 地址 | `http://192.168.109.66:30900` |
| `RUSTFS_ACCESS_KEY_ID` | RustFS Access Key | `rustfsadmin` |
| `RUSTFS_SECRET_ACCESS_KEY` | RustFS Secret Key | `rustfsadmin` |
| `RUSTFS_BUCKETNAME` | 存储桶名称 | `ywmast` |

#### page2pdf-server 容器
| 变量 | 说明 | 默认值 |
|------|------|----------|
| `NODE_ENV` | 环境 | `production` |
| `NODE_USE_SYSTEM_CA` | 使用系统证书 | `1` |
| `PORT` | 端口 | `9389` |
| `CHROME_PATH` | Chrome 路径 | `/usr/bin/chromium-browser` |

---

## 网络配置

### Pod 内通信
- camunda-worker → page2pdf: `http://localhost:9389`

### Pod 外访问
- page2pdf 服务: 通过 Service 暴露（如需要）

---

## 数据持久化

如需持久化 PDF 临时文件，可挂载卷：

```yaml
volumes:
  - name: pdf-data
    emptyDir: {}

volumeMounts:
  - name: pdf-data
    mountPath: /app/data
```

---

## 扩展部署

如需部署多个 Worker 实例，创建多个 Pod 或使用 Deployment：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: camunda-worker-pdf
spec:
  replicas: 2
  template:
    # ... same as pod spec
```

---

## 故障排查

### 查看 Pod 状态
```bash
kubectl describe pod camunda-worker-pdf
```

### 查看日志
```bash
# camunda-worker 日志
kubectl logs camunda-worker-pdf -c camunda-worker

# page2pdf-server 日志
kubectl logs camunda-worker-pdf -c page2pdf-server
```

### 进入容器调试
```bash
# 进入 camunda-worker
kubectl exec -it camunda-worker-pdf -c camunda-worker -- sh

# 进入 page2pdf-server
kubectl exec -it camunda-worker-pdf -c page2pdf-server -- sh
```

---

## 清理

```bash
kubectl delete pod camunda-worker-pdf
```
