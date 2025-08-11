# PowerShell script for Windows
# 创建SSL证书目录
New-Item -ItemType Directory -Force -Path "ssl"

# 检查是否安装了 OpenSSL
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if (-not $opensslPath) {
    Write-Host "OpenSSL not found. Please install OpenSSL first." -ForegroundColor Red
    Write-Host "You can download it from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    exit 1
}

# 创建证书配置文件
$configContent = @"
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = Development
OU = IT Department
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 192.168.0.100
IP.3 = 192.168.171.3
"@

$configContent | Out-File -FilePath "ssl\localhost.conf" -Encoding UTF8

# 生成私钥
& openssl genrsa -out ssl\localhost.key 2048

# 生成证书
& openssl req -new -x509 -key ssl\localhost.key -out ssl\localhost.crt -days 365 -config ssl\localhost.conf -extensions v3_req

Write-Host "SSL certificates generated in ssl\ directory" -ForegroundColor Green
Write-Host "Please add ssl\localhost.crt to your trusted root certificates" -ForegroundColor Yellow
Write-Host "To install the certificate on Windows:" -ForegroundColor Cyan
Write-Host "1. Double-click ssl\localhost.crt" -ForegroundColor Cyan
Write-Host "2. Click 'Install Certificate...'" -ForegroundColor Cyan
Write-Host "3. Select 'Local Machine' and click 'Next'" -ForegroundColor Cyan
Write-Host "4. Select 'Place all certificates in the following store'" -ForegroundColor Cyan
Write-Host "5. Click 'Browse' and select 'Trusted Root Certification Authorities'" -ForegroundColor Cyan
Write-Host "6. Click 'Next' and then 'Finish'" -ForegroundColor Cyan
