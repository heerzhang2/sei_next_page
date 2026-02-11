#!/bin/bash
# Verify APISIX Backup

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-directory>"
    echo "Example: $0 backup-20260211-084004"
    exit 1
fi

BACKUP_DIR="/root/apisix/$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "===================================="
echo "APISIX Backup Verification"
echo "===================================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# Check file sizes
echo "1. Checking backup files..."
ls -lh "$BACKUP_DIR/" | tail -n +2
echo ""

# Check Admin API backups
echo "2. Checking Admin API data..."

if [ -f "$BACKUP_DIR/admin-routes.json" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_DIR/admin-routes.json" 2>/dev/null || stat -c%s "$BACKUP_DIR/admin-routes.json" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 10 ]; then
        ROUTE_COUNT=$(grep -o '"node"' "$BACKUP_DIR/admin-routes.json" 2>/dev/null | wc -l)
        echo "   ✓ Routes: $ROUTE_COUNT items"
        echo "   Routes list:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-routes.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | while read id; do
            name=$(grep -o '"name":"[^"]*"' "$BACKUP_DIR/admin-routes.json" 2>/dev/null | head -1 | sed 's/"name":"//g' | sed 's/"//g')
            echo "     - ID: $id"
        done | head -10
    else
        echo "   ✗ Routes file empty or invalid"
    fi
else
    echo "   - Routes file not found"
fi

echo ""

if [ -f "$BACKUP_DIR/admin-upstreams.json" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null || stat -c%s "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 10 ]; then
        UPSTREAM_COUNT=$(grep -o '"node"' "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null | wc -l)
        echo "   ✓ Upstreams: $UPSTREAM_COUNT items"
        echo "   Upstreams list:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-upstreams.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | head -10 | while read id; do
            echo "     - ID: $id"
        done
    else
        echo "   ✗ Upstreams file empty or invalid"
    fi
else
    echo "   - Upstreams file not found"
fi

echo ""

if [ -f "$BACKUP_DIR/admin-ssls.json" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_DIR/admin-ssls.json" 2>/dev/null || stat -c%s "$BACKUP_DIR/admin-ssls.json" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 10 ]; then
        SSL_COUNT=$(grep -o '"node"' "$BACKUP_DIR/admin-ssls.json" 2>/dev/null | wc -l)
        echo "   ✓ SSLs: $SSL_COUNT items"
        echo "   SSL list:"
        grep -o '"id":"[^"]*"' "$BACKUP_DIR/admin-ssls.json" 2>/dev/null | sed 's/"id":"//g' | sed 's/"//g' | head -10 | while read id; do
            echo "     - ID: $id"
        done
    else
        echo "   ✗ SSLs file empty or invalid"
    fi
else
    echo "   - SSLs file not found"
fi

echo ""

if [ -f "$BACKUP_DIR/admin-consumers.json" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_DIR/admin-consumers.json" 2>/dev/null || stat -c%s "$BACKUP_DIR/admin-consumers.json" 2>/dev/null)
    if [ "$FILE_SIZE" -gt 10 ]; then
        CONSUMER_COUNT=$(grep -o '"node"' "$BACKUP_DIR/admin-consumers.json" 2>/dev/null | wc -l)
        echo "   ✓ Consumers: $CONSUMER_COUNT items"
    else
        echo "   ✗ Consumers file empty or invalid"
    fi
else
    echo "   - Consumers file not found"
fi

echo ""

# Check Kubernetes resources
echo "3. Checking Kubernetes resources..."

if [ -f "$BACKUP_DIR/configmaps.yaml" ]; then
    CM_COUNT=$(grep -c "^kind: ConfigMap" "$BACKUP_DIR/configmaps.yaml")
    echo "   ✓ ConfigMaps: $CM_COUNT items"
fi

if [ -f "$BACKUP_DIR/deployments.yaml" ]; then
    DEPLOY_COUNT=$(grep -c "^kind: Deployment" "$BACKUP_DIR/deployments.yaml")
    echo "   ✓ Deployments: $DEPLOY_COUNT items"
fi

if [ -f "$BACKUP_DIR/services.yaml" ]; then
    SVC_COUNT=$(grep -c "^kind: Service" "$BACKUP_DIR/services.yaml")
    echo "   ✓ Services: $SVC_COUNT items"
fi

echo ""

# Show route details (pretty print)
if [ -f "$BACKUP_DIR/admin-routes.json" ]; then
    echo "4. Detailed Route Information"
    echo "==============================="
    python3 -m json.tool "$BACKUP_DIR/admin-routes.json" 2>/dev/null | head -50 || cat "$BACKUP_DIR/admin-routes.json"
    echo ""
fi

echo "===================================="
echo "Verification completed!"
echo "===================================="
echo ""
