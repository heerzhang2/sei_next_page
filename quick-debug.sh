#!/bin/bash
# 快速调试 sei-nextjs 服务

echo "============================================"
echo "检查 sei-nextjs 服务状态"
echo "============================================"
echo ""

echo "1. Pod 状态:"
kubectl get pods -n seirep -l app=sei-nextjs
echo ""

echo "2. 服务详情:"
kubectl describe svc -n seirep sei-nextjs | grep -A 10 "Endpoints:"
echo ""

echo "3. Pod 日志 (最新 10 行):"
kubectl logs -n seirep -l app=sei-nextjs --tail=10
echo ""

echo "4. 从集群内直接访问测试:"
kubectl exec -n seirep deploy/backend -- curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  http://sei-nextjs.seirep.svc.cluster.local:3765 2>&1 || \
kubectl exec -n seirep deploy/backend -- wget -qO- http://sei-nextjs.seirep.svc.cluster.local:3765 2>&1 | head -5 || \
echo "访问失败"

echo ""
echo "============================================"
echo "检查 APISIX 上游服务"
echo "============================================"
APISIX_ADMIN_URL="http://localhost:9180/apisix/admin"
APISIX_API_KEY="2fe0ed0772792adb04de6897b3ef06c0"
curl -s "${APISIX_ADMIN_URL}/upstreams/frontend-nextjs" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.value'
echo ""
