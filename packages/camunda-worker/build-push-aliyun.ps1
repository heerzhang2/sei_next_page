$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Building and Pushing camunda-worker to Aliyun" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 镜像配置
$LocalImage = "camunda-worker:latest"
$AliyunImage = "crpi-lr1czs92lrq7vzhm.cn-shanghai.personal.cr.aliyuncs.com/sei-rearend/camunda-worker:latest"

# 构建镜像
Write-Host "`nBuilding Docker image..." -ForegroundColor Yellow
docker buildx build --platform linux/amd64 -t $LocalImage --load .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

# 标记镜像
Write-Host "`nTagging image for Aliyun..." -ForegroundColor Yellow
docker tag $LocalImage $AliyunImage

# 推送镜像
Write-Host "`nPushing image to Aliyun..." -ForegroundColor Yellow
docker push $AliyunImage

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n============================================" -ForegroundColor Green
    Write-Host "Build and push completed successfully!" -ForegroundColor Green
    Write-Host "Image: $AliyunImage" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "`nPush failed!" -ForegroundColor Red
    exit 1
}
