#!/bin/bash

# 检查 APISIX 配置文件

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 检查 APISIX 配置文件 ==="
cat apisix_conf/config.yaml | grep -A 2 -B 2 "ssl"

echo ""
echo "=== 检查 APISIX 容器日志 ==="
docker logs example-apisix-1 | tail -20

echo ""
echo "=== 检查 APISIX 容器端口 ==="
docker port example-apisix-1
