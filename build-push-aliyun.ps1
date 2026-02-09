# Build Next.js Docker image and push to Aliyun

Write-Host "============================================" -ForegroundColor Green
Write-Host "Building Docker image" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$imageName = "sei-nextjs"
$aliyunRegistry = "crpi-lr1czs92lrq7vzhm.cn-shanghai.personal.cr.aliyuncs.com"
$aliyunNamespace = "sei-rearend"
$tag = "latest"

# Build image
docker build -t "${imageName}:${tag}" .

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

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "Push successful!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Image address: ${aliyunRegistry}/${aliyunNamespace}/${imageName}:${tag}" -ForegroundColor Yellow
Write-Host "`nYou can now execute on K3s server:" -ForegroundColor Cyan
Write-Host "kubectl apply -f k8s-nextjs-deployment.yaml" -ForegroundColor Cyan
