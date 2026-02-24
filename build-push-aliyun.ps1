# Build Next.js Docker image and push to Aliyun

Write-Host "============================================" -ForegroundColor Green
Write-Host "Building Docker image" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$imageName = "sei-nextjs"
$aliyunRegistry = "crpi-lr1czs92lrq7vzhm.cn-shanghai.personal.cr.aliyuncs.com"
$aliyunNamespace = "sei-rearend"
$tag = Get-Date -Format "yyyyMMdd-HHmmss"  # 使用时间戳作为标签

# Build image with production environment variables
docker build -t "${imageName}:${tag}" `
  --build-arg NEXT_PUBLIC_BASE_PATH=/report `
  --build-arg NEXT_PUBLIC_BACK_END=https://192.168.109.66:30443/api `
  --build-arg NEXT_PUBLIC_WEBSOCKET_END=wss://192.168.109.66:30443 `
  --build-arg NEXT_PUBLIC_OSS_ENDP=https://192.168.109.66:30443/minio `
  --build-arg NEXT_PUBLIC_TUS_UPLOAD_ENDP=https://192.168.109.66:30443/uploadTUS/ `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Login to Aliyun container registry" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$password = "kjf78Yuu"
$password | docker login --username=aliyun4071831155 --password-stdin $aliyunRegistry

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker login failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Tagging image" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

docker tag "${imageName}:${tag}" "${aliyunRegistry}/${aliyunNamespace}/${imageName}:${tag}"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Pushing image to Aliyun" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

docker push "${aliyunRegistry}/${aliyunNamespace}/${imageName}:${tag}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed!" -ForegroundColor Red
    exit 1
}

# 同时也推送到 latest 标签
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Tagging and pushing latest" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

docker tag "${aliyunRegistry}/${aliyunNamespace}/${imageName}:${tag}" "${aliyunRegistry}/${aliyunNamespace}/${imageName}:latest"
docker push "${aliyunRegistry}/${aliyunNamespace}/${imageName}:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Latest tag push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Push successful!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Image address: ${aliyunRegistry}/${aliyunNamespace}/${imageName}:${tag}" -ForegroundColor Yellow
Write-Host "Latest tag: ${aliyunRegistry}/${aliyunNamespace}/${imageName}:latest" -ForegroundColor Yellow
Write-Host "`nYou can now execute on K3s server:" -ForegroundColor Cyan
Write-Host "kubectl rollout restart deployment/sei-nextjs -n seirep" -ForegroundColor Cyan
