# Nginx 反向代理 APISIX 配置指南

本指南将帮助您在现有的 APISIX Docker 环境中添加 Nginx 反向代理，使其在 9443 端口监听 HTTPS 并将请求转发到 APISIX 的 HTTP 端口 9080。

注意：需要先修改 APISIX 配置，禁用其 9443 端口，以便 Nginx 可以使用该端口。

## 前提条件

- 已在 WSL + Ubuntu 环境中通过 Docker Desktop 部署 APISIX
- APISIX 运行在 Docker 网络中，默认网络名称为 `example_apisix`
- APISIX 的 HTTP 端口为 9080

## 配置步骤

### 0. 修改 APISIX 配置，禁用 9443 端口

由于 APISIX 默认占用了 9443 端口，我们需要先修改 APISIX 配置，禁用该端口，以便 Nginx 可以使用。

您可以选择以下两种方法之一：

#### 方法 1: 使用自动化脚本（推荐）

使用提供的自动化脚本，它会自动完成所有配置步骤：

在 WSL 环境中执行以下命令：

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 复制自动化脚本
cp /mnt/c/home/sei_next_page/setup-nginx-apisix.sh .

# 转换行尾符
sed -i 's/$//' setup-nginx-apisix.sh

# 执行自动化脚本
chmod +x setup-nginx-apisix.sh
./setup-nginx-apisix.sh
```

这个脚本会自动完成以下步骤：
1. 恢复 APISIX 配置（如果之前修改过）
2. 停止并删除所有容器
3. 修改 APISIX 配置，禁用 9443 端口
4. 重新启动 APISIX
5. 复制 Nginx 配置文件
6. 启动 Nginx 服务
7. 验证配置

#### 方法 2: 手动修改

如果您想手动完成每个步骤，可以按照以下步骤操作：

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 备份原始配置文件
cp apisix_conf/config.yaml apisix_conf/config.yaml.bak

# 编辑配置文件
nano apisix_conf/config.yaml
```

找到 `ssl: 9443` 这一行，将其注释掉：
```yaml
# ssl: 9443  # 禁用，让 Nginx 使用 9443 端口
```

保存并退出编辑器，然后重启 APISIX：

```bash
# 停止并删除所有容器
docker-compose down

# 重新启动 APISIX
docker-compose up -d

# 等待容器启动
sleep 10

# 检查容器状态
docker-compose ps

# 检查 9443 端口是否已释放
ss -tulpn | grep 9443 || echo "9443 端口未被占用"
```

### 1. 准备 SSL 证书

在 WSL 环境中执行以下命令：

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 复制证书生成脚本
cp /mnt/c/home/sei_next_page/generate-ssl-cert.sh .

# 转换行尾符（从 Windows CRLF 到 Linux LF）
sed -i 's/$//' generate-ssl-cert.sh

# 生成 SSL 证书
chmod +x generate-ssl-cert.sh
./generate-ssl-cert.sh
```

这将生成自签名 SSL 证书并保存在 `ssl` 目录中。

### 2. 复制 Nginx 配置文件

```bash
# 复制 Nginx 配置文件
cp /mnt/c/home/sei_next_page/nginx-apisix.conf .

# 复制 docker-compose 文件
cp /mnt/c/home/sei_next_page/docker-compose-nginx-apisix.yml .

# 如果之前已经复制过这些文件，请重新复制以获取最新版本
```

### 3. 验证网络配置

Nginx 配置已经设置为使用 `example_apisix` 网络，这是 APISIX Docker Compose 项目的网络。您可以通过以下命令验证：

```bash
# 查看 Docker 网络
docker network ls | grep example

# 查看 example_apisix 网络的详细信息
docker network inspect example_apisix
```

### 4. 启动 Nginx 服务

```bash
# 启动 Nginx 服务
docker-compose -f docker-compose-nginx-apisix.yml up -d

# 查看服务状态
docker-compose -f docker-compose-nginx-apisix.yml ps

# 查看 Nginx 日志
docker logs nginx-apisix
```

### 5. 验证配置

#### 5.1 测试 HTTPS 连接

```bash
# 测试 HTTPS 连接（由于使用自签名证书，需要添加 -k 选项）
curl -k https://localhost:9443/apisix/admin/routes -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'
```

#### 5.2 测试健康检查

```bash
# 测试 Nginx 健康检查端点
curl -k https://localhost:9443/healthz
```

#### 5.3 测试 APISIX 路由

```bash
# 创建一个测试路由
curl http://localhost:9180/apisix/admin/routes/1 -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "uri": "/hello",
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "httpbin.org:80": 1
    }
  }
}'

# 通过 HTTPS 访问测试路由
curl -k https://localhost:9443/hello
```

## 故障排除

### 1. 行尾符问题

如果您看到类似 `$'': command not found` 的错误，这是由于 Windows 行尾符（CRLF）与 Linux 行尾符（LF）不兼容导致的。

#### 解决方法：

```bash
# 转换脚本文件的行尾符
sed -i 's/$//' generate-ssl-cert.sh

# 如果已经创建了带有错误行尾符的 ssl 目录，删除它
rm -rf 'ssl'$''

# 重新生成 SSL 证书
./generate-ssl-cert.sh
```

### 2. Nginx 无法连接到 APISIX

检查网络配置是否正确：

```bash
# 查看 Docker 网络
docker network inspect example_apisix

# 检查 APISIX 容器是否在正确的网络中
docker inspect example-apisix-1 | grep NetworkMode
```

### 3. SSL 证书问题

确保证书文件权限正确：

```bash
ls -l ssl/
# 应该显示:
# apisix.crt -rw-r--r--
# apisix.key -rw-------
```

### 4. 端口冲突

确保 9443 端口未被其他服务占用：

```bash
ss -tulpn | grep 9443
```

### 5. APISIX 容器无法启动

如果 APISIX 容器无法启动，可以尝试以下步骤：

```bash
# 恢复原始配置文件
cp apisix_conf/config.yaml.bak apisix_conf/config.yaml

# 停止并删除所有容器
docker-compose down

# 重新启动 APISIX
docker-compose up -d

# 查看容器日志
docker logs example-apisix-1
```

### 6. 查看日志

```bash
# 查看 Nginx 日志
docker logs nginx-apisix

# 查看 Nginx 访问日志
docker exec nginx-apisix cat /var/log/nginx/apisix_access.log

# 查看 Nginx 错误日志
docker exec nginx-apisix cat /var/log/nginx/apisix_error.log

# 查看 APISIX 日志
docker logs example-apisix-1
```

## 生产环境建议

在生产环境中，建议：

1. 使用正式的 SSL 证书（如 Let's Encrypt）
2. 配置更严格的 SSL 安全设置
3. 启用访问日志和错误日志
4. 配置速率限制
5. 设置适当的超时时间
6. 配置缓存策略

## 清理

如需清理 Nginx 服务：

```bash
# 停止并删除 Nginx 容器
docker-compose -f docker-compose-nginx-apisix.yml down

# 删除生成的文件（可选）
rm -rf ssl nginx-apisix.conf docker-compose-nginx-apisix.yml generate-ssl-cert.sh
```

## 恢复 APISIX 配置

如果需要恢复 APISIX 的原始配置：

```bash
# 恢复原始配置文件
cp apisix_conf/config.yaml.bak apisix_conf/config.yaml

# 重启 APISIX
docker-compose restart apisix
```
