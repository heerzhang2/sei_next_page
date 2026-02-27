# APISIX 和 Nginx 配置故障排除指南

## 问题 1: APISIX 仍然占用 9443 端口

### 症状
执行脚本后，APISIX 容器仍然在监听 9443 端口：
```
0.0.0.0:9443->9443/tcp
```

### 可能原因
1. APISIX 配置文件修改未生效
2. 容器未正确重启
3. 配置文件挂载路径不正确

### 诊断步骤

#### 1. 检查 APISIX 配置文件

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 检查配置文件中的 ssl 配置
grep -n "ssl" apisix_conf/config.yaml
```

如果看到 `ssl: 9443` 这一行没有被注释掉，说明配置文件修改未生效。

#### 2. 检查配置文件挂载

```bash
# 检查 APISIX 容器的挂载点
docker inspect example-apisix-1 | grep -A 20 Mounts
```

确认 `/usr/local/apisix/conf/config.yaml` 是否正确挂载到宿主机的 `apisix_conf/config.yaml`。

#### 3. 检查容器内的配置文件

```bash
# 查看容器内的配置文件
docker exec example-apisix-1 cat /usr/local/apisix/conf/config.yaml | grep -A 2 -B 2 "ssl"
```

如果容器内的配置文件仍然包含 `ssl: 9443`，说明配置文件挂载有问题。

### 解决方案

#### 方案 1: 手动修改配置文件

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 备份原始配置文件
cp apisix_conf/config.yaml apisix_conf/config.yaml.manual.bak

# 编辑配置文件
nano apisix_conf/config.yaml
```

找到 `ssl: 9443` 这一行，将其注释掉：
```yaml
# ssl: 9443  # 禁用，让 Nginx 使用 9443 端口
```

保存并退出编辑器，然后重启 APISIX：

```bash
# 停止 APISIX 容器
docker-compose stop apisix

# 启动 APISIX 容器
docker-compose start apisix

# 检查容器端口
docker port example-apisix-1
```

#### 方案 2: 修改 docker-compose.yml 文件

如果配置文件挂载有问题，可以修改 docker-compose.yml 文件，移除 9443 端口的映射：

```bash
# 编辑 docker-compose.yml 文件
nano docker-compose.yml
```

找到 APISIX 服务的端口映射部分，移除 9443 端口的映射：
```yaml
ports:
  - "9080:9080"
  - "9091:9091"
  - "9092:9092"
  - "9180:9180"
  # - "9443:9443"  # 注释掉，让 Nginx 使用 9443 端口
```

保存并退出编辑器，然后重启 APISIX：

```bash
# 重启 APISIX 容器
docker-compose down
docker-compose up -d

# 检查容器端口
docker port example-apisix-1
```

## 问题 2: Nginx 无法连接到 APISIX

### 症状
Nginx 容器无法启动，日志显示：
```
host not found in upstream "apisix:9080"
```

### 可能原因
1. Nginx 容器无法解析 APISIX 主机名
2. Nginx 容器未连接到正确的 Docker 网络
3. APISIX 容器未完全启动

### 诊断步骤

#### 1. 检查 Nginx 容器网络

```bash
# 检查 Nginx 容器的网络配置
docker inspect nginx-apisix | grep -A 20 Networks
```

确认 Nginx 容器是否连接到 `example_apisix` 网络。

#### 2. 检查 APISIX 容器网络

```bash
# 检查 APISIX 容器的网络配置
docker inspect example-apisix-1 | grep -A 20 Networks
```

确认 APISIX 容器是否连接到 `example_apisix` 网络。

#### 3. 测试网络连接

```bash
# 从 Nginx 容器测试连接到 APISIX
docker exec nginx-apisix ping -c 3 apisix
```

如果无法 ping 通，说明网络配置有问题。

### 解决方案

#### 方案 1: 使用 external_links

修改 docker-compose-nginx-apisix.yml 文件，添加 external_links：

```yaml
services:
  nginx:
    # ... 其他配置 ...
    external_links:
      - example-apisix-1:apisix
```

然后重启 Nginx：

```bash
docker-compose -f docker-compose-nginx-apisix.yml down
docker-compose -f docker-compose-nginx-apisix.yml up -d
```

#### 方案 2: 使用容器 IP 地址

如果主机名解析有问题，可以使用容器 IP 地址：

```bash
# 获取 APISIX 容器的 IP 地址
docker inspect example-apisix-1 | grep IPAddress
```

修改 nginx-apisix.conf 文件，使用 IP 地址：

```nginx
upstream apisix_backend {
    server 172.18.0.7:9080;  # 替换为实际的 IP 地址
    keepalive 32;
}
```

然后重启 Nginx：

```bash
docker-compose -f docker-compose-nginx-apisix.yml restart
```

## 问题 3: Nginx 健康检查失败

### 症状
Nginx 容器状态显示 `unhealthy` 或 `health: starting`。

### 可能原因
1. 健康检查端点配置不正确
2. Nginx 配置错误
3. 网络连接问题

### 诊断步骤

#### 1. 检查 Nginx 日志

```bash
# 查看 Nginx 日志
docker logs nginx-apisix
```

#### 2. 手动测试健康检查端点

```bash
# 从 Nginx 容器内部测试健康检查
docker exec nginx-apisix wget --quiet --tries=1 --spider http://localhost/healthz
```

### 解决方案

#### 方案 1: 修改健康检查配置

修改 docker-compose-nginx-apisix.yml 文件，调整健康检查配置：

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/healthz"]
  interval: 30s  # 增加间隔时间
  timeout: 10s   # 增加超时时间
  retries: 5     # 增加重试次数
  start_period: 30s  # 增加启动等待时间
```

然后重启 Nginx：

```bash
docker-compose -f docker-compose-nginx-apisix.yml restart
```

#### 方案 2: 添加健康检查端点

修改 nginx-apisix.conf 文件，添加健康检查端点：

```nginx
server {
    listen 9443 ssl http2;
    server_name localhost;

    # ... 其他配置 ...

    # 健康检查端点
    location /healthz {
        access_log off;
        return 200 "healthy
";
        add_header Content-Type text/plain;
    }
}
```

然后重启 Nginx：

```bash
docker-compose -f docker-compose-nginx-apisix.yml restart
```

## 问题 4: SSL 证书问题

### 症状
访问 HTTPS 端点时出现 SSL 证书错误。

### 可能原因
1. SSL 证书未正确生成
2. SSL 证书文件权限不正确
3. SSL 证书文件路径不正确

### 诊断步骤

#### 1. 检查 SSL 证书文件

```bash
# 检查 SSL 证书文件是否存在
ls -l ssl/
```

#### 2. 检查 SSL 证书文件权限

```bash
# 检查 SSL 证书文件权限
ls -l ssl/apisix.crt
ls -l ssl/apisix.key
```

证书文件权限应该是：
- apisix.crt: -rw-r--r--
- apisix.key: -rw-------

#### 3. 检查 Nginx 配置中的 SSL 证书路径

```bash
# 检查 Nginx 配置中的 SSL 证书路径
grep -n "ssl_certificate" nginx-apisix.conf
```

### 解决方案

#### 方案 1: 重新生成 SSL 证书

```bash
# 删除旧的 SSL 证书
rm -rf ssl

# 重新生成 SSL 证书
./generate-ssl-cert.sh
```

#### 方案 2: 修改 SSL 证书文件权限

```bash
# 修改 SSL 证书文件权限
chmod 644 ssl/apisix.crt
chmod 600 ssl/apisix.key
```

## 问题 5: 端口冲突

### 症状
启动 Nginx 时出现端口冲突错误：
```
Bind for 0.0.0.0:9443 failed: port is already allocated
```

### 可能原因
1. APISIX 仍然占用 9443 端口
2. 其他服务占用 9443 端口

### 诊断步骤

#### 1. 检查 9443 端口占用情况

```bash
# 使用 ss 命令检查端口占用
ss -tulpn | grep 9443
```

#### 2. 检查占用 9443 端口的容器

```bash
# 检查占用 9443 端口的容器
docker ps | grep 9443
```

### 解决方案

#### 方案 1: 禁用 APISIX 的 9443 端口

参考问题 1 的解决方案。

#### 方案 2: 使用不同的端口

修改 docker-compose-nginx-apisix.yml 文件，使用不同的端口：

```yaml
ports:
  - "9444:9443"  # 使用 9444 端口
```

然后重启 Nginx：

```bash
docker-compose -f docker-compose-nginx-apisix.yml restart
```

## 总结

1. 首先检查 APISIX 配置文件，确认 9443 端口是否被禁用
2. 检查容器日志，了解详细的错误信息
3. 检查网络配置，确保容器可以相互通信
4. 检查端口占用情况，确保没有端口冲突
5. 如果遇到问题，可以参考本文档中的诊断步骤和解决方案

如果以上方法都无法解决问题，请提供以下信息：
- APISIX 配置文件内容（apisix_conf/config.yaml）
- Nginx 配置文件内容（nginx-apisix.conf）
- Docker Compose 文件内容（docker-compose.yml 和 docker-compose-nginx-apisix.yml）
- 容器日志（docker logs example-apisix-1 和 docker logs nginx-apisix）
- 容器状态（docker-compose ps 和 docker-compose -f docker-compose-nginx-apisix.yml ps）
