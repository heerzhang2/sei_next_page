#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Camunda Worker 部署到 k3s${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 构建 Docker 镜像
echo -e "${YELLOW}[1/3] 构建 Docker 镜像...${NC}"
docker build -t camunda-worker:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker 镜像构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 镜像构建成功${NC}"

# 2. 导出镜像到 k3s
echo -e "${YELLOW}[2/3] 导出并导入镜像到 k3s...${NC}"
docker save camunda-worker:latest | ssh root@192.168.109.66 "ctr -n k8s.io images import -"

if [ $? -ne 0 ]; then
    echo -e "${RED}镜像导入失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 镜像导入 k3s 成功${NC}"

# 3. 应用 Kubernetes 配置
echo -e "${YELLOW}[3/3] 应用 Kubernetes 配置...${NC}"
kubectl apply -f k8s-deployment.yaml -n apisix

if [ $? -ne 0 ]; then
    echo -e "${RED}Kubernetes 部署失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 部署成功！${NC}"

# 查看部署状态
echo -e "${YELLOW}查看部署状态:${NC}"
kubectl get pods -n apisix -l app=camunda-worker

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！查看日志:${NC}"
echo -e "${YELLOW}kubectl logs -n apisix -l app=camunda-worker -f${NC}"
echo -e "${GREEN}========================================${NC}"
