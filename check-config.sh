#!/bin/bash

# 检查 APISIX 配置文件

# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

echo "=== 检查 APISIX 配置文件 ==="
echo "查找所有包含 'ssl' 的行："
grep -n "ssl" apisix_conf/config.yaml

echo ""
echo "查找所有包含 '9443' 的行："
grep -n "9443" apisix_conf/config.yaml

echo ""
echo "查找所有包含 'port' 的行："
grep -n "port" apisix_conf/config.yaml

echo ""
echo "=== 检查备份文件 ==="
if [ -f apisix_conf/config.yaml.bak ]; then
    echo "备份文件 apisix_conf/config.yaml.bak 存在"
    echo "备份文件中的 ssl 配置："
    grep -n "ssl" apisix_conf/config.yaml.bak
else
    echo "备份文件 apisix_conf/config.yaml.bak 不存在"
fi

echo ""
echo "=== 检查当前 APISIX 容器端口 ==="
docker port example-apisix-1
