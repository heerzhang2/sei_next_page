#!/bin/bash

# 恢复 APISIX 配置文件

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 恢复原始配置文件
if [ -f apisix_conf/config.yaml.bak ]; then
    cp apisix_conf/config.yaml.bak apisix_conf/config.yaml
    echo "已恢复原始 APISIX 配置文件"
else
    echo "未找到备份文件，无法恢复"
    exit 1
fi

# 停止并删除 APISIX 容器
docker-compose down

# 重新启动 APISIX
docker-compose up -d

# 等待容器启动
sleep 5

# 检查容器状态
docker-compose ps
