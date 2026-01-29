# Camunda Worker 部署到 k3s (Windows 版本)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Camunda Worker 部署到 k3s" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. 构建 Docker 镜像
Write-Host "[1/3] 构建 Docker 镜像..." -ForegroundColor Yellow
docker build -t camunda-worker:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker 镜像构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Docker 镜像构建成功" -ForegroundColor Green

# 2. 导出镜像到 k3s
Write-Host "[2/3] 导出并导入镜像到 k3s..." -ForegroundColor Yellow
docker save camunda-worker:latest | ssh root@192.168.109.66 "ctr -n k8s.io images import -"

if ($LASTEXITCODE -ne 0) {
    Write-Host "镜像导入失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 镜像导入 k3s 成功" -ForegroundColor Green

# 3. 应用 Kubernetes 配置
Write-Host "[3/3] 应用 Kubernetes 配置..." -ForegroundColor Yellow
kubectl apply -f k8s-deployment.yaml -n apisix

if ($LASTEXITCODE -ne 0) {
    Write-Host "Kubernetes 部署失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 部署成功！" -ForegroundColor Green

# 查看部署状态
Write-Host "查看部署状态:" -ForegroundColor Yellow
kubectl get pods -n apisix -l app=camunda-worker

Write-Host "========================================" -ForegroundColor Green
Write-Host "部署完成！查看日志:" -ForegroundColor Green
Write-Host "kubectl logs -n apisix -l app=camunda-worker -f" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
