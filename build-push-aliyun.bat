@echo off
REM 构建 Next.js Docker 镜像并推送到阿里云

SET IMAGE_NAME=sei-nextjs
SET ALIYUN_REGISTRY=crpi-lr1czs92lrq7vzhm.cn-shanghai.personal.cr.aliyuncs.com
SET TAG=latest

echo ============================================
echo 构建 Docker 镜像
echo ============================================

docker build -t %IMAGE_NAME%:%TAG% .

if errorlevel 1 (
    echo Docker 构建失败！
    exit /b 1
)

echo ============================================
echo 登录阿里云容器镜像服务
echo ============================================

docker login --username=aliyun4071831155 --password=kjf78Yuu %ALIYUN_REGISTRY%

if errorlevel 1 (
    echo Docker 登录失败！
    exit /b 1
)

echo ============================================
echo 标记镜像
echo ============================================

docker tag %IMAGE_NAME%:%TAG% %ALIYUN_REGISTRY%/%IMAGE_NAME%:%TAG%

echo ============================================
echo 推送镜像到阿里云
echo ============================================

docker push %ALIYUN_REGISTRY%/%IMAGE_NAME%:%TAG%

if errorlevel 1 (
    echo Docker 推送失败！
    exit /b 1
)

echo ============================================
echo 推送成功！
echo ============================================
echo 镜像地址: %ALIYUN_REGISTRY%/%IMAGE_NAME%:%TAG%
echo.
echo 现在可以在 K3s 服务器执行:
echo kubectl apply -f k8s-nextjs-deployment.yaml
