#!/bin/bash
#
# 创建 iOS 配置描述文件用于信任 SSL 证书
# 使用方法: ./create-ios-mobileconfig.sh [证书文件路径]
#
# 示例:
#   ./create-ios-mobileconfig.sh server.crt
#   ./create-ios-mobileconfig.sh  # 默认使用 server.crt
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认证书文件
CERT_FILE="${1:-server.crt}"

# 检查证书文件是否存在
if [ ! -f "$CERT_FILE" ]; then
    echo -e "${RED}✗ 错误: 找不到证书文件 $CERT_FILE${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0 [证书文件路径]"
    echo ""
    echo "示例:"
    echo "  $0 server.crt"
    echo "  $0 /path/to/your/cert.crt"
    exit 1
fi

# 检查是否是有效的证书文件
if ! openssl x509 -in "$CERT_FILE" -noout -checkend 0 2>/dev/null; then
    echo -e "${RED}✗ 错误: 文件 $CERT_FILE 不是有效的证书或已过期${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到证书文件: $CERT_FILE${NC}"

# 生成证书信息
CERT_INFO=$(openssl x509 -in "$CERT_FILE" -noout -subject -issuer -dates 2>/dev/null)
echo ""
echo "证书信息:"
echo "$CERT_INFO"

# 读取证书并转换为 base64（移除换行符）
CERTIFICATE=$(cat "$CERT_FILE" | base64 | tr -d '\n')

# 生成 UUIDs
CERT_UUID=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "cert-$(date +%s)")
PROFILE_UUID=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "profile-$(date +%s)")

# 创建 mobileconfig 文件
MOBILECONFIG_FILE="server.mobileconfig"

echo ""
echo -e "${YELLOW}正在创建 $MOBILECONFIG_FILE...${NC}"

cat > "$MOBILECONFIG_FILE" << MOBILECONFIG
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
            <string>信任自签名证书以启用 PWA 功能</string>
            <key>PayloadDisplayName</key>
            <string>SEI Server Certificate</string>
            <key>PayloadIdentifier</key>
            <string>com.sei.certificate</string>
            <key>PayloadType</key>
            <string>com.apple.security.root</string>
            <key>PayloadUUID</key>
            <string>${CERT_UUID}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>安装服务器根证书以启用 PWA 功能。请在安装完成后前往：设置 → 通用 → 关于本机 → 证书信任设置，启用"针对根证书完全信任"。</string>
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
    <string>${PROFILE_UUID}</string>
    <key>PayloadVersion</key>
    <integer>2</integer>
</dict>
</plist>
MOBILECONFIG

echo -e "${GREEN}✓ $MOBILECONFIG_FILE 已创建${NC}"

# 计算文件大小
FILE_SIZE=$(du -h "$MOBILECONFIG_FILE" | cut -f1)
echo "  文件大小: $FILE_SIZE"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}下一步操作 (iOS / iPhone / iPad):${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. 发送文件到 iPhone"
echo "   - 通过 AirDrop: 打开 AirDrop，选择 iPhone，发送 $MOBILECONFIG_FILE"
echo "   - 通过邮件: 将文件作为附件发送到 iPhone 邮箱"
echo "   - 通过云存储: 上传到 iCloud/网盘，在 iPhone 上下载"
echo "   - 通过网页: 将文件放到 web 服务器，在 Safari 中访问链接"
echo ""
echo "2. 安装配置描述文件"
echo "   - 在 iPhone 上点击 $MOBILECONFIG_FILE"
echo "   - 选择 '已下载的描述文件'"
echo "   - 点击右上角的 '安装'"
echo "   - 输入锁屏密码"
echo "   - 点击 '安装' 完成安装"
echo ""
echo -e "${RED}3. 信任证书 (重要!)${NC}"
echo "   - 打开 '设置' → '通用' → '关于本机'"
echo "   - 滚动到底部，点击 '证书信任设置'"
echo "   - 找到 'SEI Server Certificate'"
echo "   - 启用 '针对根证书完全信任' 开关"
echo "   - 点击 '继续' 确认"
echo ""
echo "4. 验证 PWA 功能"
echo "   - 打开 Safari"
echo "   - 访问: https://192.168.109.66:30443/report"
echo "   - 确认地址栏显示锁图标（无警告）"
echo "   - 访问 /report/pwa 页面测试 PWA"
echo "   - 或点击 '分享' → '添加到主屏幕' 安装 PWA 应用"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}提示:${NC}"
echo "  - iOS 14.5+ 完全支持 Service Worker 和 PWA"
echo "  - 证书信任设置是必须的，否则 Safari 不会信任该证书"
echo "  - PWA 应用会自动全屏，类似原生 App"
echo "  - 可以通过 '设置 → 通用 → VPN 与设备管理' 查看已安装的配置"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
