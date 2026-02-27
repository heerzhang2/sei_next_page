#!/bin/bash

# 检查 Docker 网络
echo "=== 所有 Docker 网络 ==="
docker network ls

echo ""
echo "=== 包含 'example' 的网络 ==="
docker network ls | grep example

echo ""
echo "=== 包含 'apisix' 的网络 ==="
docker network ls | grep apisix

echo ""
echo "=== 检查 APISIX 容器的网络配置 ==="
docker inspect example-apisix-1 | grep -A 20 "Networks"
