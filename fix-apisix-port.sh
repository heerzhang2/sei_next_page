#!/bin/bash

# 修复 APISIX 占用 9443 端口的问题

set -e  # 遇到错误立即退出

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 步骤 1: 检查 APISIX 配置文件 ==="
cat apisix_conf/config.yaml | grep -A 2 -B 2 "ssl"

echo ""
echo "=== 步骤 2: 停止 APISIX 容器 ==="
docker-compose stop apisix

echo ""
echo "=== 步骤 3: 修改 APISIX 配置，禁用 9443 端口 ==="
# 备份原始配置文件
cp apisix_conf/config.yaml apisix_conf/config.yaml.bak3
echo "已备份原始配置文件到: apisix_conf/config.yaml.bak3"

# 修改配置文件，注释掉 SSL 端口
sed -i 's/^ssl: 9443/# ssl: 9443  # 禁用，让 Nginx 使用 9443 端口/' apisix_conf/config.yaml

echo ""
echo "=== 步骤 4: 验证配置修改 ==="
cat apisix_conf/config.yaml | grep -A 2 -B 2 "ssl"

echo ""
echo "=== 步骤 5: 重新启动 APISIX ==="
docker-compose up -d

# 等待容器启动
echo "等待 APISIX 容器启动..."
sleep 10

echo ""
echo "=== 步骤 6: 检查 APISIX 容器状态 ==="
docker-compose ps

echo ""
echo "=== 步骤 7: 检查 APISIX 容器端口 ==="
docker port example-apisix-1

echo ""
echo "=== 步骤 8: 检查 9443 端口占用情况 ==="
# 使用 ss 命令替代 netstat
if command -v ss &> /dev/null; then
    ss -tulpn | grep 9443 || echo "9443 端口未被占用"
else
    echo "无法检查端口占用（ss 和 netstat 命令都不可用）"
fi

echo ""
echo "=== 步骤 9: 重启 Nginx 服务 ==="
docker-compose -f docker-compose-nginx-apisix.yml restart

# 等待容器启动
echo "等待 Nginx 容器启动..."
sleep 5

echo ""
echo "=== 步骤 10: 检查 Nginx 容器状态 ==="
docker-compose -f docker-compose-nginx-apisix.yml ps

echo ""
echo "=== 步骤 11: 查看 Nginx 日志 ==="
docker logs nginx-apisix

echo ""
echo "=== 完成！ ==="
echo "Nginx 已配置为在 9443 端口监听 HTTPS，并代理转发到 APISIX 的 HTTP 端口 9080"
echo ""
echo "您可以使用以下命令测试配置："
echo "  curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'"
echo "  curl -k https://localhost:9443/healthz"
