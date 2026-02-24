# Camunda 8 Worker Monorepo

这是一个使用Yarn Workspaces的Monorepo项目，包含一个Camunda 8 Worker服务。

## 项目结构

\`\`\`
camunda-worker-monorepo/
├── packages/
│   └── camunda-worker/     # Camunda 8 Worker服务
├── package.json            # 根项目配置
└── turbo.json              # Turborepo配置
\`\`\`

## 安装

\`\`\`bash
# 安装所有依赖
yarn install
\`\`\`

## 配置

在`packages/camunda-worker`目录下创建一个`.env`文件，参考`.env.example`文件进行配置。

## 开发

\`\`\`bash
# 启动开发模式
yarn dev
\`\`\`
[package.json](../../temp/250416/Tuborepo/package.json)
## 构建

\`\`\`bash
# 构建所有包
yarn build
\`\`\`

## 运行

\`\`\`bash
# 构建后运行
cd packages/camunda-worker
yarn start
\`\`\`

## Camunda 8 Worker

Worker服务会连接到Camunda 8流程引擎，等待类型为`pdf-generation-task`的任务。当收到任务时，它会：

1. 从任务变量中获取数据
2. 发送HTTP请求到`http://localhost:9389/api/pdf`
3. 等待响应
4. 完成任务并返回结果
5. 继续等待下一个任务

确保在Camunda 8中创建的服务任务使用`pdf-generation-task`作为任务类型。

为Next.js配置HTTPS本地开发 + 使用自签名证书启动Next.js应用：；

在本地Node服务器中显式声明允许私有网络访问：
//改page2PdfServer -Node.js服务器的代码：
const cors = require('cors');
app.use(cors({
origin: ['http://localhost:3000', 'https://localhost:3000'], // 允许HTTP和HTTPS
methods: ['GET', 'POST'],
credentials: true
}));

升级Next.js和Node服务到HTTPS
【表格打印调整】  JSON.parse(orc?._tblFixed??'[]')  ; 编辑器3段式窗口总宽度1595px；
**生产服务器部署：**
```shellscript
# 1. 构建应用
yarn build
# 2. 使用 PM2 启动生产环境
pm2 start ecosystem.config.js --env production
# 3. 设置开机自启
pm2 startup
pm2 save
```

## PWA 功能与 SSL 证书

### 当前部署信息

- **访问地址**: https://192.168.109.66:30443/report
- **后端地址**: https://192.168.109.66:30443
- **部署方式**: K3s 集群 + APISIX 网关
- **PWA 支持**: 需要信任 SSL 证书

### 启用 PWA 功能

由于使用 IP 地址访问，浏览器不会自动信任自签名证书。PWA Service Worker 需要受信任的 HTTPS 环境才能正常工作。

#### 快速启用步骤

**根据设备选择相应的方法：**

**Windows / Linux / macOS 桌面版**：
```bash
# 1. 导出服务器证书
openssl s_client -showcerts -connect 192.168.109.66:30443 </dev/null 2>/dev/null | openssl x509 -outform PEM > server.crt

# 2. 导入证书
# Windows: 双击 → 本地计算机 → 受信任的根证书颁发机构
# macOS: 双击 → 钥匙串 → 信任 → 始终信任
# Linux: sudo cp server.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates

# 3. 重启浏览器并访问
# 访问 https://192.168.109.66:30443/report/pwa
```

**iOS / iPhone / iPad（苹果设备）**：
```bash
# 1. 创建 iOS 配置描述文件
cat > create-mobileconfig.sh << 'EOF'
#!/bin/bash
CERTIFICATE=$(cat server.crt | base64 | tr -d '\n')
UUID=$(uuidgen)
cat > server.mobileconfig << MOBILECONFIG
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadCertificateFileName</key>
            <string>server.crt</string>
            <key>PayloadContent</key>
            <data>${CERTIFICATE}</data>
            <key>PayloadDescription</key>
            <string>信任自签名证书以启用 PWA</string>
            <key>PayloadDisplayName</key>
            <string>SEI Server Certificate</string>
            <key>PayloadIdentifier</key>
            <string>com.sei.certificate</string>
            <key>PayloadType</key>
            <string>com.apple.security.root</string>
            <key>PayloadUUID</key>
            <string>${UUID}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>信任服务器证书以启用 PWA 功能</string>
    <key>PayloadDisplayName</key>
    <string>SEI Server Certificate</string>
    <key>PayloadIdentifier</key>
    <string>com.sei.profile</string>
    <key>PayloadOrganization</key>
    <string>SEI</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>$(uuidgen)</string>
    <key>PayloadVersion</key>
    <integer>2</integer>
</dict>
</plist>
MOBILECONFIG
echo "✓ server.mobileconfig 已创建"
EOF

# 2. 发送 server.mobileconfig 到 iPhone（AirDrop、邮件或网页下载）

# 3. 在 iPhone 上安装
# - 点击 mobileconfig 文件 → 安装 → 输入密码
# - 设置 → 通用 → 关于本机 → 证书信任设置 → 启用"针对根证书完全信任"

# 4. Safari 访问 https://192.168.109.66:30443/report/pwa
# 点击"分享" → "添加到主屏幕"安装 PWA
```

**Android**：
```bash
# 1. 发送 server.crt 到 Android 手机（邮件、USB 或云存储）

# 2. 安装证书
# - 点击 .crt 文件 → 安装 CA 证书 → 输入 PIN
# - 选择用途："VPN 和应用"

# 3. Chrome 访问 https://192.168.109.66:30443/report/pwa
# Chrome 菜单 → "添加到主屏幕"
```

#### 详细指南

完整步骤请参阅：[SSL 证书信任指南](./SSL_CERT_TRUST_GUIDE.md)

### 生产环境建议

**推荐使用域名 + 受信任的 SSL 证书**：

1. **Let's Encrypt（免费）**：
```bash
sudo certbot certonly --standalone -d your-domain.com
```

2. **商业 SSL 证书**：
   - DigiCert
   - Comodo
   - GlobalSign

3. **配置 DNS 解析** 后，更新 APISIX/Nginx 配置使用域名证书

### PWA 功能说明

- **离线报告预缓存**: 支持报告模板和资源的离线访问
- **Service Worker**: 提供缓存策略和离线支持
- **证书检查**: 自动检测并提示证书信任状态

### 相关文档

- [Service Worker 修复说明](./SERVICE_WORKER_FIX.md)
- [SSL 证书信任指南](./SSL_CERT_TRUST_GUIDE.md)
- [PWA 离线报告功能](./README-DEV.md)

### 便捷工具

- **iOS 配置描述文件生成器**:
```bash
# 1. 导出证书
openssl s_client -showcerts -connect 192.168.109.66:30443 </dev/null 2>/dev/null | openssl x509 -outform PEM > server.crt

# 2. 生成 iOS 配置描述文件
./create-ios-mobileconfig.sh server.crt

# 3. 将生成的 server.mobileconfig 发送到 iPhone 并按照提示安装
```


