#!/bin/bash
# 更新 APISIX 路由配置 - 将 /report 指向 sei-nextjs 服务

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin"
APISIX_API_KEY="2fe0ed0772792adb04de6897b3ef06c0"
REPORT_ROUTE_ID=""
NEXTJS_ROUTE_ID="sei-nextjs-route"

echo "============================================"
echo "更新 APISIX 路由 - Next.js 前端"
echo "============================================"
echo ""

# 步骤 1: 查找现有的 /report 路由
echo "步骤 1: 查找现有的 /report 路由..."
REPORT_ROUTE_ID=$(curl -s "${APISIX_ADMIN_URL}/routes" -H "X-API-KEY: ${APISIX_API_KEY}" | jq -r '.data[] | select(.value.uri | test("report"; "i")) | .id' 2>/dev/null | head -1)

if [ -n "$REPORT_ROUTE_ID" ]; then
    echo "找到现有 /report 路由 ID: ${REPORT_ROUTE_ID}"
    echo ""
    echo "现有路由配置："
    curl -s "${APISIX_ADMIN_URL}/routes/${REPORT_ROUTE_ID}" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.' 2>/dev/null
    echo ""
    read -p "是否删除现有路由并创建新路由? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "操作已取消"
        exit 0
    fi

    echo "删除现有路由..."
    curl -X DELETE "${APISIX_ADMIN_URL}/routes/${REPORT_ROUTE_ID}" -H "X-API-KEY: ${APISIX_API_KEY}"
    echo ""
else
    echo "未找到现有的 /report 路由"
fi

# 步骤 2: 删除旧的 sei-nextjs-route（如果存在）
echo "步骤 2: 清理旧的 sei-nextjs-route..."
curl -X DELETE "${APISIX_ADMIN_URL}/routes/${NEXTJS_ROUTE_ID}" -H "X-API-KEY: ${APISIX_API_KEY}" 2>/dev/null
echo ""

# 步骤 3: 创建新路由
echo "步骤 3: 创建新路由..."
echo "将 /report/* 指向 sei-nextjs.seirep.svc.cluster.local:3765"
echo ""

curl -X PUT "${APISIX_ADMIN_URL}/routes/${NEXTJS_ROUTE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: ${APISIX_API_KEY}" \
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
      "timeout": {
        "connect": 6,
        "send": 10,
        "read": 10
      }
    }
  }'

echo ""
echo "============================================"
echo "路由更新完成！"
echo "============================================"
echo "路由 ID: ${NEXTJS_ROUTE_ID}"
echo "访问地址: https://192.168.109.66:30443/report"
echo ""
echo "验证路由："
echo "curl ${APISIX_ADMIN_URL}/routes/${NEXTJS_ROUTE_ID} -H \"X-API-KEY: ${APISIX_API_KEY}\""
echo "============================================"
