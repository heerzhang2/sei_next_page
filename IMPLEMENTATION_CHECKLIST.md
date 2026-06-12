# Word 文档书签替换 - 完整实施检查清单

使用此清单确保您的部署万无一失。

---

## 📋 第一阶段：准备工作（本地开发环境）

### 1. 验证代码已正确生成

- [ ] 确认 `fill-bookmarks.py` 文件存在
  ```bash
  ls -la packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py
  ```

- [ ] 确认 `draft/route.ts` 已更新
  ```bash
  grep -n "fillBookmarksWithLibreOffice" packages/mainProj/src/app/api/oa-proxy/draft/route.ts
  ```
  应该返回 2-3 个匹配

- [ ] 确认启动脚本存在
  ```bash
  ls -la scripts/start-libreoffice.sh
  cat scripts/start-libreoffice.sh | head -10
  ```

- [ ] 确认 Docker 相关文件存在
  ```bash
  ls -la Dockerfile.libreoffice docker-compose.libreoffice.yml
  ```

### 2. 代码审查

- [ ] 查看 Python 脚本，确认没有语法错误
  ```bash
  python3 -m py_compile packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py
  ```
  应该无输出（成功）

- [ ] 查看 TypeScript 编译错误
  ```bash
  yarn build
  ```
  应该成功编译，draft/route.ts 无错误

- [ ] 检查缺失的导入
  ```bash
  grep -n "^import\|^const" packages/mainProj/src/app/api/oa-proxy/draft/route.ts | head -20
  ```
  应该包含 `fs`, `path`, `execSync`, `tmpdir` 等

---

## 📋 第二阶段：Docker 镜像构建

### 1. 准备 Dockerfile

- [ ] 确认您已有现有的 Dockerfile 或使用我提供的 `Dockerfile.libreoffice`

- [ ] 如果使用现有 Dockerfile，添加以下内容：
  ```dockerfile
  # 在现有的 FROM ... 之后添加
  
  # 安装 LibreOffice
  RUN apt-get update && apt-get install -y \
      libreoffice \
      libreoffice-writer \
      python3-uno \
      && rm -rf /var/lib/apt/lists/*
  
  # 复制启动脚本
  COPY scripts/start-libreoffice.sh /app/scripts/
  RUN chmod +x /app/scripts/start-libreoffice.sh
  
  # 暴露端口
  EXPOSE 3000 2002
  
  # 修改启动命令
  ENTRYPOINT ["/app/scripts/start-libreoffice.sh"]
  CMD ["yarn", "start"]
  ```

- [ ] Dockerfile 是否正确指向启动脚本？
  ```bash
  grep -n "start-libreoffice.sh" Dockerfile
  ```

### 2. 构建镜像

- [ ] 构建 Docker 镜像
  ```bash
  docker build -f Dockerfile.libreoffice -t sei-oa:latest .
  ```
  
- [ ] 验证构建成功
  ```bash
  docker images | grep sei-oa
  ```
  应该显示刚刚构建的镜像

- [ ] 检查 LibreOffice 是否已安装
  ```bash
  docker run sei-oa:latest libreoffice --version
  ```
  应该输出版本号

- [ ] 检查 Python UNO 是否可用
  ```bash
  docker run sei-oa:latest python3 -c "import uno; print('UNO OK')"
  ```
  应该输出 "UNO OK"

---

## 📋 第三阶段：容器启动和验证

### 1. 使用 docker-compose 启动（推荐）

- [ ] 配置 `docker-compose.libreoffice.yml`
  ```bash
  cat docker-compose.libreoffice.yml | head -20
  ```

- [ ] 启动服务
  ```bash
  docker-compose -f docker-compose.libreoffice.yml up -d
  ```

- [ ] 验证容器运行
  ```bash
  docker-compose -f docker-compose.libreoffice.yml ps
  ```
  应该显示 `app` 和 `redis` 容器处于 "Up" 状态

- [ ] 查看启动日志
  ```bash
  docker-compose -f docker-compose.libreoffice.yml logs app
  ```
  应该看到：
  - `[INFO] 启动 LibreOffice UNO 套接字服务...`
  - `[OK] LibreOffice UNO 套接字已就绪`
  - `[INFO] 启动 Node.js 应用...`

### 2. 或直接使用 docker run

- [ ] 启动容器
  ```bash
  docker run -d \
    -p 3000:3000 \
    -p 2002:2002 \
    --name sei-oa-app \
    sei-oa:latest
  ```

- [ ] 验证容器运行
  ```bash
  docker ps | grep sei-oa-app
  ```

- [ ] 查看日志
  ```bash
  docker logs -f sei-oa-app
  ```

### 3. 端口验证

- [ ] 应用端口 (3000) 是否开放
  ```bash
  docker exec sei-oa-app netstat -tuln | grep 3000
  ```
  或者（如果 netstat 不可用）
  ```bash
  curl http://localhost:3000/health 2>/dev/null || echo "端口检查中..."
  ```

- [ ] UNO 套接字端口 (2002) 是否开放
  ```bash
  docker exec sei-oa-app netstat -tuln | grep 2002
  ```

- [ ] soffice 进程是否运行
  ```bash
  docker exec sei-oa-app ps aux | grep soffice
  ```
  应该看到 soffice 进程

---

## 📋 第四阶段：API 功能测试

### 1. 基础连通性测试

- [ ] 测试应用是否响应
  ```bash
  curl http://localhost:3000/health
  ```

- [ ] 测试现有的 OA proxy 路由（如果有）
  ```bash
  curl http://localhost:3000/api/oa-proxy/todo-list \
    -H "Content-Type: application/json" \
    -d '{"jsessionId": "test"}'
  ```

### 2. 书签填充 API 测试

#### 步骤 1: 测试 "check" 步骤

```bash
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{
    "step": "check",
    "unid": "20260611084142XX699307D7E60F416D",
    "jsessionId": "YOUR_JSESSION_ID",
    "agency_unid": "",
    "doctype_value": "2",
    "itemUnid": ""
  }' | python3 -m json.tool
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "isExists": true,
    "isOpen": true,
    "fileUnid": "...",
    "needTemplate": true
  }
}
```

- [ ] 响应是否成功（success: true）？

#### 步骤 2: 测试 "templates" 步骤

```bash
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{
    "step": "templates",
    "unid": "20260611084142XX699307D7E60F416D",
    "jsessionId": "YOUR_JSESSION_ID",
    "agency_unid": "",
    "docFileType": "doc_fw"
  }' | python3 -m json.tool
```

**预期响应：**
```json
{
  "success": true,
  "data": {
    "templates": [
      {"fileUnid": "...", "name": "模板1"},
      {"fileUnid": "...", "name": "模板2"}
    ]
  }
}
```

- [ ] 是否返回模板列表？

#### 步骤 3: 测试 "start" 步骤（关键！）

```bash
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{
    "step": "start",
    "unid": "20260611084142XX699307D7E60F416D",
    "jsessionId": "YOUR_JSESSION_ID",
    "agency_unid": "",
    "doctype_value": "2",
    "itemUnid": "",
    "fileUnid": "20180103130508XX93D18667093740A7",
    "docFileType": "doc_fw"
  }' | python3 -m json.tool
```

**预期响应（关键字段）：**
```json
{
  "success": true,
  "data": {
    "templateBase64": "0M8R4KGA...",
    "templateSize": 33792,
    "bookmarkKeys": ["主送单位", "密级", ...],
    "fillResult": {
      "ok": true,
      "message": "成功替换 11 个书签"
    }
  }
}
```

- [ ] 是否返回成功（success: true）？
- [ ] templateBase64 是否非空？
- [ ] bookmarkKeys 是否包含书签名称？
- [ ] fillResult 是否显示成功（ok: true）？

### 3. 错误处理测试

#### 测试缺少参数

```bash
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{"step": "start"}'
```

- [ ] 是否返回 HTTP 400 和错误信息？

#### 测试无效的 JSESSIONID

```bash
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{
    "step": "start",
    "unid": "TEST",
    "jsessionId": "INVALID_SESSION"
  }'
```

- [ ] 是否返回合适的错误信息（无需暴露内部细节）？

---

## 📋 第五阶段：文档内容验证

### 1. 下载并检查输出文件

```bash
# 从 API 响应中提取 templateBase64，保存为 .doc 文件
curl -s -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{...}' | \
  python3 -c "
    import sys, json, base64
    data = json.load(sys.stdin)
    b64 = data['data']['templateBase64']
    with open('/tmp/output.doc', 'wb') as f:
      f.write(base64.b64decode(b64))
  "

file /tmp/output.doc
```

- [ ] 文件类型是否为 "Microsoft Word Document"？
- [ ] 文件大小是否合理（> 1KB）？

### 2. 在本地验证文档

- [ ] 用 Word / LibreOffice 打开 `/tmp/output.doc`
- [ ] 验证书签是否已被替换（检查内容是否正确）
- [ ] 验证格式是否保留（排版、表格、样式等）
- [ ] 验证没有任何错误信息或损坏迹象

### 3. 性能测试

- [ ] 测试响应时间（从请求到收到完整响应）
  ```bash
  time curl -X POST http://localhost:3000/api/oa-proxy/draft \
    -H "Content-Type: application/json" \
    -d '{...}' > /dev/null
  ```
  
  - [ ] 首次请求耗时多少秒？（预期 8-12 秒）
  - [ ] 第二次请求耗时多少秒？（预期 2-5 秒）
  - [ ] 响应时间是否可接受？

---

## 📋 第六阶段：生产部署前检查

### 1. 日志和监控

- [ ] 应用日志是否记录了所有请求？
  ```bash
  docker logs sei-oa-app | grep "draft"
  ```

- [ ] 是否有任何错误或警告？
  ```bash
  docker logs sei-oa-app | grep -i "error\|warning"
  ```

- [ ] LibreOffice 进程是否正常运行？
  ```bash
  docker exec sei-oa-app ps aux | grep soffice
  ```

- [ ] 内存使用是否正常？
  ```bash
  docker stats sei-oa-app --no-stream
  ```
  soffice 内存使用应该在 300MB-500MB

### 2. 数据库和缓存

- [ ] Redis 是否正常运行（如果使用）？
  ```bash
  docker exec sei-oa-redis redis-cli ping
  ```
  应该返回 "PONG"

- [ ] 数据库连接是否正常？
  ```bash
  curl http://localhost:3000/api/health
  ```

### 3. 安全检查

- [ ] 是否已移除所有 console.log() 调试语句？
  ```bash
  grep -n "console\.\(log\|error\|warn\)" packages/mainProj/src/app/api/oa-proxy/draft/route.ts
  ```
  应该没有结果

- [ ] 是否已设置正确的环境变量？
  ```bash
  docker exec sei-oa-app env | grep -i "node_env\|libreoffice"
  ```

- [ ] 是否已配置文件路径安全检查？
  ```bash
  grep -n "path\." packages/mainProj/src/app/api/oa-proxy/draft/route.ts | head -5
  ```

- [ ] 错误消息是否会暴露敏感信息？
  ```bash
  curl -X POST http://localhost:3000/api/oa-proxy/draft \
    -H "Content-Type: application/json" \
    -d '{"step": "invalid"}' | python3 -m json.tool
  ```
  检查错误信息是否包含文件路径、IP 等敏感信息

### 4. 备份和恢复

- [ ] 是否已备份当前的工作代码？
  ```bash
  git commit -m "添加 LibreOffice UNO 书签填充功能"
  git tag -a v1.0-bookmark -m "First version with bookmark filling"
  ```

- [ ] 是否可以快速回滚？
  ```bash
  git log --oneline | head -5
  ```

---

## 📋 第七阶段：生产部署

### 1. 部署到生产环境

选择您的部署方式：

#### 方式 A: Docker Registry（推荐）

```bash
# 1. 标记镜像
docker tag sei-oa:latest registry.example.com/sei-oa:latest

# 2. 推送镜像
docker push registry.example.com/sei-oa:latest

# 3. 验证推送成功
docker pull registry.example.com/sei-oa:latest
```

- [ ] 镜像是否成功推送到 Registry？

#### 方式 B: Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sei-oa
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sei-oa
  template:
    metadata:
      labels:
        app: sei-oa
    spec:
      containers:
      - name: sei-oa
        image: sei-oa:latest
        ports:
        - containerPort: 3000
        - containerPort: 2002
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

- [ ] 是否已正确配置资源限制？

### 2. 生产环境验证

- [ ] 应用是否正常启动？
  ```bash
  curl https://your-production-domain/health
  ```

- [ ] API 是否能正常处理请求？
  ```bash
  curl -X POST https://your-production-domain/api/oa-proxy/draft ...
  ```

- [ ] 是否有任何异常日志？
  ```bash
  kubectl logs deployment/sei-oa --tail=50
  ```

- [ ] 生产环境中的响应时间是否可接受？

### 3. 监控设置

- [ ] 是否已配置 CPU 和内存告警？
- [ ] 是否已配置错误率告警？
- [ ] 是否已配置响应时间告警？

---

## 📋 第八阶段：上线后维护

### 1. 日常监控（每天）

- [ ] 检查应用是否正常运行
  ```bash
  ps aux | grep soffice
  curl https://your-domain/health
  ```

- [ ] 检查日志是否有异常
  ```bash
  docker logs sei-oa-app --since 1h | grep -i error
  ```

### 2. 定期维护（每周）

- [ ] 检查内存泄漏
  ```bash
  docker stats sei-oa-app --no-stream
  ```

- [ ] 验证书签填充功能是否正常
  ```bash
  curl -X POST https://your-domain/api/oa-proxy/draft ...
  ```

- [ ] 查看错误日志并修复已知问题

### 3. 定期优化（每月）

- [ ] 分析 API 性能指标（p50, p95, p99）
- [ ] 考虑是否需要水平扩展
- [ ] 考虑是否需要异步队列优化

---

## 🎉 完成标志

当您能够勾选以下所有项目时，表示部署成功：

- [ ] ✅ Docker 镜像构建成功
- [ ] ✅ 容器启动且 LibreOffice 进程运行正常
- [ ] ✅ UNO 套接字端口 2002 开放
- [ ] ✅ API /api/oa-proxy/draft 能正确处理所有步骤
- [ ] ✅ 书签填充成功且文档格式保留完整
- [ ] ✅ 性能在可接受范围内（< 5 秒）
- [ ] ✅ 生产环境已部署且运行正常
- [ ] ✅ 监控和告警已配置
- [ ] ✅ 文档齐全，团队已培训

---

## 📝 故障排查快速链接

遇到问题？按优先级查看：

1. **LibreOffice 连接失败** → [LIBREOFFICE_SETUP.md § 问题 1](./LIBREOFFICE_SETUP.md)
2. **书签未被替换** → [LIBREOFFICE_SETUP.md § 问题 2](./LIBREOFFICE_SETUP.md)
3. **性能问题** → [LIBREOFFICE_SETUP.md § 问题 3](./LIBREOFFICE_SETUP.md)
4. **内存泄漏** → [LIBREOFFICE_SETUP.md § 问题 4](./LIBREOFFICE_SETUP.md)
5. **格式变乱** → [BOOKMARK_SOLUTION.md § Q4](./BOOKMARK_SOLUTION.md)

---

## 联系方式

如有问题，请：
1. 查看 [BOOKMARK_README.md](./BOOKMARK_README.md) 获取完整概述
2. 参考 [ARCHITECTURE.md](./ARCHITECTURE.md) 理解技术细节
3. 运行 `bash test-bookmark-filling.sh` 进行集成测试

祝您部署顺利！🚀
