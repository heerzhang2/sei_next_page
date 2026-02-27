#!/bin/bash

# 检查 docker-compose.yml 文件

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 检查 docker-compose.yml 文件 ==="
echo "查找 APISIX 服务的端口映射："
grep -A 20 "apisix:" docker-compose.yml | grep -A 10 "ports:"
