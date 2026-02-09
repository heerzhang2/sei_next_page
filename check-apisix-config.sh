#!/bin/bash
# 检查现有 APISIX 路由配置

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin"
APISIX_API_KEY="2fe0ed0772792adb04de6897b3ef06c0"

echo "============================================"
echo "检查现有 APISIX 路由配置"
echo "============================================"
echo ""

# 查看所有路由
echo "【当前所有路由列表】"
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/routes" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.' 2>/dev/null || \
curl -s "${APISIX_ADMIN_URL}/routes" -H "X-API-KEY: ${APISIX_API_KEY}"

echo ""
echo "============================================"
echo "【查找 /report 相关的路由】"
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/routes" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.data[] | select(.value.uri | test("report"; "i"))' 2>/dev/null || \
echo "未找到 /report 相关路由"

echo ""
echo "============================================"
echo "【查找 /api 相关的路由】"
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/routes" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.data[] | select(.value.uri | test("api"; "i"))' 2>/dev/null || \
echo "未找到 /api 相关路由"

echo ""
echo "============================================"
echo "【查看上游服务（Upstream）配置】"
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/upstreams" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.' 2>/dev/null || \
curl -s "${APISIX_ADMIN_URL}/upstreams" -H "X-API-KEY: ${APISIX_API_KEY}"

echo ""
echo "============================================"
echo "检查完成！"
echo "============================================"
