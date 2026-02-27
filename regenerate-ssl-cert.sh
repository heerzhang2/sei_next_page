#!/bin/bash

# 重新生成包含正确 IP 地址的 SSL 证书

set -e  # 遇到错误立即退出

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 定义 IP 地址
IP_ADDRESS="192.168.171.3"

echo "=== 步骤 1: 备份现有的 SSL 证书 ==="
mkdir -p ssl_backup
cp -r ssl/* ssl_backup/ 2>/dev/null || echo "没有找到现有的 SSL 证书"
echo "已备份现有的 SSL 证书到 ssl_backup/ 目录"

echo ""
echo "=== 步骤 2: 删除现有的 SSL 证书 ==="
rm -rf ssl
mkdir -p ssl

echo ""
echo "=== 步骤 3: 生成新的 SSL 证书 ==="
# 创建 OpenSSL 配置文件
cat > ssl/openssl.cnf << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = CN
ST = Beijing
L = Beijing
O = APISIX
OU = IT
CN = $IP_ADDRESS

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = $IP_ADDRESS
DNS.1 = localhost
DNS.2 = *.localhost
EOF

# 生成私钥
openssl genrsa -out ssl/apisix.key 2048

# 生成证书签名请求 (CSR)
openssl req -new -key ssl/apisix.key -out ssl/apisix.csr -config ssl/openssl.cnf

# 生成自签名证书
openssl x509 -req -days 365 -in ssl/apisix.csr -signkey ssl/apisix.key -out ssl/apisix.crt -extensions v3_req -extfile ssl/openssl.cnf

echo ""
echo "=== 步骤 4: 验证证书 ==="
openssl x509 -in ssl/apisix.crt -text -noout | grep -A 1 "Subject Alternative Name"

echo ""
echo "=== 步骤 5: 停止 Nginx 容器 ==="
docker-compose -f docker-compose-nginx-apisix.yml down

echo ""
echo "=== 步骤 6: 启动 Nginx 服务 ==="
docker-compose -f docker-compose-nginx-apisix.yml up -d

# 等待容器启动
echo "等待 Nginx 容器启动..."
sleep 5

echo ""
echo "=== 步骤 7: 检查 Nginx 容器状态 ==="
docker-compose -f docker-compose-nginx-apisix.yml ps

echo ""
echo "=== 步骤 8: 查看 Nginx 日志 ==="
docker logs nginx-apisix

echo ""
echo "=== 步骤 9: 测试 HTTPS 连接 ==="
curl -k https://$IP_ADDRESS:9443/healthz

echo ""
echo "=== 完成！ ==="
echo "已生成包含 IP 地址 $IP_ADDRESS 的 SSL 证书"
echo ""
echo "您可以使用以下命令测试配置："
echo "  curl -k https://$IP_ADDRESS:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'"
echo "  curl -k https://$IP_ADDRESS:9443/healthz"
echo ""
echo "注意：由于这是自签名证书，浏览器仍然会显示安全警告。"
echo "您需要在浏览器中手动信任此证书，或者使用受信任的 CA 签发的证书。"
