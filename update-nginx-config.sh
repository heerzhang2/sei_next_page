#!/bin/bash

# 更新 Nginx 配置，添加 APISIX 管理端点代理

set -e  # 遇到错误立即退出

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 步骤 1: 备份 Nginx 配置文件 ==="
cp nginx-apisix.conf nginx-apisix.conf.admin.bak
echo "已备份原始 Nginx 配置文件到: nginx-apisix.conf.admin.bak"

echo ""
echo "=== 步骤 2: 更新 Nginx 配置文件 ==="
# 创建新的 Nginx 配置文件
cat > nginx-apisix.conf << 'EOF'
# Nginx 反向代理配置，用于终止 TLS 并转发到 APISIX

# APISIX 数据平面 upstream
upstream apisix_backend {
    server apisix:9080;
    keepalive 32;
}

# APISIX 管理平面 upstream
upstream apisix_admin_backend {
    server apisix:9180;
    keepalive 32;
}

# HTTPS 服务器配置
server {
    listen 9443 ssl http2;
    server_name localhost;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/apisix.crt;
    ssl_certificate_key /etc/nginx/ssl/apisix.key;

    # SSL 协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志配置
    access_log /var/log/nginx/apisix_access.log;
    error_log /var/log/nginx/apisix_error.log;

    # APISIX 管理端点
    location /apisix/admin {
        proxy_pass http://apisix_admin_backend;
        proxy_http_version 1.1;

        # 传递原始请求信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # 代理设置
    location / {
        proxy_pass http://apisix_backend;
        proxy_http_version 1.1;

        # 传递原始请求信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # 健康检查端点
    location /healthz {
        access_log off;
        return 200 "healthy
";
        add_header Content-Type text/plain;
    }
}
EOF

echo ""
echo "=== 步骤 3: 验证修改 ==="
echo "查找 upstream 配置："
grep -A 2 "upstream" nginx-apisix.conf

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
echo "=== 步骤 9: 测试 APISIX 管理端点 ==="
curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'

echo ""
echo "=== 完成！ ==="
echo "Nginx 已配置为在 9443 端口监听 HTTPS，并代理转发到 APISIX 的 HTTP 端口 9080 和管理端口 9180"
echo ""
echo "您可以使用以下命令测试配置："
echo "  curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'"
echo "  curl -k https://localhost:9443/healthz"
