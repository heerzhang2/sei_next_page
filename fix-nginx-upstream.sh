#!/bin/bash

# 修复 Nginx upstream 配置

set -e  # 遇到错误立即退出

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 步骤 1: 备份 Nginx 配置文件 ==="
cp nginx-apisix.conf nginx-apisix.conf.upstream.bak
echo "已备份原始 Nginx 配置文件到: nginx-apisix.conf.upstream.bak"

echo ""
echo "=== 步骤 2: 修改 upstream 配置 ==="
# 修改 upstream 配置，将主机名从 example-apisix-1 改为 apisix
sed -i 's/example-apisix-1:9080/apisix:9080/' nginx-apisix.conf

echo ""
echo "=== 步骤 3: 验证修改 ==="
echo "查找 upstream 配置："
grep -A 2 "upstream apisix_backend" nginx-apisix.conf

echo ""
echo "=== 步骤 4: 停止 Nginx 容器 ==="
docker-compose -f docker-compose-nginx-apisix.yml down

echo ""
echo "=== 步骤 5: 启动 Nginx 服务 ==="
docker-compose -f docker-compose-nginx-apisix.yml up -d

# 等待容器启动
echo "等待 Nginx 容器启动..."
sleep 5

echo ""
echo "=== 步骤 6: 检查 Nginx 容器状态 ==="
docker-compose -f docker-compose-nginx-apisix.yml ps

echo ""
echo "=== 步骤 7: 查看 Nginx 日志 ==="
docker logs nginx-apisix

echo ""
echo "=== 步骤 8: 测试 Nginx 健康检查端点 ==="
curl -k https://localhost:9443/healthz

echo ""
echo "=== 完成！ ==="
echo "Nginx 已配置为在 9443 端口监听 HTTPS，并代理转发到 APISIX 的 HTTP 端口 9080"
echo ""
echo "您可以使用以下命令测试配置："
echo "  curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'"
echo "  curl -k https://localhost:9443/healthz"
