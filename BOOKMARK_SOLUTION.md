# Word 文档书签替换完整解决方案

## 📊 方案对比

| 指标 | Windows COM | LibreOffice CLI | **LibreOffice UNO（推荐）** |
|------|------------|-----------------|----------------------|
| **兼容性** | ❌ Windows 只 | ✅ 跨平台 | ✅ 跨平台 |
| **格式保留** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Docker 支持** | ❌ 不支持 | ⚠ 有限 | ✅ 完全支持 |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **稳定性** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **启动开销** | 中 | 高（每次都转换） | 中（首次启动 soffice） |

## 🎯 您的选择

✅ **LibreOffice UNO + Python（您已选择）**

- 支持 Linux Docker
- 保留文档完整格式（重点！）
- 简单文本替换（您的需求）
- 性能合理

---

## 📁 已创建的文件清单

### 1. **核心实现**

```
packages/mainProj/src/app/api/oa-proxy/
├── fill-bookmarks.py          ✨ 核心：LibreOffice UNO 书签填充脚本
└── draft/route.ts              ✏️  更新：替换 PowerShell 为 Python 调用
```

### 2. **Docker 配置**

```
├── Dockerfile.libreoffice      🐳 Docker 镜像配置
├── docker-compose.libreoffice.yml  🐳 Docker Compose 编排
└── scripts/
    └── start-libreoffice.sh    🚀 启动脚本（后台启动 soffice）
```

### 3. **文档和测试**

```
├── LIBREOFFICE_SETUP.md        📚 完整部署指南
├── BOOKMARK_SOLUTION.md        📚 本文件 - 快速参考
└── test-bookmark-filling.sh    🧪 集成测试脚本
```

---

## 🚀 快速启动（5 分钟）

### A. 本地测试（仅 Docker Linux 环境）

```bash
# 1. 构建 Docker 镜像
docker build -f Dockerfile.libreoffice -t sei-oa:latest .

# 2. 启动容器
docker run -p 3000:3000 -p 2002:2002 sei-oa:latest

# 3. 在另一个终端测试 API
curl -X POST http://localhost:3000/api/oa-proxy/draft \
  -H "Content-Type: application/json" \
  -d '{
    "step": "start",
    "unid": "20260611084142XX699307D7E60F416D",
    "jsessionId": "19A5B0E500107544957D41CABF46519A",
    "fileUnid": "20180103130508XX93D18667093740A7"
  }'
```

### B. 使用 docker-compose（推荐）

```bash
# 1. 启动所有服务（包括 Redis）
docker-compose -f docker-compose.libreoffice.yml up -d

# 2. 查看日志
docker-compose -f docker-compose.libreoffice.yml logs -f app

# 3. 停止服务
docker-compose -f docker-compose.libreoffice.yml down
```

### C. 直接测试 Python 脚本（调试）

```bash
# 方式 1：在 Docker 容器内
docker exec sei-oa-app python3 /app/packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py \
  /tmp/template.doc \
  '{"主送单位": "中央人民政府", "密级": "秘密"}'

# 方式 2：使用测试脚本（需要本地 LibreOffice + Python）
bash test-bookmark-filling.sh /path/to/your/template.doc /tmp/output
```

---

## 🔧 工作原理

### 调用流程

```
1. 前端发送请求
   ↓
2. POST /api/oa-proxy/draft (Node.js)
   ↓
3. 从 OA 系统下载 .doc 模板 + 书签值
   ↓
4. 调用 Python 脚本
   child_process.execSync('python3 fill-bookmarks.py ...')
   ↓
5. Python 脚本通过 UNO 套接字连接 LibreOffice
   ↓
6. LibreOffice 打开 .doc 文件
   ↓
7. 遍历书签，逐一替换内容
   ↓
8. 保存文件（保留原格式）
   ↓
9. Python 返回成功/失败 JSON
   ↓
10. Node.js 返回 Base64 编码的 .doc 文件
   ↓
11. 前端自动下载
```

### 关键特点

1. **LibreOffice 常驻后台**：一次启动，后续请求复用
2. **UNO 套接字通信**：比命令行更稳定，格式损失少
3. **JSON 参数传递**：易于序列化和调试
4. **错误处理完整**：连接失败、书签不存在等都有对应提示

---

## 📋 关键配置

### 1. Docker 启动命令

您的 `Dockerfile` 或启动脚本必须包含：

```bash
# 后台启动 LibreOffice UNO 套接字
soffice --headless --norestore --accept="socket,host=127.0.0.1,port=2002;urp;" &

# 等待 2002 端口就绪
# ... 等待逻辑 ...

# 启动 Node.js 应用
npm run start
```

我已为您创建了完整的 `scripts/start-libreoffice.sh`，直接使用即可。

### 2. 环境变量（可选）

如果需要自定义 LibreOffice 连接，在 `.env` 中添加：

```env
LIBREOFFICE_HOST=127.0.0.1
LIBREOFFICE_PORT=2002
```

然后在代码中使用：

```typescript
const LIBREOFFICE_HOST = process.env.LIBREOFFICE_HOST || '127.0.0.1';
const LIBREOFFICE_PORT = process.env.LIBREOFFICE_PORT || '2002';
```

### 3. 超时和并发配置

编辑 `draft/route.ts` 中的常量：

```typescript
// 调整超时时间（毫秒）
const FILL_BOOKMARKS_TIMEOUT = 120000;  // 120 秒

// 调整最大并发填充数
const MAX_CONCURRENT_FILLS = 5;
```

---

## ✅ 验证清单

部署前，确保：

- [ ] LibreOffice 已安装在 Docker 镜像中
  ```bash
  apt-get install -y libreoffice libreoffice-writer python3-uno
  ```

- [ ] Python UNO 库可用
  ```bash
  python3 -c "import uno; print('OK')"
  ```

- [ ] 启动脚本已复制到 Docker 镜像
  ```dockerfile
  COPY scripts/start-libreoffice.sh /app/scripts/
  RUN chmod +x /app/scripts/start-libreoffice.sh
  ```

- [ ] `fill-bookmarks.py` 已包含在镜像中
  ```dockerfile
  COPY packages/mainProj/src/app/api/oa-proxy/fill-bookmarks.py /app/
  ```

- [ ] 暴露了必要的端口
  ```dockerfile
  EXPOSE 3000 2002
  ```

- [ ] 已配置健康检查（可选但推荐）
  ```dockerfile
  HEALTHCHECK --interval=30s CMD python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); s.close()"
  ```

---

## 🐛 常见问题

### Q1: "无法连接到 LibreOffice UNO 套接字"

**原因**：soffice 未启动或未监听 2002 端口

**解决**：
```bash
# 检查进程
ps aux | grep soffice

# 检查端口
netstat -tuln | grep 2002

# 手动启动（调试）
soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &
sleep 5
python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); print('OK')"
```

### Q2: 书签未被替换

**原因**：书签名不匹配或文档损坏

**解决**：
```bash
# 1. 检查书签名是否存在（用 Word 打开文档）
# 确保书签名 100% 匹配（区分大小写）

# 2. 测试脚本的输出
python3 fill-bookmarks.py /path/to/doc.doc '{"书签1": "值1"}' 2>&1 | python3 -m json.tool
```

### Q3: 内存泄漏或 soffice 进程挂死

**原因**：长期运行 LibreOffice 可能出现问题

**解决**：
```bash
# 方案 1：定期重启（每 6 小时）
*/6 * * * * pkill -9 soffice; soffice --headless --accept="socket,host=127.0.0.1,port=2002;urp;" &

# 方案 2：使用异步队列（Bull MQ + Redis）
# 这样即使 soffice 重启也不会丢失任务
```

### Q4: 格式还是会变乱

**原因**：某些复杂的 Word 特性（宏、VBA、OLE 对象）UNO 可能不完全支持

**解决**：
```bash
# 1. 检查文档是否包含宏或 OLE 对象
# 用 Word 打开，查看"文件" → "信息" → "检查问题"

# 2. 简化文档：移除不必要的格式化
# - 删除隐藏的标记
# - 使用标准字体
# - 避免复杂的表格嵌套

# 3. 转换为 .docx 再处理（如果原文档允许）
libreoffice --headless --convert-to docx template.doc
```

---

## 📊 性能参考

| 操作 | 时间 | 说明 |
|------|------|------|
| soffice 首次启动 | 3-5 秒 | 一次性 |
| 打开 .doc 文件 | 1-2 秒 | 取决于大小 |
| 替换 1 个书签 | <0.1 秒 | 线性增长 |
| 替换 10 个书签 | <1 秒 | 整体约 <1 秒 |
| 保存文件 | 1-2 秒 | 取决于大小 |
| **完整请求（热启动）** | **2-5 秒** | soffice 已启动 |
| **完整请求（冷启动）** | **8-12 秒** | soffice 需启动 |

💡 **优化建议**：
- 定时预热 soffice（启动应用时自动启动）
- 为高频操作使用异步队列
- 考虑使用反向代理缓存（如 Nginx）

---

## 🔐 安全考虑

1. **输入验证**：Python 脚本中已对输入 JSON 进行验证
2. **文件路径安全**：使用绝对路径，防止目录遍历
3. **超时保护**：所有 execSync 调用都设置了超时
4. **错误不暴露**：生产环境不返回详细的内部错误

建议添加额外的 WAF 规则：
```nginx
# 仅允许特定 IP 的书签填充请求
location /api/oa-proxy/draft {
    allow 10.0.0.0/8;
    deny all;
}
```

---

## 🚀 下一步

### 优先（必须做）

1. ✅ 更新 Docker 镜像，安装 LibreOffice + Python UNO
2. ✅ 在 Docker 容器启动时运行 `start-libreoffice.sh`
3. ✅ 测试 API 端点 `/api/oa-proxy/draft?step=start`
4. ✅ 验证下载的 .doc 文件格式是否正确

### 可选（优化）

5. 添加监控和告警（soffice 进程异常、内存使用）
6. 实现异步队列处理（Bull MQ）
7. 添加缓存层（Redis）减少重复请求
8. 编写单元测试和集成测试

---

## 📞 支持

查看详细文档：
- 部署指南：`LIBREOFFICE_SETUP.md`
- 故障排查：`LIBREOFFICE_SETUP.md` → 故障排查部分
- 测试脚本：`bash test-bookmark-filling.sh`

---

**最后一句话**：相比 Windows COM 或其他方案，LibreOffice UNO 在保留格式的同时完全兼容 Linux Docker，是目前最佳选择。祝您部署顺利！ 🎉
