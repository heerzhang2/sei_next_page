# 构建 Next.js Docker 镜像并推送到阿里云

Write-Host "============================================" -ForegroundColor Green
Write-Host "构建 Docker 镜像" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$imageName = "sei-nextjs"
$aliyunRegistry = "crpi-lr1czs92lrq7vzhm.cn-shanghai.personal.cr.aliyuncs.com"
$tag = "latest"

# 构建镜像
docker build -t "${imageName}:${tag}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker 构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "登录阿里云容器镜像服务" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$credential = ConvertTo-SecureString "kjf78Yuu" -AsPlainText -Force
docker login --username=aliyun4071831155 --password-stdin $aliyunRegistry <<< "kjf78Yuu"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker 登录失败！" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "标记镜像" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

docker tag "${imageName}:${tag}" "${aliyunRegistry}/${imageName}:${tag}"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "推送镜像到阿里云" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

docker push "${aliyunRegistry}/${imageName}:${tag}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker 推送失败！" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "推送成功！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "镜像地址: ${aliyunRegistry}/${imageName}:${tag}" -ForegroundColor Yellow
Write-Host "`n现在可以在 K3s 服务器执行:" -ForegroundColor Cyan
Write-Host "kubectl apply -f k8s-nextjs-deployment.yaml" -ForegroundColor Cyan
