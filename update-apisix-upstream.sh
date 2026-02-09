#!/bin/bash
# 更新 APISIX 上游服务 - 将 frontend-nextjs 指向 sei-nextjs 服务

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin"
APISIX_API_KEY="2fe0ed0772792adb04de6897b3ef06c0"

echo "============================================"
echo "更新 APISIX 上游服务 - Next.js 前端"
echo "============================================"
echo ""

# 步骤 1: 查看当前上游服务配置
echo "步骤 1: 查看当前 frontend-nextjs 上游配置..."
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/upstreams/frontend-nextjs" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.'
echo ""

read -p "是否更新 frontend-nextjs 上游服务? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "操作已取消"
    exit 0
fi

# 步骤 2: 更新上游服务，指向 K3s 集群内的 sei-nextjs 服务
echo "步骤 2: 更新上游服务..."
echo "将 frontend-nextjs 指向 sei-nextjs.seirep.svc.cluster.local:3765"
echo "============================================"

curl -X PATCH "${APISIX_ADMIN_URL}/upstreams/frontend-nextjs" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: ${APISIX_API_KEY}" \
  -d '{
    "nodes": {
      "sei-nextjs.seirep.svc.cluster.local:3765": 1
    }
  }'

echo ""
echo "============================================"
echo "上游服务更新完成！"
echo "============================================"
echo ""
echo "验证更新："
curl -s "${APISIX_ADMIN_URL}/upstreams/frontend-nextjs" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.value.nodes'
echo ""
echo "访问地址: https://192.168.109.66:30443/report"
echo "============================================"
