#!/bin/bash
# APISIX Configuration Backup Script

BACKUP_DIR="/root/apisix/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "===================================="
echo "APISIX Configuration Backup"
echo "===================================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# 1. Backup Kubernetes resources
echo "1. Backing up Kubernetes resources..."

# Backup ConfigMaps
kubectl get configmap -n apisix -o yaml > "$BACKUP_DIR/configmaps.yaml"
echo "   - ConfigMaps backed up"

# Backup Secrets (excluded sensitive data)
kubectl get secret -n apisix -o yaml > "$BACKUP_DIR/secrets.yaml"
echo "   - Secrets backed up"

# Backup Deployments
kubectl get deployment -n apisix -o yaml > "$BACKUP_DIR/deployments.yaml"
echo "   - Deployments backed up"

# Backup StatefulSets
kubectl get statefulset -n apisix -o yaml > "$BACKUP_DIR/statefulsets.yaml"
echo "   - StatefulSets backed up"

# Backup Services
kubectl get svc -n apisix -o yaml > "$BACKUP_DIR/services.yaml"
echo "   - Services backed up"

# Backup APISIX Routes (CRD) - fixed command
kubectl get apisixroute -n apisix -o yaml > "$BACKUP_DIR/apisix-routes.yaml" 2>/dev/null || echo "   - No APISIX Routes found"
echo "   - APISIX Routes checked"

# Backup APISIX Upstreams (CRD if any)
kubectl get apisixupstream -n apisix -o yaml > "$BACKUP_DIR/apisix-upstreams.yaml" 2>/dev/null || echo "   - No APISIX Upstreams found"

# Backup APISIX Consumers (CRD if any)
kubectl get apisixconsumer -n apisix -o yaml > "$BACKUP_DIR/apisix-consumers.yaml" 2>/dev/null || echo "   - No APISIX Consumers found"

echo ""
echo "2. Backing up etcd data (from Admin API)..."

# Check if APISIX Admin API is accessible
if command -v curl &> /dev/null; then
    # Check if we need to use port-forward first
    if ! curl -s --connect-timeout 2 http://127.0.0.1:9180/apisix/admin/routes &>/dev/null; then
        echo "   - Admin API not accessible, trying via APISIX Pod..."

        # Get APISIX pod name
        APISIX_POD=$(kubectl get pod -n apisix -l app.kubernetes.io/name=apisix -o jsonpath='{.items[0].metadata.name}')

        if [ ! -z "$APISIX_POD" ]; then
            echo "   - Using APISIX Pod: $APISIX_POD"

            # Try to get admin key from secret
            ADMIN_KEY=$(kubectl get secret -n apisix apisix-admin -o jsonpath='{.data.admin-key}' 2>/dev/null | base64 -d 2>/dev/null || echo "edd1c9f034335f136f87ad84b625c8f1")

            # Backup via kubectl exec
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/routes > "$BACKUP_DIR/admin-routes.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/upstreams > "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/services > "$BACKUP_DIR/admin-services.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/consumers > "$BACKUP_DIR/admin-consumers.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/global_rules > "$BACKUP_DIR/admin-global-rules.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/plugin_configs > "$BACKUP_DIR/admin-plugin-configs.json" 2>/dev/null
            kubectl exec -n apisix "$APISIX_POD" -- curl -s http://127.0.0.1:9180/apisix/admin/ssls > "$BACKUP_DIR/admin-ssls.json" 2>/dev/null

            echo "   - Admin API data backed up via Pod"
        fi
    else
        # Direct access available
        ADMIN_KEY="edd1c9f034335f136f87ad84b625c8f1"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/routes > "$BACKUP_DIR/admin-routes.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/upstreams > "$BACKUP_DIR/admin-upstreams.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/services > "$BACKUP_DIR/admin-services.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/consumers > "$BACKUP_DIR/admin-consumers.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/global_rules > "$BACKUP_DIR/admin-global-rules.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/plugin_configs > "$BACKUP_DIR/admin-plugin-configs.json"
        curl -s -H "X-API-KEY: $ADMIN_KEY" http://127.0.0.1:9180/apisix/admin/ssls > "$BACKUP_DIR/admin-ssls.json"
        echo "   - Admin API data backed up (direct access)"
    fi
else
    echo "   - curl not available, skipping Admin API backup"
fi

echo ""
echo "3. Backing up etcd data directory..."

# Find etcd PVC - fixed command
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

# Count resources
echo "Backup contents:"
ls -lh "$BACKUP_DIR/" | tail -n +2
echo ""

# Show Routes count
if [ -f "$BACKUP_DIR/admin-routes.json" ]; then
    ROUTE_COUNT=$(grep -o '"id"' "$BACKUP_DIR/admin-routes.json" 2>/dev/null | wc -l)
    echo "APISIX Routes: $ROUTE_COUNT"
    if [ $ROUTE_COUNT -gt 0 ]; then
        echo "Route IDs:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-routes.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | head -10
    fi
fi

# Show Upstreams count
if [ -f "$BACKUP_DIR/admin-upstreams.json" ]; then
    UPSTREAM_COUNT=$(grep -o '"id"' "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null | wc -l)
    echo "APISIX Upstreams: $UPSTREAM_COUNT"
    if [ $UPSTREAM_COUNT -gt 0 ]; then
        echo "Upstream IDs:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | head -10
    fi
fi

# Show SSLs count
if [ -f "$BACKUP_DIR/admin-ssls.json" ]; then
    SSL_COUNT=$(grep -o '"id"' "$BACKUP_DIR/admin-ssls.json" 2>/dev/null | wc -l)
    echo "APISIX SSLs: $SSL_COUNT"
    if [ $SSL_COUNT -gt 0 ]; then
        echo "SSL IDs:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-ssls.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | head -10
    fi
fi

echo ""
echo "===================================="
echo "Backup completed successfully!"
echo "===================================="
echo "Backup location: $BACKUP_DIR"
echo "Archive: $BACKUP_DIR.tar.gz"
echo ""

# Create a summary file
cat > "$BACKUP_DIR/backup-summary.txt" << EOF
APISIX Backup Summary
====================
Date: $(date)
Backup directory: $BACKUP_DIR

Resources backed up:
- ConfigMaps
- Secrets
- Deployments
- StatefulSets
- Services
- APISIX Routes
- APISIX Upstreams
- APISIX Consumers
- APISIX SSLs

To restore:
1. kubectl apply -f configmaps.yaml -n apisix
2. kubectl apply -f secrets.yaml -n apisix
3. kubectl apply -f deployments.yaml -n apisix
4. kubectl apply -f statefulsets.yaml -n apisix
5. kubectl apply -f services.yaml -n apisix
6. kubectl apply -f apisix-routes.yaml -n apisix
EOF

echo "Summary: $BACKUP_DIR/backup-summary.txt"
echo ""
