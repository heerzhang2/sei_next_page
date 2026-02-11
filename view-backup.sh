#!/bin/bash
# View APISIX backup contents

if [ -z "$1" ]; then
    echo "Usage: $0 <backup-directory>"
    echo "Example: $0 backup-20260211-084832"
    exit 1
fi

BACKUP_DIR="/root/apisix/$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "===================================="
echo "APISIX Backup Contents"
echo "===================================="
echo "Backup directory: $BACKUP_DIR"
echo ""

# 1. Show routes
if [ -f "$BACKUP_DIR/etcd-routes.txt" ]; then
    echo "1. APISIX Routes"
    echo "===================================="
    ROUTE_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-routes.txt" 2>/dev/null || echo 0)
    echo "Total routes: $ROUTE_COUNT"
    echo ""

    if [ $ROUTE_COUNT -gt 0 ]; then
        echo "Route configurations:"
        echo ""
        grep "^/" "$BACKUP_DIR/etcd-routes.txt" | while IFS= read -r line; do
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | sed 's/^"\//\//')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            echo "Key: $KEY"
            echo "Value: $VALUE"
            echo "---"
        done
    else
        echo "No routes found"
    fi
    echo ""
fi

# 2. Show upstreams
if [ -f "$BACKUP_DIR/etcd-upstreams.txt" ]; then
    echo "2. APISIX Upstreams"
    echo "===================================="
    UPSTREAM_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-upstreams.txt" 2>/dev/null || echo 0)
    echo "Total upstreams: $UPSTREAM_COUNT"
    echo ""

    if [ $UPSTREAM_COUNT -gt 0 ]; then
        grep "^/" "$BACKUP_DIR/etcd-upstreams.txt" | while IFS= read -r line; do
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | sed 's/^"\//\//')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            echo "Key: $KEY"
            echo "Value: $VALUE"
            echo "---"
        done
    else
        echo "No upstreams found"
    fi
    echo ""
fi

# 3. Show SSLs
if [ -f "$BACKUP_DIR/etcd-ssls.txt" ]; then
    echo "3. APISIX SSLs"
    echo "===================================="
    SSL_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-ssls.txt" 2>/dev/null || echo 0)
    echo "Total SSLs: $SSL_COUNT"
    echo ""

    if [ $SSL_COUNT -gt 0 ]; then
        echo "SSL keys:"
        grep "^/" "$BACKUP_DIR/etcd-ssls.txt" | sed 's/^\([^:]*\):.*/\1/' | sed 's/^"\//\//'
    else
        echo "No SSLs found"
    fi
    echo ""
fi

# 4. Show consumers
if [ -f "$BACKUP_DIR/etcd-consumers.txt" ]; then
    echo "4. APISIX Consumers"
    echo "===================================="
    CONSUMER_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-consumers.txt" 2>/dev/null || echo 0)
    echo "Total consumers: $CONSUMER_COUNT"
    echo ""

    if [ $CONSUMER_COUNT -gt 0 ]; then
        grep "^/" "$BACKUP_DIR/etcd-consumers.txt" | while IFS= read -r line; do
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | sed 's/^"\//\//')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            echo "Key: $KEY"
            echo "Value: $VALUE"
            echo "---"
        done
    else
        echo "No consumers found"
    fi
    echo ""
fi

# 5. Show services
if [ -f "$BACKUP_DIR/etcd-services.txt" ]; then
    echo "5. APISIX Services"
    echo "===================================="
    SERVICE_COUNT=$(grep -c "^/" "$BACKUP_DIR/etcd-services.txt" 2>/dev/null || echo 0)
    echo "Total services: $SERVICE_COUNT"
    echo ""

    if [ $SERVICE_COUNT -gt 0 ]; then
        grep "^/" "$BACKUP_DIR/etcd-services.txt" | while IFS= read -r line; do
            KEY=$(echo "$line" | sed 's/^\([^:]*\):.*/\1/' | sed 's/^"\//\//')
            VALUE=$(echo "$line" | sed 's/^[^:]*: //')
            echo "Key: $KEY"
            echo "Value: $VALUE"
            echo "---"
        done
    else
        echo "No services found"
    fi
    echo ""
fi

# 6. Show all etcd keys
if [ -f "$BACKUP_DIR/etcd-keys.txt" ]; then
    echo "6. All etcd keys"
    echo "===================================="
    cat "$BACKUP_DIR/etcd-keys.txt"
    echo ""
fi

echo "===================================="
echo "View completed!"
echo "===================================="
echo ""
