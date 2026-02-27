#!/bin/bash

# 修改 APISIX 配置，禁用 9443 端口（不重启容器）

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 检查备份文件是否存在
if [ ! -f apisix_conf/config.yaml.bak ]; then
    # 备份原始配置文件
    cp apisix_conf/config.yaml apisix_conf/config.yaml.bak
    echo "已备份原始配置文件到: apisix_conf/config.yaml.bak"
else
    echo "备份文件已存在，跳过备份步骤"
fi

# 修改配置文件，注释掉 SSL 端口
sed -i 's/^ssl: 9443/# ssl: 9443  # 禁用，让 Nginx 使用 9443 端口/' apisix_conf/config.yaml

echo "APISIX 配置已修改，SSL 端口已禁用"
echo "注意：需要手动重启 APISIX 容器以使配置生效"
echo ""
echo "请执行以下命令重启 APISIX："
echo "  docker-compose down"
echo "  docker-compose up -d"
