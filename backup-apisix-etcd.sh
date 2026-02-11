#!/bin/bash
# APISIX Configuration Backup via etcd

BACKUP_DIR="/root/apisix/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "===================================="
echo "APISIX Configuration Backup (etcd)"
echo "===================================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# Get etcd Pod
ETCD_POD=$(kubectl get pod -n apisix -l app.kubernetes.io/name=etcd -o jsonpath='{.items[0].metadata.name}')

if [ -z "$ETCD_POD" ]; then
    echo "Error: etcd Pod not found"
    exit 1
fi

echo "Using etcd Pod: $ETCD_POD"
echo ""

# 1. Backup Kubernetes resources
echo "1. Backing up Kubernetes resources..."
kubectl get configmap -n apisix -o yaml > "$BACKUP_DIR/configmaps.yaml"
echo "   - ConfigMaps backed up"

kubectl get secret -n apisix -o yaml > "$BACKUP_DIR/secrets.yaml"
echo "   - Secrets backed up"

kubectl get deployment -n apisix -o yaml > "$BACKUP_DIR/deployments.yaml"
echo "   - Deployments backed up"

kubectl get statefulset -n apisix -o yaml > "$BACKUP_DIR/statefulsets.yaml"
echo "   - StatefulSets backed up"

kubectl get svc -n apisix -o yaml > "$BACKUP_DIR/services.yaml"
echo "   - Services backed up"

echo ""

# 2. Backup APISIX configuration from etcd
echo "2. Backing up APISIX configuration from etcd..."

# Get all APISIX keys from etcd
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "" --prefix --keys-only "/apisix/" 2>/dev/null | sed 's/^.*: //' > "$BACKUP_DIR/etcd-keys.txt"
KEY_COUNT=$(wc -l < "$BACKUP_DIR/etcd-keys.txt")
echo "   Found $KEY_COUNT keys in etcd"

# Backup routes
echo "   - Backing up routes..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/routes/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-routes.txt"
ROUTE_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-routes.txt" 2>/dev/null || echo 0)
echo "     Routes: $ROUTE_COUNT"

# Backup upstreams
echo "   - Backing up upstreams..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/upstreams/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-upstreams.txt"
UPSTREAM_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-upstreams.txt" 2>/dev/null || echo 0)
echo "     Upstreams: $UPSTREAM_COUNT"

# Backup services
echo "   - Backing up services..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/services/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-services.txt"
SERVICE_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-services.txt" 2>/dev/null || echo 0)
echo "     Services: $SERVICE_COUNT"

# Backup consumers
echo "   - Backing up consumers..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/consumers/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-consumers.txt"
CONSUMER_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-consumers.txt" 2>/dev/null || echo 0)
echo "     Consumers: $CONSUMER_COUNT"

# Backup SSLs
echo "   - Backing up SSLs..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/ssls/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-ssls.txt"
SSL_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-ssls.txt" 2>/dev/null || echo 0)
echo "     SSLs: $SSL_COUNT"

# Backup global rules
echo "   - Backing up global rules..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/global_rules/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-global-rules.txt"

# Backup plugin configs
echo "   - Backing up plugin configs..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/plugin_configs/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-plugin-configs.txt"

# Backup stream routes
echo "   - Backing up stream routes..."
kubectl exec -n apisix "$ETCD_POD" -- etcdctl get "/apisix/stream_routes/" --prefix 2>/dev/null > "$BACKUP_DIR/etcd-stream-routes.txt"

echo ""

# 3. Backup etcd data directory
echo "3. Backing up etcd data directory..."
ETCD_PVC=$(kubectl get pvc -n apisix | grep apisix-etcd | head -1 | awk '{print $1}')

if [ ! -z "$ETCD_PVC" ]; then
    ETCD_MOUNT=$(kubectl get pvc -n apisix "$ETCD_PVC" -o jsonpath='{.spec.volumeName}')
    ETCD_PATH="/var/lib/rancher/k3s/storage/${ETCD_MOUNT}_apisix_${ETCD_PVC}"

    if [ -d "$ETCD_PATH" ]; then
        cp -r "$ETCD_PATH" "$BACKUP_DIR/etcd-data"
        echo "   - etcd data backed up from $ETCD_PATH"
    else
        echo "   - etcd data directory not found: $ETCD_PATH"
    fi
else
    echo "   - No etcd PVC found"
fi

echo ""
echo "4. Creating backup archive..."
tar czf "$BACKUP_DIR.tar.gz" -C /root/apisix "$(basename $BACKUP_DIR)"
echo "   - Archive created: $BACKUP_DIR.tar.gz"

echo ""
echo "===================================="
echo "Backup Verification"
echo "===================================="
echo ""

echo "Backup contents:"
ls -lh "$BACKUP_DIR/"
echo ""

echo "APISIX Configuration Summary:"
echo "  Routes: $ROUTE_COUNT"
echo "  Upstreams: $UPSTREAM_COUNT"
echo "  Services: $SERVICE_COUNT"
echo "  Consumers: $CONSUMER_COUNT"
echo "  SSLs: $SSL_COUNT"
echo ""

if [ $ROUTE_COUNT -gt 0 ]; then
    echo "Route keys:"
    grep "^/" "$BACKUP_DIR/etcd-routes.txt" | sed 's/.*\///g' | head -10
    echo ""
fi

if [ $UPSTREAM_COUNT -gt 0 ]; then
    echo "Upstream keys:"
    grep "^/" "$BACKUP_DIR/etcd-upstreams.txt" | sed 's/.*\///g' | head -10
    echo ""
fi

if [ $SSL_COUNT -gt 0 ]; then
    echo "SSL keys:"
    grep "^/" "$BACKUP_DIR/etcd-ssls.txt" | sed 's/.*\///g' | head -10
    echo ""
fi

echo "===================================="
echo "Backup completed successfully!"
echo "===================================="
echo "Backup location: $BACKUP_DIR"
echo "Archive: $BACKUP_DIR.tar.gz"
echo ""

# Create summary
cat > "$BACKUP_DIR/backup-summary.txt" << EOF
APISIX Backup Summary (etcd)
==========================
Date: $(date)
Backup directory: $BACKUP_DIR

Resources:
- Routes: $ROUTE_COUNT
- Upstreams: $UPSTREAM_COUNT
- Services: $SERVICE_COUNT
- Consumers: $CONSUMER_COUNT
- SSLs: $SSL_COUNT
- etcd keys: $KEY_COUNT

Files backed up:
- Kubernetes resources (ConfigMaps, Secrets, Deployments, etc.)
- etcd raw data (/apisix/*)
- etcd data directory

To restore:
1. Restore Kubernetes resources with kubectl apply
2. Import etcd data using: etcdctl put <key> <value>
3. Or restore etcd data directory
EOF

echo "Summary: $BACKUP_DIR/backup-summary.txt"
echo ""
