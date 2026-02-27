#!/bin/bash

# 修复 APISIX SSL 端口配置

set -e  # 遇到错误立即退出

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 步骤 1: 检查 APISIX 配置文件 ==="
echo "查找所有包含 'ssl' 的行："
grep -n "ssl" apisix_conf/config.yaml || echo "未找到包含 'ssl' 的行"

echo ""
echo "查找所有包含 '9443' 的行："
grep -n "9443" apisix_conf/config.yaml || echo "未找到包含 '9443' 的行"

echo ""
echo "=== 步骤 2: 添加 SSL 端口配置 ==="
# 备份原始配置文件
cp apisix_conf/config.yaml apisix_conf/config.yaml.ssl.bak
echo "已备份原始配置文件到: apisix_conf/config.yaml.ssl.bak"

# 添加 SSL 端口配置，将其设置为空，禁用 SSL 端口
# 我们需要在配置文件中添加 ssl: 端口，或者修改现有的 ssl 配置

# 检查是否存在 ssl 配置
if grep -q "^ssl:" apisix_conf/config.yaml; then
    echo "找到 SSL 配置，将其注释掉"
    sed -i 's/^ssl:/# ssl:  # 禁用 SSL 端口/' apisix_conf/config.yaml
else
    echo "未找到 SSL 配置，添加禁用的 SSL 配置"
    # 在 node_listen 之后添加 ssl 配置
    sed -i '/^  node_listen:/a\  ssl:  # 禁用 SSL 端口' apisix_conf/config.yaml
fi

echo ""
echo "=== 步骤 3: 验证配置修改 ==="
echo "查找所有包含 'ssl' 的行："
grep -n "ssl" apisix_conf/config.yaml

echo ""
echo "=== 步骤 4: 检查 docker-compose.yml 文件 ==="
echo "查找 APISIX 服务的端口映射："
grep -A 10 "apisix:" docker-compose.yml | grep -A 5 "ports:"

echo ""
echo "=== 步骤 5: 修改 docker-compose.yml 文件，移除 9443 端口映射 ==="
# 备份原始 docker-compose.yml 文件
cp docker-compose.yml docker-compose.yml.ssl.bak
echo "已备份原始 docker-compose.yml 文件到: docker-compose.yml.ssl.bak"

# 移除 9443 端口映射
sed -i '/- "9443:9443"/s/^/#/' docker-compose.yml

echo ""
echo "=== 步骤 6: 验证 docker-compose.yml 修改 ==="
echo "查找 APISIX 服务的端口映射："
grep -A 10 "apisix:" docker-compose.yml | grep -A 5 "ports:"

echo ""
echo "=== 步骤 7: 重启 APISIX ==="
docker-compose down
docker-compose up -d

# 等待容器启动
echo "等待 APISIX 容器启动..."
sleep 10

echo ""
echo "=== 步骤 8: 检查 APISIX 容器状态 ==="
docker-compose ps

echo ""
echo "=== 步骤 9: 检查 APISIX 容器端口 ==="
docker port example-apisix-1

echo ""
echo "=== 步骤 10: 检查 9443 端口占用情况 ==="
# 使用 ss 命令替代 netstat
if command -v ss &> /dev/null; then
    ss -tulpn | grep 9443 || echo "9443 端口未被占用"
else
    echo "无法检查端口占用（ss 和 netstat 命令都不可用）"
fi

echo ""
echo "=== 步骤 11: 重启 Nginx 服务 ==="
docker-compose -f docker-compose-nginx-apisix.yml restart

# 等待容器启动
echo "等待 Nginx 容器启动..."
sleep 5

echo ""
echo "=== 步骤 12: 检查 Nginx 容器状态 ==="
docker-compose -f docker-compose-nginx-apisix.yml ps

echo ""
echo "=== 步骤 13: 查看 Nginx 日志 ==="
docker logs nginx-apisix

echo ""
echo "=== 完成！ ==="
echo "Nginx 已配置为在 9443 端口监听 HTTPS，并代理转发到 APISIX 的 HTTP 端口 9080"
echo ""
echo "您可以使用以下命令测试配置："
echo "  curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'"
echo "  curl -k https://localhost:9443/healthz"
