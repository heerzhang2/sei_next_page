# LibreOffice UNO 书签填充 - 完整架构

## 系统架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                          用户浏览器                               │
│                                                                   │
│  待办文件列表 → 点击"起草正文" → 选择模板 → 点击"确认选择"       │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   │ POST /api/oa-proxy/draft
                   │ {step: "start", unid, fileUnid, jsessionId}
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │        Next.js API 路由 (Node.js)                    │
       │  /api/oa-proxy/draft/route.ts                        │
       │                                                       │
       │  1. 调用旧 OA API 下载模板 (.doc)                    │
       │  2. 从 OA 获取书签值 (JSON)                          │
       │  3. 【关键】调用 Python 脚本进行书签填充            │
       │  4. 返回 Base64 编码的已填充 .doc                   │
       │                                                       │
       └───────────┬──────────────────────────────────────────┘
                   │
                   │ child_process.execSync()
                   │ python3 fill-bookmarks.py /tmp/template.doc
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │     Python 脚本                                      │
       │  /api/oa-proxy/fill-bookmarks.py                     │
       │                                                       │
       │  1. 解析 JSON 书签值                                 │
       │  2. 验证 .doc 文件                                   │
       │  3. 通过 UNO 套接字连接 LibreOffice                 │
       │  4. 打开文档 → 替换书签 → 保存文件                 │
       │  5. 返回 JSON 结果                                   │
       │                                                       │
       └───────────┬──────────────────────────────────────────┘
                   │
                   │ UNO Bridge (localhost:2002)
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │  Docker 容器内 LibreOffice Headless                 │
       │                                                       │
       │  soffice --headless                                  │
       │    --accept="socket,host=127.0.0.1,port=2002;urp;"  │
       │                                                       │
       │  处理步骤:                                            │
       │  1. UNO ComponentContext 接收连接                    │
       │  2. Desktop.loadComponentFromURL() 打开文档          │
       │  3. doc.getBookmarks() 获取所有书签                 │
       │  4. 遍历书签，bookmark.Range.setString() 替换        │
       │  5. doc.storeToURL() 保存（保留原格式）             │
       │                                                       │
       └───────────┬──────────────────────────────────────────┘
                   │
                   │ 文件系统
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │  /tmp/oa-draft-XXXXX/                                │
       │  ├── template.doc (输入)                             │
       │  └── template.doc (输出，已填充书签)                 │
       │                                                       │
       └───────────┬──────────────────────────────────────────┘
                   │
                   │ JSON 响应
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │  {                                                   │
       │    "success": true,                                  │
       │    "data": {                                         │
       │      "templateBase64": "0M8R4KGA...",               │
       │      "templateSize": 33792,                          │
       │      "bookmarkKeys": [...],                          │
       │      "fillResult": {                                 │
       │        "ok": true,                                   │
       │        "message": "成功替换 11 个书签"              │
       │      }                                               │
       │    }                                                 │
       │  }                                                   │
       │                                                       │
       └───────────┬──────────────────────────────────────────┘
                   │
                   │ 浏览器接收并自动下载
                   │
       ┌───────────▼──────────────────────────────────────────┐
       │                                                       │
       │  已填充的 .doc 文件下载完成                          │
       │  用户用 Microsoft Word / LibreOffice 打开             │
       │  所有书签都已被正确替换，格式完全保留！              │
       │                                                       │
       └───────────────────────────────────────────────────────┘
```

---

## 文件结构

```
sei_next_page/
│
├── packages/
│   └── mainProj/
│       └── src/
│           └── app/
│               └── api/
│                   └── oa-proxy/
│                       ├── draft/
│                       │   └── route.ts           ⭐ 更新的路由
│                       ├── fill-bookmarks.py      ⭐ 新的 Python 脚本
│                       ├── save-doc/route.ts      (现有，用于保存)
│                       └── ... (其他 OA 相关路由)
│
├── scripts/
│   └── start-libreoffice.sh                      ⭐ 新的启动脚本
│
├── Dockerfile.libreoffice                        ⭐ 新的 Docker 配置
├── docker-compose.libreoffice.yml                ⭐ 新的 Compose 配置
│
├── LIBREOFFICE_SETUP.md                          ⭐ 部署指南
├── BOOKMARK_SOLUTION.md                          ⭐ 快速参考
├── ARCHITECTURE.md                               ⭐ 本文件
│
└── test-bookmark-filling.sh                      ⭐ 测试脚本
```

---

## 核心流程详解

### 1️⃣ 请求阶段 (Browser → Node.js)

```javascript
// 前端请求
POST /api/oa-proxy/draft HTTP/1.1
Content-Type: application/json

{
  "step": "start",
  "unid": "20260611084142XX699307D7E60F416D",
  "jsessionId": "19A5B0E500107544957D41CABF46519A",
  "agency_unid": "...",
  "doctype_value": "2",
  "itemUnid": "...",
  "fileUnid": "20180103130508XX93D18667093740A7",
  "docFileType": "doc_fw"
}
```

### 2️⃣ 下载和准备阶段 (Node.js)

```typescript
// draft/route.ts - 主要逻辑
async function handleStartStep() {
  // 2.1 根据 fileUnid 构造 OCX 页面 URL
  const ocxUrl = `${OA_BASE}/foa/odoc/MicrosoftOffice/newstartoffice_doc.jsp?...`;
  
  // 2.2 获取 OCX 页面，提取：
  // - documentFieldJSON (书签值)
  // - file_download_byUrl.jsp 的下载 URL
  
  // 2.3 下载 .doc 模板文件
  const buf = Buffer.from(await fetch(downloadUrl).arrayBuffer());
  
  // 2.4 将 .doc 写入临时目录
  const tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'oa-draft-'));
  const docPath = path.join(tmpDir, 'template.doc');
  fs.writeFileSync(docPath, buf);
  
  // 2.5 如果有书签值，调用填充函数
  if (Object.keys(bookmarkValues).length > 0) {
    fillResult = fillBookmarksWithLibreOffice(docPath, bookmarkValues);
  }
}
```

### 3️⃣ 填充书签阶段 (Node.js → Python)

```typescript
// draft/route.ts - fillBookmarksWithLibreOffice()
function fillBookmarksWithLibreOffice(docPath, bookmarkValues) {
  const scriptPath = '/path/to/fill-bookmarks.py';
  const jsonStr = JSON.stringify(bookmarkValues);
  
  // 调用 Python 脚本
  const command = `python3 "${scriptPath}" "${docPath}" '${jsonStr}'`;
  
  const stdout = execSync(command, { 
    timeout: 120000,
    stdio: 'pipe'
  });
  
  const result = JSON.parse(stdout.toString());
  return {
    ok: result.success,
    error: result.message
  };
}
```

### 4️⃣ UNO 处理阶段 (Python)

```python
# fill-bookmarks.py - 核心算法
def fill_bookmarks(doc_path, bookmark_values, output_path):
  # 4.1 连接到 LibreOffice UNO 套接字
  ctx = resolver.resolve(
    "uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"
  )
  desktop = ctx.ServiceManager.createInstanceWithContext(
    "com.sun.star.frame.Desktop", ctx
  )
  
  # 4.2 打开文档
  doc = desktop.loadComponentFromURL(f"file://{doc_path}", "_blank", 0, props)
  
  # 4.3 获取书签集合
  bookmarks = doc.getBookmarks()
  
  # 4.4 逐一替换书签
  for bookmark_name, new_value in bookmark_values.items():
    if bookmarks.hasByName(bookmark_name):
      bookmark = bookmarks.getByName(bookmark_name)
      bookmark_range = bookmark.getAnchor()
      bookmark_range.setString(str(new_value))
  
  # 4.5 保存文档（保留原格式）
  doc.storeToURL(file_url, props_save)
  doc.close(True)
```

### 5️⃣ 响应阶段 (Node.js → Browser)

```json
{
  "success": true,
  "data": {
    "templateBase64": "0M8R4KGA...",  // 已填充的 .doc (Base64)
    "templateSize": 33792,             // 文件大小
    "bookmarkKeys": [                  // 所有书签名称
      "主送单位",
      "密级",
      ...
    ],
    "fillResult": {                    // 填充结果
      "ok": true,
      "message": "成功替换 11 个书签"
    }
  }
}
```

---

## Docker 启动流程

```bash
# Dockerfile
FROM node:18-bullseye

# 安装 LibreOffice + Python
RUN apt-get install -y libreoffice libreoffice-writer python3-uno

# 复制应用文件
COPY . /app

# 复制启动脚本
COPY scripts/start-libreoffice.sh /app/scripts/
RUN chmod +x /app/scripts/start-libreoffice.sh

# 暴露端口
EXPOSE 3000 2002

# 启动
ENTRYPOINT ["/app/scripts/start-libreoffice.sh"]
CMD ["yarn", "start"]
```

```bash
# start-libreoffice.sh 执行顺序
1. pkill -f "soffice" || true        # 清理旧进程
   ↓
2. soffice --headless ...            # 启动 LibreOffice Headless
   --accept="socket,host=127.0.0.1,port=2002;urp;"
   ↓
3. sleep 1; 等待套接字就绪 (最多 60 秒)
   ↓
4. python3 -c "import socket; s.connect(('127.0.0.1', 2002))"
   (检查 2002 端口是否开放)
   ↓
5. exec "$@"                         # 启动 Node.js 应用
   (yarn start 等)
   ↓
6. Node.js 应用启动后，可以立即处理请求
```

---

## 数据流示例

### 输入数据

```json
{
  "bookmarkValues": {
    "主送单位": "中央人民政府",
    "密级": "秘密",
    "拟稿人": "李四",
    "拟稿日期": "2026-06-12",
    "拟稿单位": "国家发改委",
    "保密期限": "30年",
    "分送单位": "财政部、商务部",
    "发文年号": "2026",
    "机关代字": "中",
    "正题名": "关于深化改革的通知",
    "紧急程度": "加急"
  }
}
```

### 处理过程

```
原始 .doc 文件
  ↓
1. LibreOffice 打开
  ↓
2. 获取所有书签（11 个）
  - 书签 #1: {name: "主送单位", position: 页1-表格1-单元格1}
  - 书签 #2: {name: "密级", position: 页1-表格1-单元格3}
  - ...
  ↓
3. 替换每个书签的内容
  - "主送单位" → "中央人民政府"
  - "密级" → "秘密"
  - ...
  ↓
4. 保存文件
  - 原格式保留（所有页面布局、表格、图片等）
  - 仅内容（书签内的文本）被替换
  - 文件大小可能略有变化（内容长度不同）
  ↓
输出 .doc 文件（已填充，格式完整）
```

---

## 错误处理链

```
┌─────────────────────────────────┐
│  用户请求                        │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │ 参数验证     │
        │ (缺少参数?)  │
        └──────┬──────┘
               │ ❌ 错误 → HTTP 400
               │ ✅ OK
               ↓
        ┌──────────────┐
        │ 下载 OA 模板  │
        └──────┬──────┘
               │ ❌ 网络错误 → HTTP 502
               │ ✅ 成功
               ↓
        ┌──────────────────────┐
        │ Python 脚本调用        │
        │ execSync()            │
        └──────┬──────────────┘
               │ ❌ ENOENT → 脚本不存在
               │ ❌ ETIMEDOUT → 超过 120 秒
               │ ❌ 非 0 exit code → 脚本失败
               │ ✅ exit code 0
               ↓
        ┌──────────────────────┐
        │ 检查 UNO 套接字        │
        │ (Python 内部)         │
        └──────┬──────────────┘
               │ ❌ 无法连接 → JSON: {success: false, message: "..."}
               │ ✅ 连接成功
               ↓
        ┌──────────────────────┐
        │ 打开 .doc 文件         │
        └──────┬──────────────┘
               │ ❌ 格式错误 → JSON: {success: false, message: "..."}
               │ ✅ 打开成功
               ↓
        ┌──────────────────────┐
        │ 替换书签               │
        │ (可能部分失败)         │
        └──────┬──────────────┘
               │ ⚠ 部分书签未找到 → JSON: {success: true, message: "...11 个错误"}
               │ ✅ 全部成功
               ↓
        ┌──────────────────────┐
        │ 保存文件               │
        └──────┬──────────────┘
               │ ❌ 磁盘满 → JSON: {success: false, message: "..."}
               │ ✅ 保存成功
               ↓
       ┌────────────────────┐
       │ 返回成功响应         │
       │ HTTP 200 + JSON    │
       └────────────────────┘
```

---

## 性能优化点

### 当前实现

```
请求 → 下载模板 → 调用 Python → UNO 处理 → 返回 → 响应
       (1-2s)   (启动 Python) (3-5s)     (1-2s)
                    (1s)
                  总计: 6-10s
```

### 优化方案

#### 1. 预热 LibreOffice（减少首次启动延迟）

```typescript
// app.ts - 应用启动时
import { execSync } from 'child_process';

try {
  execSync('python3 -c "import socket; s = socket.socket(); s.connect((\'127.0.0.1\', 2002)); s.close()"', {
    timeout: 5000,
    stdio: 'pipe'
  });
  console.log('[OK] LibreOffice UNO 套接字就绪');
} catch {
  console.warn('[WARN] LibreOffice 未启动，首次请求会较慢');
}
```

#### 2. 异步队列处理（不阻塞 API）

```typescript
// 使用 Bull MQ + Redis
const bookmarkQueue = new Queue('bookmark-filling', {
  connection: redis
});

// API 端点
router.post('/api/oa-proxy/draft', async (req, res) => {
  const job = await bookmarkQueue.add(req.body);
  return res.json({ jobId: job.id });
});

// 后台处理
bookmarkQueue.process(async (job) => {
  return await fillBookmarks(job.data);
});

// 前端轮询或 WebSocket 查询进度
router.get('/api/oa-proxy/draft/:jobId', async (req, res) => {
  const job = await bookmarkQueue.getJob(req.params.jobId);
  return res.json({
    status: job.getState(),
    progress: job.progress(),
    data: job.data
  });
});
```

#### 3. 缓存已处理的模板

```typescript
// 使用 Redis 缓存相同模板+书签值的结果
const cacheKey = `bookmark:${fileUnid}:${hash(bookmarkValues)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// 处理后缓存
await redis.setex(cacheKey, 3600, JSON.stringify(result));
```

---

## 监控和告警

### 关键指标

```
1. LibreOffice 进程状态
   - 是否运行: ps aux | grep soffice
   - 内存使用: ps aux | grep soffice | awk '{print $6}'
   - CPU 使用: top -p $PID

2. UNO 套接字连接
   - 端口状态: netstat -tuln | grep 2002
   - 响应时间: time python3 -c "import socket; s.connect(...)"

3. API 性能
   - 请求延迟: p50, p95, p99
   - 错误率: 失败/总数
   - 吞吐量: 请求/秒
```

### Prometheus 指标示例

```typescript
// 在 draft/route.ts 中添加
import prom from 'prom-client';

const bookmarkFillDuration = new prom.Histogram({
  name: 'bookmark_fill_duration_seconds',
  help: 'Time to fill bookmarks',
  labelNames: ['status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const bookmarkFillErrors = new prom.Counter({
  name: 'bookmark_fill_errors_total',
  help: 'Number of bookmark fill errors',
  labelNames: ['error_type']
});

// 在路由中使用
const start = Date.now();
try {
  await fillBookmarks(...);
  bookmarkFillDuration.labels('success').observe((Date.now() - start) / 1000);
} catch (e) {
  bookmarkFillDuration.labels('error').observe((Date.now() - start) / 1000);
  bookmarkFillErrors.labels(e.constructor.name).inc();
}
```

---

## 总结

| 组件 | 技术 | 职责 |
|------|------|------|
| **浏览器** | JavaScript | 用户交互、文件下载 |
| **Next.js API** | Node.js + TypeScript | 请求路由、OA 交互、Python 调用 |
| **Python 脚本** | Python 3 + UNO | 文档打开、书签替换、格式保留 |
| **LibreOffice** | Headless 模式 | 文档处理引擎 |
| **Docker** | Linux + 容器化 | 统一部署环境 |
| **Redis** | 可选 | 队列、缓存（高级） |

这个架构完全解决了您的问题：
- ✅ Linux/Docker 兼容
- ✅ 保留文档格式
- ✅ 简单文本替换
- ✅ 性能可接受
- ✅ 易于维护和扩展
