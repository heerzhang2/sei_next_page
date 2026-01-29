#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Camunda Worker + PDF Service Sidecar 部署${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查 PDF 服务镜像
echo -e "${YELLOW}[1/4] 检查 PDF 服务镜像...${NC}"
if ! docker images | grep -q "page2pdf-server"; then
    echo -e "${RED}PDF 服务镜像 page2pdf-server:latest 不存在！${NC}"
    echo -e "${YELLOW}请先构建 PDF 服务镜像，例如：${NC}"
    echo -e "cd ../page2pdf-server && docker build -t page2pdf-server:latest ."
    exit 1
fi
echo -e "${GREEN}✓ PDF 服务镜像已存在${NC}"

# 2. 构建 Camunda Worker 镜像
echo -e "${YELLOW}[2/4] 构建 Camunda Worker 镜像...${NC}"
docker build -t camunda-worker:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}Camunda Worker 镜像构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Camunda Worker 镜像构建成功${NC}"

# 3. 导出镜像到 k3s
echo -e "${YELLOW}[3/4] 导出并导入镜像到 k3s...${NC}"
docker save camunda-worker:latest page2pdf-server:latest | ssh root@192.168.109.66 "ctr -n k8s.io images import -"

if [ $? -ne 0 ]; then
    echo -e "${RED}镜像导入失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 镜像导入 k3s 成功${NC}"

# 4. 应用 Kubernetes 配置
echo -e "${YELLOW}[4/4] 应用 Kubernetes 配置 (Sidecar 模式)...${NC}"
kubectl apply -f k8s-deployment-sidecar.yaml -n apisix

if [ $? -ne 0 ]; then
    echo -e "${RED}Kubernetes 部署失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 部署成功！${NC}"

# 查看部署状态
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}查看 Pod 状态:${NC}"
kubectl get pods -n apisix -l app=camunda-worker

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${YELLOW}查看 Worker 日志:${NC}"
echo -e "kubectl logs -n apisix -l app=camunda-worker -c camunda-worker -f"
echo -e "${YELLOW}查看 PDF 服务日志:${NC}"
echo -e "kubectl logs -n apisix -l app=camunda-worker -c pdf-service -f"
echo -e "${GREEN}========================================${NC}"

# 等待 Pod 就绪
echo -e "${YELLOW}等待 Pod 就绪...${NC}"
kubectl wait --for=condition=ready pod -l app=camunda-worker -n apisix --timeout=120s

echo -e "${GREEN}所有 Pod 已就绪！${NC}"
