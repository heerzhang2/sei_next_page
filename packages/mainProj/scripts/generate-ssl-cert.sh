#!/bin/bash

# 创建SSL证书目录
mkdir -p ssl

# 生成私钥
openssl genrsa -out ssl/localhost.key 2048

# 创建证书签名请求配置文件
cat > ssl/localhost.conf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = Development
OU = IT Department
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 192.168.0.100
IP.3 = 192.168.171.3
EOF

# 生成证书
openssl req -new -x509 -key ssl/localhost.key -out ssl/localhost.crt -days 365 -config ssl/localhost.conf -extensions v3_req

echo "SSL证书已生成在 ssl/ 目录下"
echo "请将 ssl/localhost.crt 添加到系统信任的根证书中"