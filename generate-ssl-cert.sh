
#!/bin/bash

# 生成自签名 SSL 证书脚本

# 创建 ssl 目录
mkdir -p ssl

# 生成私钥和证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048   -keyout ssl/apisix.key   -out ssl/apisix.crt   -subj "/C=CN/ST=Beijing/L=Beijing/O=MyCompany/OU=IT/CN=localhost"

# 设置权限
chmod 600 ssl/apisix.key
chmod 644 ssl/apisix.crt

echo "SSL 证书生成完成！"
echo "证书文件: ssl/apisix.crt"
echo "私钥文件: ssl/apisix.key"
