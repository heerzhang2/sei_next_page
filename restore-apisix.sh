#!/bin/bash
# Restore APISIX Configuration from etcd backup

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-directory>"
    echo "Example: $0 backup-20260211-085610"
    exit 1
fi

BACKUP_DIR="/root/apisix/$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "===================================="
echo "APISIX Configuration Restore"
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

echo "WARNING: This will overwrite existing APISIX configuration!"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo ""

# 1. Restore Kubernetes resources
echo "1. Restoring Kubernetes resources..."

if [ -f "$BACKUP_DIR/configmaps.yaml" ]; then
    kubectl apply -f "$BACKUP_DIR/configmaps.yaml" -n apisix
    echo "   - ConfigMaps restored"
fi

if [ -f "$BACKUP_DIR/secrets.yaml" ]; then
    kubectl apply -f "$BACKUP_DIR/secrets.yaml" -n apisix
    echo "   - Secrets restored"
fi

if [ -f "$BACKUP_DIR/deployments.yaml" ]; then
    kubectl apply -f "$BACKUP_DIR/deployments.yaml" -n apisix
    echo "   - Deployments restored"
fi

if [ -f "$BACKUP_DIR/statefulsets.yaml" ]; then
    kubectl apply -f "$BACKUP_DIR/statefulsets.yaml" -n apisix
    echo "   - StatefulSets restored"
fi

if [ -f "$BACKUP_DIR/services.yaml" ]; then
    kubectl apply -f "$BACKUP_DIR/services.yaml" -n apisix
    echo "   - Services restored"
fi

echo ""

# 2. Restore APISIX configuration from etcd
echo "2. Restoring APISIX configuration to etcd..."

if [ -f "$BACKUP_DIR/etcd-routes.txt" ]; then
    echo "   - Restoring routes..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/routes/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/routes/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-routes.txt"
fi

if [ -f "$BACKUP_DIR/etcd-upstreams.txt" ]; then
    echo "   - Restoring upstreams..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/upstreams/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/upstreams/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-upstreams.txt"
fi

if [ -f "$BACKUP_DIR/etcd-services.txt" ]; then
    echo "   - Restoring services..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/services/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/services/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-services.txt"
fi

if [ -f "$BACKUP_DIR/etcd-consumers.txt" ]; then
    echo "   - Restoring consumers..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/consumers/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/consumers/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-consumers.txt"
fi

if [ -f "$BACKUP_DIR/etcd-ssls.txt" ]; then
    echo "   - Restoring SSLs..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/ssls/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/ssls/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-ssls.txt"
fi

if [ -f "$BACKUP_DIR/etcd-global-rules.txt" ]; then
    echo "   - Restoring global rules..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/global_rules/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/global_rules/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-global-rules.txt"
fi

if [ -f "$BACKUP_DIR/etcd-plugin-configs.txt" ]; then
    echo "   - Restoring plugin configs..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/plugin_configs/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/plugin_configs/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-plugin-configs.txt"
fi

if [ -f "$BACKUP_DIR/etcd-stream-routes.txt" ]; then
    echo "   - Restoring stream routes..."
    while IFS= read -r line; do
        if [[ "$line" =~ ^/apisix/stream_routes/ ]]; then
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | tr -d '"')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            if [ ! -z "$KEY" ] && [ ! -z "$VALUE" ] && [ "$KEY" != "/apisix/stream_routes/" ]; then
                kubectl exec -n apisix "$ETCD_POD" -- etcdctl put "$KEY" "$VALUE" 2>/dev/null
                echo "     Restored: $KEY"
            fi
        fi
    done < "$BACKUP_DIR/etcd-stream-routes.txt"
fi

echo ""

# 3. Restart APISIX to reload configuration
echo "3. Restarting APISIX to apply configuration..."

kubectl rollout restart deployment/apisix -n apisix
kubectl rollout restart statefulset/apisix-etcd -n apisix

echo ""

# 4. Wait for pods to be ready
echo "4. Waiting for pods to be ready..."

echo "   Waiting for etcd..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=etcd -n apisix --timeout=120s

echo "   Waiting for APISIX..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=apisix -n apisix --timeout=120s

echo ""
echo "===================================="
echo "Restore completed!"
echo "===================================="
echo ""
echo "Check status:"
echo "  kubectl get pods -n apisix"
echo ""
echo "Verify routes:"
echo "  kubectl exec -n apisix apisix-xxx -- etcdctl get /apisix/routes/ --prefix"
echo ""
