#!/bin/bash

# 修改 APISIX 配置，禁用 9443 端口

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 备份原始配置文件
cp apisix_conf/config.yaml apisix_conf/config.yaml.bak

# 修改配置文件，注释掉 SSL 端口
sed -i 's/^ssl: 9443/# ssl: 9443  # 禁用，让 Nginx 使用 9443 端口/' apisix_conf/config.yaml

echo "APISIX 配置已修改，SSL 端口已禁用"
echo "原始配置已备份到: apisix_conf/config.yaml.bak"

# 重启 APISIX 容器
echo "正在重启 APISIX 容器..."
docker-compose restart apisix

# 等待容器重启
sleep 5

# 检查端口占用
echo "检查 9443 端口占用情况..."
sudo netstat -tulpn | grep 9443

if [ $? -eq 0 ]; then
    echo "警告: 9443 端口仍被占用"
else
    echo "成功: 9443 端口已释放"
fi
