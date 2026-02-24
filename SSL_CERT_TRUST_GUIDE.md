# SSL 证书信任指南 - 启用 PWA 功能

## 问题描述

由于使用 IP 地址（如 `192.168.109.66:30443`）访问应用，浏览器不会自动信任自签名 SSL 证书，导致 PWA Service Worker 无法注册。

## 解决方案

### 方案一：导出并信任服务器 SSL 证书（推荐用于内网环境）

#### 1. 从服务器导出证书

```bash
# 方法 1: 从 APISIX/Nginx 配置文件中找到证书路径
# 查看 APISIX 配置
kubectl get configmap -n seirep apisix -o yaml | grep ssl

# 方法 2: 使用 openssl 导出证书
openssl s_client -showcerts -connect 192.168.109.66:30443 </dev/null 2>/dev/null | openssl x509 -outform PEM > server.crt

# 方法 3: 如果证书在 K8s Secret 中
kubectl get secret -n seirep <secret-name> -o jsonpath='{.data.tls\.crt}' | base64 -d > server.crt
```

#### 2. 根据设备导入证书

---

### 📱 iOS / iPhone / iPad（苹果设备）

**✅ 可以按照此方法！iOS 完全支持 PWA，但步骤略有不同。**

iOS 上的 Safari 对 PWA 支持很好，但证书信任步骤较为复杂，需要通过配置描述文件安装。

#### 方法 A: 通过配置描述文件安装（推荐）

1. **准备证书描述文件**：
```bash
# 在服务器上创建 iOS 配置描述文件（server.mobileconfig）
# 注意：需要先导出 server.crt

cat > create-mobileconfig.sh << 'EOF'
#!/bin/bash

# 读取证书并创建 mobileconfig
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
            <data>${CERTIFICATE}
</data>
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
echo "  请将此文件发送到 iPhone 并安装"
EOF

chmod +x create-mobileconfig.sh
./create-mobileconfig.sh
```

2. **发送并安装描述文件**：
   - 将 `server.mobileconfig` 文件通过 AirDrop、邮件或网页链接发送到 iPhone
   - 在 iPhone 上点击文件，选择"已下载的描述文件"
   - 点击右上角的"安装"，输入锁屏密码
   - 安装完成后，进入 **设置 → 通用 → VPN 与设备管理**
   - 点击"已下载的描述文件"进行验证

3. **信任证书**（⚠️ 关键步骤）：
   - 进入 **设置 → 通用 → 关于本机**
   - 滚动到底部，点击 **"证书信任设置"**
   - 找到刚安装的证书（如 "SEI Server Certificate"）
   - 启用 **"针对根证书完全信任"** 开关
   - 系统会弹出警告，点击"继续"
   - ✅ 这一步必须完成，否则证书不会被 Safari 信任

4. **验证 PWA 功能**：
   - 打开 Safari 访问 `https://192.168.109.66:30443/report`
   - 地址栏应显示锁图标（无警告信息）
   - 访问 `/report/pwa` 页面
   - 点击右下角"我已信任证书，启用 PWA"
   - 或者点击"分享"按钮 → "添加到主屏幕"安装 PWA 应用

#### 方法 B: 通过 Safari 直接安装

1. **提供证书下载**：
```bash
# 将证书和描述文件放到 web 可访问目录
mkdir -p /var/www/html/cert
cp server.crt /var/www/html/cert/
cp server.mobileconfig /var/www/html/cert/
```

2. **在 iPhone Safari 中**：
   - 访问 `https://192.168.109.66:30443/cert/server.mobileconfig`
   - 按照方法 A 的步骤 2-3 完成安装

#### iOS PWA 特性说明

| 特性 | 支持情况 | 说明 |
|------|---------|------|
| Service Worker | ✅ iOS 14.5+ | 完全支持 |
| 离线缓存 | ✅ | 支持 |
| 添加到主屏幕 | ✅ | 像原生 App 一样 |
| 后台运行 | ⚠️ 有限制 | 后台运行时间较短 |
| 推送通知 | ✅ | 需要额外配置 |
| 存储限制 | ⚠️ ~50MB | 缓存通常限制在 50MB 以内 |
| Web Share API | ✅ | 支持分享功能 |

#### iOS 注意事项

1. **iOS 14.5 及以上版本**才完全支持 Service Worker
2. **必须信任根证书**，仅安装证书是不够的
3. **PWA 安装位置**：主屏幕，图标可自定义
4. **全屏模式**：PWA 应用自动全屏，无浏览器地址栏
5. **文件下载限制**：iOS PWA 不能直接下载文件到文件应用

---

### 🖥️ macOS（苹果电脑）

macOS 的证书信任与 Windows 类似，但通过"钥匙串访问"管理。

1. **导入证书到钥匙串**：
   - 双击 `server.crt` 文件
   - 钥匙串访问会自动打开
   - 选择存储位置：
     - **"系统"**：所有用户可用（需要管理员密码）
     - **"登录"**：仅当前用户可用

2. **信任证书**（⚠️ 关键步骤）：
   - 在钥匙串中找到该证书
   - 双击证书，展开"信任"部分
   - "使用此证书时"下拉菜单选择 **"始终信任"**
   - 关闭证书窗口，输入管理员密码确认

3. **验证**：
   - 重启 Safari
   - 访问 `https://192.168.109.66:30443/report`
   - 确认地址栏显示锁图标

---

### 🤖 Android / Chrome OS

Android 设备对 PWA 支持良好，证书安装也相对简单。

#### 方法 A: 通过设置安装

1. **发送证书到手机**：
   - 通过邮件、USB 或云存储传输 `server.crt`
   - 或在 Chrome 浏览器中直接访问证书下载链接

2. **安装证书**：
   - 点击证书文件，选择"打开"
   - 系统提示"安装 CA 证书？"
   - 输入锁屏密码/PIN
   - 选择用途：**"VPN 和应用"**（推荐）或"Wi-Fi"

3. **命名证书**：
   - 给证书起个名字（如"SEI Server"）
   - 点击"确定"

4. **验证**：
   - 打开 Chrome 访问 `https://192.168.109.66:30443/report`
   - 地址栏应显示安全锁图标

#### Android PWA 特性说明

| 特性 | 支持情况 | 说明 |
|------|---------|------|
| Service Worker | ✅ | 完全支持 |
| 离线缓存 | ✅ | 支持 |
| 添加到主屏幕 | ✅ | 支持 |
| 后台运行 | ✅ | 支持较好 |
| 存储限制 | ✅ | 通常无限制（取决于设备存储） |

---

### 💻 Windows / Windows Phone

#### Windows 桌面版

1. **双击下载的 `server.crt` 文件**
2. 点击"安装证书"
3. 选择存储位置：
   - 选择"本地计算机"（需要管理员权限）
   - 点击"下一步"
4. 选择证书存储：
   - 选择"将所有的证书放入下列存储"
   - 点击"浏览"
   - 选择"受信任的根证书颁发机构"
   - 点击"确定" → "下一步"
5. 点击"完成"
6. 确认安全警告，点击"是"

#### Windows Mobile

1. **将证书文件发送到手机**（通过邮件、USB 或云存储）
2. 在手机上点击 `.crt` 文件
3. 系统会提示"安装证书"
4. 选择"安装到受信任的根证书颁发机构"
5. 确认安装

---

### 🐧 Linux (Ubuntu/Debian/CentOS)

```bash
# 1. 复制证书到系统信任目录
sudo cp server.crt /usr/local/share/ca-certificates/

# 2. 更新证书存储
sudo update-ca-certificates

# 3. 验证
# 系统浏览器（Chromium/Firefox）会自动信任
# Firefox 需要手动导入：设置 → 隐私与安全 → 证书 → 证书颁发机构 → 导入
```

---

#### 3. 验证证书信任（所有设备通用）

### 方案二：使用受信任的 SSL 证书（推荐用于生产环境）

#### 使用 Let's Encrypt（免费）

```bash
# 1. 安装 certbot
# Ubuntu/Debian
sudo apt install certbot

# 2. 获取证书（需要域名）
sudo certbot certonly --standalone -d your-domain.com

# 3. 导出证书
sudo cat /etc/letsencrypt/live/your-domain.com/fullchain.pem > cert.pem
sudo cat /etc/letsencrypt/live/your-domain.com/privkey.pem > key.pem

# 4. 将证书配置到 APISIX
kubectl create secret tls apisix-cert -n seirep --cert=cert.pem --key=key.pem
```

#### 购买商业 SSL 证书

1. 从可信 CA 购买证书（如 DigiCert, Comodo, GlobalSign）
2. 配置 DNS 解析
3. 在服务器安装证书
4. 更新 APISIX/Nginx 配置

### 方案三：临时绕过（仅用于开发，不推荐）

在浏览器中手动接受证书：

1. 访问 `https://192.168.109.66:30443`
2. 浏览器会显示"您的连接不是私密连接"
3. 点击"高级" → "继续访问 192.168.109.66 (不安全)"
4. **注意**：这种方式对 Service Worker **无效**，必须正式导入证书

## PWA 证书信任检查逻辑

```
1. 检测 IP 地址访问 → 是
2. 检查 sessionStorage['pwa-cert-trusted'] → 不存在
3. 显示"等待证书"状态 + "查看证书说明"按钮
4. 用户导入证书后，点击"我已信任证书"
5. sessionStorage['pwa-cert-trusted'] = 'true'
6. 页面自动刷新
7. Service Worker 成功注册
```

## 验证 PWA 功能

导入证书后，执行以下验证：

```javascript
// 1. 在浏览器控制台检查 Service Worker
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))

// 2. 检查缓存
caches.keys().then(keys => console.log(keys))

// 3. 测试 HTTPS 请求
fetch(window.location.href, { method: 'HEAD' })
  .then(() => console.log('✓ 证书信任正常'))
  .catch(err => console.log('✗ 证书未信任:', err))
```

## 故障排查

### 问题 1: 导入证书后仍然提示"不安全"

**解决方案**：
- 清除浏览器缓存并重启浏览器
- 确认证书导入到"受信任的根证书颁发机构"，而不是"个人"或"受信任的发布者"
- 检查证书有效期是否有效

### 问题 2: PWA 页面显示"等待证书"但证书已导入

**解决方案**：
- 刷新页面
- 打开浏览器开发者工具 → Console，检查是否有错误
- 手动设置 `sessionStorage.setItem('pwa-cert-trusted', 'true')` 并刷新

### 问题 3: Service Worker 注册失败

**解决方案**：
```bash
# 查看 Next.js 容器日志
kubectl logs -n seirep -l app=sei-nextjs --tail=100

# 检查 sw.js 文件是否存在
curl -k https://192.168.109.66:30443/report/serwist/sw.js
```

## 最佳实践建议

1. **生产环境务必使用域名 + 受信任的 SSL 证书**
2. 内网测试环境可使用自签名证书 + 手动信任
3. 定期更新证书（Let's Encrypt 证书 90 天有效）
4. 使用域名而非 IP 访问（更安全，支持多证书）

## 相关命令

```bash
# 查看服务器证书信息
openssl s_client -connect 192.168.109.66:30443 -showcerts

# 查看证书过期时间
openssl x509 -enddate -noout -in server.crt

# 在 Windows 上查看已安装的证书
certmgr.msc
```

## 联系支持

如需进一步帮助，请联系系统管理员或查看 [PWA 相关文档](./SERVICE_WORKER_FIX.md)
