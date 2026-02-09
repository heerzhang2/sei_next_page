#!/bin/bash
# APISIX 路由配置脚本 - 配置 /report 路径指向 sei-nextjs 服务

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin/routes"
ROUTE_ID="sei-nextjs-route"

echo "============================================"
echo "配置 APISIX 路由 - Next.js 前端"
echo "============================================"

# 删除旧路由（如果存在）
echo "删除旧路由..."
curl -X DELETE "${APISIX_ADMIN_URL}/${ROUTE_ID}" 2>/dev/null
echo ""

# 创建新路由
echo "创建新路由..."
curl -X PUT "${APISIX_ADMIN_URL}/${ROUTE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "uri": "/report/*",
    "plugins": {
      "proxy-rewrite": {
        "regex_uri": ["^/report/(.*)", "/$1"]
      },
      "cors": {
        "enable": true
      }
    },
    "upstream": {
      "type": "roundrobin",
      "nodes": {
        "sei-nextjs.seirep.svc.cluster.local:3765": 1
      },
      "scheme": "http",
      "pass_host": "host",
      "retry_timeout": 60,
      "keepalive_pool": {
        "idle_timeout": 60,
        "requests": 1000,
        "size": 320
      }
    }
  }'

echo ""
echo "============================================"
echo "路由配置完成！"
echo "============================================"
echo "路由 ID: ${ROUTE_ID}"
echo "访问地址: https://192.168.109.66:30443/report"
echo ""
echo "验证路由："
echo "curl ${APISIX_ADMIN_URL}/${ROUTE_ID}"
echo "============================================"
