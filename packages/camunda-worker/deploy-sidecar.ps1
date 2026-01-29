# Camunda Worker + PDF Service Sidecar 部署 (Windows 版本)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Camunda Worker + PDF Service Sidecar 部署" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 1. 检查 PDF 服务镜像
Write-Host "[1/4] 检查 PDF 服务镜像..." -ForegroundColor Yellow
$pdfImages = docker images | Select-String "page2pdf-server"
if (-not $pdfImages) {
    Write-Host "PDF 服务镜像 page2pdf-server:latest 不存在！" -ForegroundColor Red
    Write-Host "请先构建 PDF 服务镜像，例如：" -ForegroundColor Yellow
    Write-Host "cd ../page2pdf-server && docker build -t page2pdf-server:latest ." -ForegroundColor Cyan
    exit 1
}
Write-Host "✓ PDF 服务镜像已存在" -ForegroundColor Green

# 2. 构建 Camunda Worker 镜像
Write-Host "[2/4] 构建 Camunda Worker 镜像..." -ForegroundColor Yellow
docker build -t camunda-worker:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Camunda Worker 镜像构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Camunda Worker 镜像构建成功" -ForegroundColor Green

# 3. 导出镜像到 k3s
Write-Host "[3/4] 导出并导入镜像到 k3s..." -ForegroundColor Yellow
docker save camunda-worker:latest page2pdf-server:latest | ssh root@192.168.109.66 "ctr -n k8s.io images import -"

if ($LASTEXITCODE -ne 0) {
    Write-Host "镜像导入失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 镜像导入 k3s 成功" -ForegroundColor Green

# 4. 应用 Kubernetes 配置
Write-Host "[4/4] 应用 Kubernetes 配置 (Sidecar 模式)..." -ForegroundColor Yellow
kubectl apply -f k8s-deployment-sidecar.yaml -n apisix

if ($LASTEXITCODE -ne 0) {
    Write-Host "Kubernetes 部署失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 部署成功！" -ForegroundColor Green

# 查看部署状态
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "查看 Pod 状态:" -ForegroundColor Yellow
kubectl get pods -n apisix -l app=camunda-worker

Write-Host "========================================" -ForegroundColor Green
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "查看 Worker 日志:" -ForegroundColor Yellow
Write-Host "kubectl logs -n apisix -l app=camunda-worker -c camunda-worker -f" -ForegroundColor Cyan
Write-Host "查看 PDF 服务日志:" -ForegroundColor Yellow
Write-Host "kubectl logs -n apisix -l app=camunda-worker -c pdf-service -f" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
