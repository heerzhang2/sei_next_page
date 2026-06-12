# LibreOffice UNO 书签填充 - Docker 配置指南

## 概述

本方案使用 **LibreOffice UNO 桥接 + Python** 在 Linux/Docker 中填充 Word (.doc) 文档的书签，相比 Windows COM 自动化或 LibreOffice 命令行，此方案：

✅ **完全兼容 Linux/Docker**
✅ **保留文档原始格式和样式**
✅ **支持 .doc (OLE) 和 .docx (OpenXML) 格式**
✅ **高度稳定**（通过 UNO 套接字通信）

---

## 架构

```
Node.js (Next.js API Route)
    ↓
  child_process.execSync()
    ↓
Python 脚本 (fill-bookmarks.py)
    ↓
LibreOffice UNO 套接字连接
    ↓
LibreOffice Headless 实例 (soffice)
    ↓
.doc 文件书签替换
```

---

## 前置需求

### 1. 您的 Docker 容器中需要安装

```bash
# Debian/Ubuntu
apt-get update && apt-get install -y \
  libreoffice \
  libreoffice-writer \
  python3 \
  python3-uno

# 或 RedHat/CentOS/Fedora
yum install -y \
  libreoffice \
  libreoffice-writer \
  python3 \
  libreoffice-sdk-doc
```

### 2. 验证安装

```bash
# 检查 LibreOffice
libreoffice --version

# 检查 Python UNO
python3 -c "import uno; print('UNO OK')"
```

---

## 启动步骤

### 步骤 1：启动 LibreOffice Headless 服务（Docker 入口点）

在您的 **Dockerfile** 中添加：

```dockerfile
FROM node:18-bullseye

# ... 其他配置 ...

# 安装 LibreOffice + Python
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    python3 \
    python3-uno \
    && rm -rf /var/lib/apt/lists/*

# 后台启动 LibreOffice UNO 套接字服务
# 在启动应用前启动 soffice
EXPOSE 2002

# 创建启动脚本
RUN mkdir -p /app/scripts
COPY ./scripts/start-libreoffice.sh /app/scripts/
RUN chmod +x /app/scripts/start-libreoffice.sh

# 在 docker-compose 或 entrypoint 中使用此脚本
CMD ["/app/scripts/start-libreoffice.sh"]
```

### 步骤 2：创建 LibreOffice 启动脚本

创建文件 `scripts/start-libreoffice.sh`：

```bash
#!/bin/bash
set -e

echo "[INFO] 启动 LibreOffice UNO 套接字服务..."

# 后台启动 soffice
soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &
SOFFICE_PID=$!

# 等待套接字可用（最多 30 秒）
for i in {1..30}; do
    if python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); s.close()" 2>/dev/null; then
        echo "[OK] LibreOffice UNO 套接字已就绪 (PID: $SOFFICE_PID)"
        break
    fi
    echo "[WAIT] 等待 LibreOffice 启动... ($i/30)"
    sleep 1
done

# 启动 Node.js 应用
echo "[INFO] 启动 Node.js 应用..."
exec node "$@"
```

### 步骤 3：docker-compose.yml 配置

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
      - "2002:2002"
    environment:
      NODE_ENV: production
    volumes:
      - ./src:/app/src
      - /tmp:/tmp
    entrypoint: /app/scripts/start-libreoffice.sh
    command: npm run start
```

---

## 使用方式

### 1. API 端点调用

**POST /api/oa-proxy/draft**

请求体：

```json
{
  "step": "start",
  "unid": "20260611084142XX699307D7E60F416D",
  "jsessionId": "19A5B0E500107544957D41CABF46519A",
  "fileUnid": "20180103130508XX93D18667093740A7"
}
```

响应：

```json
{
  "success": true,
  "data": {
    "templateBase64": "0M8R4KGA...",
    "templateSize": 33792,
    "bookmarkKeys": [
      "主送单位",
      "保密期限",
      "分送单位",
      "发文年号",
      "密级",
      "拟稿人",
      "拟稿单位",
      "拟稿日期",
      "机关代字",
      "正题名",
      "紧急程度"
    ],
    "fillResult": {
      "ok": true,
      "message": "成功替换 11 个书签"
    }
  }
}
```

### 2. 直接调用 Python 脚本（调试）

```bash
python3 /app/src/app/api/oa-proxy/fill-bookmarks.py \
  /tmp/template.doc \
  '{"书签1": "值1", "书签2": "值2"}'
```

输出：

```json
{
  "success": true,
  "message": "成功替换 2 个书签",
  "file_size": 33792,
  "replaced_count": 2
}
```

---

## 故障排查

### 问题 1：UNO 套接字连接失败

**错误信息：**
```
无法连接到 LibreOffice UNO 套接字。请确保 soffice 已以下列方式启动
```

**解决方案：**

```bash
# 检查 soffice 进程是否运行
ps aux | grep soffice

# 手动启动（调试）
soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &

# 检查端口 2002 是否开放
netstat -tuln | grep 2002
# 或
ss -tuln | grep 2002

# 检查 Python UNO 连接
python3 -c "
import socket
s = socket.socket()
s.connect(('127.0.0.1', 2002))
print('连接成功')
s.close()
"
```

### 问题 2：书签未被替换

**可能原因：**
1. 书签名不匹配（大小写敏感）
2. 书签已被删除或损坏
3. 文档格式不支持（仅支持 .doc 和 .docx）

**调试步骤：**

```bash
# 使用 libreoffice --headless 将 doc 转为 PDF 查看
libreoffice --headless --convert-to pdf /tmp/template.doc --outdir /tmp

# 使用 Python 脚本的详细输出
python3 /app/src/app/api/oa-proxy/fill-bookmarks.py \
  /tmp/template.doc \
  '{"书签1": "测试"}' 2>&1
```

### 问题 3：性能问题（超时）

LibreOffice 启动较慢，可能导致首次请求超时。

**优化方案：**

1. **增加超时时间**（已在代码中设置为 120 秒）
2. **使用连接池**：复用 LibreOffice 实例，避免重复启动
3. **异步处理**：使用队列服务（Bull MQ 等）异步处理书签填充

示例（使用 Bull MQ）：

```typescript
// API 端点直接返回任务 ID，不等待
const job = await bookmarkQueue.add({
  docPath,
  bookmarkValues,
});

// 前端轮询或 WebSocket 等待任务完成
return NextResponse.json({ taskId: job.id });
```

### 问题 4：内存泄漏

长期运行 LibreOffice 可能导致内存泄漏。

**解决方案：**

```bash
# 每隔 X 小时重启 soffice（在启动脚本中）
*/6 * * * * pkill -9 soffice; soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &
```

---

## 性能指标

| 操作 | 耗时 | 说明 |
|------|------|------|
| soffice 启动 | 3-5 秒 | 一次性，后续复用 |
| 打开文档 | 1-2 秒 | 取决于文件大小 |
| 替换 10 个书签 | <1 秒 | 线性增长 |
| 保存文档 | 1-2 秒 | 取决于文件大小 |
| **总计（冷启动）** | **6-10 秒** | 首次请求 |
| **总计（热启动）** | **2-4 秒** | 后续请求 |

---

## 最佳实践

1. **在 Docker 启动时一次性启动 soffice**，之后复用
2. **定期检查 LibreOffice 进程和内存使用**
3. **为高频请求使用异步队列**（Bull MQ + Redis）
4. **定期重启 soffice**（如每 6 小时）以释放内存
5. **使用日志记录每次书签填充**，便于调试
6. **添加监控告警**，当 soffice 进程异常时自动重启

---

## 对比表：不同方案

| 方案 | 兼容性 | 格式保留 | 部署难度 | 性能 | 成本 |
|------|--------|---------|---------|------|------|
| **Windows Word COM** | ❌ Windows only | ⭐⭐⭐⭐⭐ | 简单 | 快 | 低 |
| **LibreOffice CLI** | ✅ 跨平台 | ⭐⭐ | 中 | 慢 | 低 |
| **LibreOffice UNO（本方案）** | ✅ 跨平台 | ⭐⭐⭐⭐⭐ | 中 | 中等 | 低 |
| **云服务（Google Docs API）** | ✅ 跨平台 | ⭐⭐⭐⭐ | 简单 | 快 | 高 |
| **微服务（专用书签服务）** | ✅ 跨平台 | ⭐⭐⭐⭐⭐ | 复杂 | 快 | 中 |

---

## 参考资源

- [LibreOffice UNO API](https://api.libreoffice.org/)
- [Python UNO Bridge](https://wiki.openoffice.org/wiki/PyUNO)
- [LibreOffice Headless 模式](https://help.libreoffice.org/latest/en-US/text/shared/guide/headless.html)
- [Word 书签处理最佳实践](https://docs.microsoft.com/en-us/office/vba/word/concepts/fields-wdfields/working-with-bookmarks)
