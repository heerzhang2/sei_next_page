#!/bin/bash
# 验证 APISIX 路由配置

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin/routes"
ROUTE_ID="sei-nextjs-route"

echo "============================================"
echo "验证 APISIX 路由配置"
echo "============================================"

# 查看路由列表
echo "当前路由列表："
curl -s "${APISIX_ADMIN_URL}" | jq '.data[] | {id: .id, uri: .value.uri}' 2>/dev/null || \
curl -s "${APISIX_ADMIN_URL}" | grep -o '"uri":"[^"]*"'

echo ""
echo "============================================"
echo "查看 sei-nextjs 路由详情："
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/${ROUTE_ID}" | jq '.' 2>/dev/null || \
curl -s "${APISIX_ADMIN_URL}/${ROUTE_ID}"

echo ""
echo "============================================"
echo "测试路由访问："
echo "============================================"
curl -i "http://localhost:9080/report" 2>/dev/null || echo "需要配置端口转发或从 K3s 集群内访问"

echo ""
