#!/bin/bash
# =============================================
# 解决 Chrome ERR_CERT_INVALID 问题
# 生成符合 Chrome 标准的自签名证书
# =============================================

# 配置参数 (根据实际修改)
CERT_DIR="./certs"
SERVER_IP1="192.168.171.3"
SERVER_IP2="192.168.0.100"
DOMAIN="localhost"

# 创建证书目录
mkdir -p "${CERT_DIR}"
cd "${CERT_DIR}" || exit

# 生成 OpenSSL 配置文件
cat > "openssl.cnf" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
CN = ${DOMAIN}

[req_ext]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
IP.1 = ${SERVER_IP1}
IP.2 = ${SERVER_IP2}
EOF

# 1. 生成私钥和证书请求
openssl req -new -newkey rsa:2048 -nodes \
    -keyout "server.key" \
    -out "server.csr" \
    -config "openssl.cnf"

# 2. 生成自签名证书 (包含SAN扩展)
openssl x509 -req -days 365 \
    -in "server.csr" \
    -signkey "server.key" \
    -out "server.crt" \
    -extfile "openssl.cnf" \
    -extensions req_ext

# 3. 验证证书内容
echo -e "\n\033[1;32m证书验证:\033[0m"
openssl x509 -in "server.crt" -noout -text | grep -E "DNS:|IP Address"

# 4. 将证书加入系统信任 (Linux)
echo -e "\n\033[1;33m添加证书到系统信任(需要sudo权限):\033[0m"
sudo cp server.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# 提示信息
echo -e "\n\033[1;36m生成完成! 请重启浏览器访问 https://${SERVER_IP1}\033[0m"
