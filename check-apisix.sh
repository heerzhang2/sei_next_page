#!/bin/bash
# Check APISIX Admin API and configuration

echo "===================================="
echo "APISIX Configuration Check"
echo "===================================="
echo ""

# 1. Get APISIX Pod
echo "1. Getting APISIX Pod..."
APISIX_POD=$(kubectl get pod -n apisix -l app.kubernetes.io/name=apisix -o jsonpath='{.items[0].metadata.name}')
echo "   APISIX Pod: $APISIX_POD"
echo ""

# 2. Check APISIX ConfigMap
echo "2. Checking APISIX ConfigMap..."
kubectl get configmap apisix -n apisix -o yaml | grep -A 5 "admin_key:"
echo ""

# 3. Try to get routes without API key
echo "3. Testing Admin API without authentication..."
kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/routes
echo ""

# 4. Try with default admin key
echo "4. Testing Admin API with default key (edd1c9f034335f136f87ad84b625c8f1)..."
kubectl exec -n apisix "$APISIX_POD" -- curl -s -H "X-API-KEY: edd1c9f034335f136f87ad84b625c8f1" http://127.0.0.1:9180/apisix/admin/routes
echo ""

# 5. Check if routes are defined via CRD
echo "5. Checking APISIX Routes CRD..."
kubectl get apisixroute -A -o wide
echo ""

# 6. Check upstreams
echo "6. Checking APISIX Upstreams CRD..."
kubectl get apisixupstream -A -o wide
echo ""

# 7. Check all routes via APISIX Admin API list
echo "7. Listing all Admin API endpoints..."
kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin 2>/dev/null | head -20
echo ""

# 8. Check APISIX logs
echo "8. Recent APISIX logs..."
kubectl logs -n apisix "$APISIX_POD" --tail=20
echo ""

echo "===================================="
echo "Check completed!"
echo "===================================="
echo ""
