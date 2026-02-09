#!/bin/bash
# 调试 APISIX 上游服务连接

APISIX_ADMIN_URL="http://localhost:9180/apisix/admin"
APISIX_API_KEY="2fe0ed0772792adb04de6897b3ef06c0"

echo "============================================"
echo "调试 APISIX 上游服务连接"
echo "============================================"
echo ""

# 步骤 1: 查看 APISIX 上游服务配置
echo "步骤 1: 查看 frontend-nextjs 上游服务配置..."
echo "============================================"
curl -s "${APISIX_ADMIN_URL}/upstreams/frontend-nextjs" -H "X-API-KEY: ${APISIX_API_KEY}" | jq '.value.nodes'
echo ""

# 步骤 2: 从 K3s 集群内直接测试 sei-nextjs 服务
echo "步骤 2: 从 K3s 集群内测试 sei-nextjs 服务..."
echo "============================================"

# 检查 Pod 状态
echo "Pod 状态:"
kubectl get pods -n seirep -l app=sei-nextjs
echo ""

# 检查服务状态
echo "服务状态:"
kubectl get svc -n seirep sei-nextjs
echo ""

# 从集群内访问服务
echo "从集群内访问测试:"
kubectl run test-pod --image=curlimages/curl:latest --rm -it --restart=Never -- \
  curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://sei-nextjs.seirep.svc.cluster.local:3765 2>&1 || \
  kubectl run test-pod --image=busybox:1.28 --rm -it --restart=Never -- \
  wget -qO- http://sei-nextjs.seirep.svc.cluster.local:3765 2>&1 || echo "访问失败"

echo ""
echo "============================================"
echo "检查 sei-nextjs Pod 日志"
echo "============================================"
kubectl logs -n seirep -l app=sei-nextjs --tail=20
echo ""
echo "============================================"
