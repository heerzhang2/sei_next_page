# 修改 APISIX 端口配置指南

## 目标
将 Nginx 配置为在 9443 端口监听 HTTPS，并代理转发到 APISIX 的 HTTP 端口 9080。为此，需要修改 APISIX 配置，让它不占用 9443 端口。

## 步骤

### 1. 查看 APISIX 配置文件

在 WSL 环境中执行以下命令：

```bash
# 进入项目目录
cd /mnt/c/home/wsl-use/apisix-docker/example

# 查看 APISIX 配置文件
cat apisix_conf/config.yaml
```

### 2. 修改 APISIX 配置文件

编辑 `apisix_conf/config.yaml` 文件，找到 `ssl` 端口配置（通常是 `9443`），将其注释掉或改为其他端口。

例如，将：
```yaml
ssl: 9443
```

改为：
```yaml
# ssl: 9443  # 注释掉，让 Nginx 使用 9443 端口
# 或者改为其他端口
ssl: 8443
```

### 3. 重启 APISIX

```bash
# 重启 APISIX 容器
docker-compose restart apisix

# 查看服务状态
docker-compose ps
```

### 4. 验证 APISIX 不再占用 9443 端口

```bash
# 检查端口占用
sudo netstat -tulpn | grep 9443

# 应该没有输出，表示 9443 端口没有被占用
```

### 5. 更新 Nginx 配置

将 Nginx 端口改回 9443：

```bash
# 复制更新后的配置文件
cp /mnt/c/home/sei_next_page/docker-compose-nginx-apisix.yml .

# 启动 Nginx 服务
docker-compose -f docker-compose-nginx-apisix.yml up -d
```

## 注意事项

- 修改 APISIX 配置后，需要重启 APISIX 容器才能生效
- 确保 Nginx 配置文件中的 upstream 指向正确的 APISIX 容器名称和端口
- 如果 APISIX 的配置文件中有多个端口配置，请确保只修改 SSL 端口，不影响其他端口
