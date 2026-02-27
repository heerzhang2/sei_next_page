#!/bin/bash

# 检查 Nginx 配置文件

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 检查 Nginx 配置文件 ==="
cat nginx-apisix.conf

echo ""
echo "=== 检查 Nginx 容器内的配置文件 ==="
docker exec nginx-apisix cat /etc/nginx/conf.d/apisix.conf 2>/dev/null || echo "Nginx 容器未运行或配置文件不存在"
