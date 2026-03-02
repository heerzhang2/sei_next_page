#!/bin/bash

# PWA 离线模式快速修复脚本
# 解决: 添加 Nginx/APISIX 代理后离线访问返回 502 的问题

set -e

echo "=========================================="
echo "  PWA 离线模式故障修复脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "docker-compose-nginx-apisix.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}步骤 1: 备份现有 Nginx 配置${NC}"
if [ -f "nginx-apisix.conf" ]; then
    cp nginx-apisix.conf nginx-apisix.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "已备份到: nginx-apisix.conf.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo ""
echo -e "${GREEN}步骤 2: 应用新的 Nginx 配置 (支持 PWA 离线模式)${NC}"
if [ -f "nginx-apisix-with-pwa-support.conf" ]; then
    cp nginx-apisix-with-pwa-support.conf nginx-apisix.conf
    echo "✓ 新配置已应用"
else
    echo -e "${YELLOW}警告: nginx-apisix-with-pwa-support.conf 不存在,使用默认配置${NC}"
    # 如果不存在,创建基本配置
    cat > nginx-apisix.conf << 'EOF'
# PWA 增强版 Nginx 配置
upstream apisix_backend {
    server apisix:9080 max_fails=2 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 9443 ssl http2;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/apisix.crt;
    ssl_certificate_key /etc/nginx/ssl/apisix.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;

    # 关键配置: 启用错误拦截
    proxy_intercept_errors on;

    # Service Worker 文件 - 即使上游不可用也要尝试缓存
    location /report/sw.js {
        proxy_pass http://apisix_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
        proxy_intercept_errors on;
        error_page 502 503 504 =204;
    }

    # 离线页面路由
    location /report/~offline {
        proxy_pass http://apisix_backend;
        proxy_cache_valid 200 1d;
        proxy_intercept_errors on;
        error_page 502 503 504 = @offline_fallback;
    }

    # 离线回退
    location @offline_fallback {
        default_type text/html;
        return 200 '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>离线模式</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:2rem;background:#f5f5f5;color:#333;display:flex;align-items:center;justify-content:center;min-height:100vh}.container{max-width:500px;background:white;padding:2rem;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center}.icon{font-size:3rem;margin-bottom:1rem}h1{color:#e74c3c;margin:0 0 1rem 0}p{color:#666;margin:0 0 1rem 0}.btn{background:#3498db;color:white;border:none;padding:0.75rem 1.5rem;border-radius:4px;cursor:pointer;margin:0.5rem;font-size:1rem}.btn:hover{background:#2980b9}</style></head><body><div class="container"><div class="icon">📴</div><h1>您当前处于离线状态</h1><p>后端服务暂时不可用,但您仍可以访问已缓存的内容。</p><button class="btn" onclick="window.location.reload()">🔄 重试连接</button><button class="btn" onclick="window.location.href=\"/report/pwa\"">📊 PWA管理</button></div><script>if(navigator.onLine){window.addEventListener("offline",()=>window.location.reload())}else{window.addEventListener("online",()=>window.location.reload())}</script></body></html>';
    }

    # 主路由
    location / {
        proxy_pass http://apisix_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 降低连接超时,快速失败
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_buffering off;
        proxy_request_buffering off;

        # 关键: 拦截错误并自定义响应
        proxy_intercept_errors on;
        error_page 502 503 504 = @service_unavailable;
    }

    # 服务不可用时的处理
    location @service_unavailable {
        default_type text/html;
        charset utf-8;
        return 200 '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>服务暂时不可用</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:2rem;background:#f5f5f5;color:#333;display:flex;align-items:center;justify-content:center;min-height:100vh}.container{max-width:500px;background:white;padding:2rem;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:center}.icon{font-size:3rem;margin-bottom:1rem}h1{color:#e74c3c;margin:0 0 1rem 0}p{color:#666;margin:0 0 1rem 0}.info{background:#f8f9fa;padding:1rem;border-radius:4px;margin:1rem 0;text-align:left;font-size:0.9rem;color:#666}.btn{background:#3498db;color:white;border:none;padding:0.75rem 1.5rem;border-radius:4px;cursor:pointer;margin:0.5rem;font-size:1rem}.btn:hover{background:#2980b9}.spinner{border:3px solid #f3f3f3;border-top:3px solid #3498db;border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;display:inline-block;vertical-align:middle;margin-left:0.5rem}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style></head><body><div class="container"><div class="icon">🔧</div><h1>服务暂时不可用</h1><p>后端服务正在维护或暂时无法访问<span class="spinner"></span></p><div class="info">如果您之前访问过此应用,浏览器可能会自动加载已缓存的内容。</div><button class="btn" onclick="window.location.reload()">🔄 立即重试</button><button class="btn" onclick="window.location.href=\"/report/pwa\"">📊 PWA管理</button><p style="margin-top:2rem;font-size:0.9rem;color:#999;">如果问题持续存在,请联系技术支持</p></div><script>let retryCount=0;const maxRetries=3;const retryDelay=2000;function autoRetry(){if(retryCount<maxRetries){retryCount++;setTimeout(()=>{window.location.reload()},retryDelay)}}window.addEventListener("online",()=>{window.location.reload()});autoRetry()</script></body></html>';
    }

    # 健康检查
    location /healthz {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    echo "✓ 已创建基本配置"
fi

echo ""
echo -e "${GREEN}步骤 3: 重启 Nginx 服务${NC}"
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose-nginx-apisix.yml restart nginx
elif command -v docker &> /dev/null; then
    docker compose -f docker-compose-nginx-apisix.yml restart nginx
else
    echo -e "${YELLOW}请手动重启 Nginx 服务${NC}"
fi

echo ""
echo -e "${GREEN}步骤 4: 验证配置${NC}"
sleep 3

# 检查 Nginx 是否正常运行
if curl -s -k https://localhost:9443/healthz > /dev/null 2>&1; then
    echo "✓ Nginx 服务运行正常"
else
    echo -e "${YELLOW}警告: Nginx 服务可能未正常启动${NC}"
fi

echo ""
echo -e "${GREEN}步骤 5: 测试 PWA 离线功能${NC}"
echo "请按以下步骤测试:"
echo ""
echo "  1. 访问 PWA 管理页面进行预缓存:"
echo "     https://192.168.171.3:9443/report/pwa"
echo ""
echo "  2. 关闭 Next.js 服务进行离线测试:"
echo "     kubectl scale deployment sei-nextjs --replicas=0 -n seirep"
echo ""
echo "  3. 再次访问 PWA 页面,应该看到友好的错误提示而非 502:"
echo "     https://192.168.171.3:9443/report/pwa"
echo ""
echo "  4. 恢复 Next.js 服务:"
echo "     kubectl scale deployment sei-nextjs --replicas=2 -n seirep"
echo ""

echo -e "${GREEN}=========================================="
echo "  修复完成!"
echo "=========================================="
echo ""
echo "详细信息请查看: PWA-OFFLINE-TROUBLESHOOTING.md"
echo ""
echo -e "${YELLOW}如果问题仍然存在,请检查:${NC}"
echo "  1. 浏览器 Service Worker 是否已注册"
echo "  2. /report/~offline 页面是否已缓存"
echo "  3. Nginx 日志: docker logs nginx"
echo ""
