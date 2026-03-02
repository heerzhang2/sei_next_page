# PWA 离线模式故障修复脚本 (PowerShell 版本)
# 解决: 添加 Nginx/APISIX 代理后离线访问返回 502 的问题

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  PWA 离线模式故障修复脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "docker-compose-nginx-apisix.yml")) {
    Write-Host "错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1: 备份现有配置
Write-Host "步骤 1: 备份现有 Nginx 配置" -ForegroundColor Green
if (Test-Path "nginx-apisix.conf") {
    $backupFile = "nginx-apisix.conf.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item "nginx-apisix.conf" $backupFile
    Write-Host "已备份到: $backupFile" -ForegroundColor Yellow
}

# 步骤 2: 应用新配置
Write-Host ""
Write-Host "步骤 2: 应用新的 Nginx 配置 (支持 PWA 离线模式)" -ForegroundColor Green

# 检查是否存在增强配置文件
$sourceConfig = "nginx-apisix-with-pwa-support.conf"
if (Test-Path $sourceConfig) {
    Copy-Item $sourceConfig "nginx-apisix.conf"
    Write-Host "✓ 新配置已应用" -ForegroundColor Green
} else {
    Write-Host "警告: nginx-apisix-with-pwa-support.conf 不存在" -ForegroundColor Yellow
    Write-Host "请先创建该配置文件,或使用提供的 nginx-apisix-with-pwa-support.conf"
    exit 1
}

# 步骤 3: 重启 Nginx
Write-Host ""
Write-Host "步骤 3: 重启 Nginx 服务" -ForegroundColor Green
try {
    docker-compose -f docker-compose-nginx-apisix.yml restart nginx
    Write-Host "✓ Nginx 已重启" -ForegroundColor Green
} catch {
    Write-Host "错误: 重启 Nginx 失败" -ForegroundColor Red
    Write-Host "请手动执行: docker-compose -f docker-compose-nginx-apisix.yml restart nginx"
    exit 1
}

# 等待服务启动
Write-Host ""
Write-Host "等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 步骤 4: 验证配置
Write-Host ""
Write-Host "步骤 4: 验证配置" -ForegroundColor Green
try {
    $healthCheck = Invoke-WebRequest -Uri "https://localhost:9443/healthz" -SkipCertificateCheck -UseBasicParsing -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✓ Nginx 服务运行正常" -ForegroundColor Green
    } else {
        Write-Host "警告: Nginx 健康检查返回异常状态码: $($healthCheck.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "警告: 无法连接到 Nginx 服务" -ForegroundColor Yellow
}

# 完成提示
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  修复完成!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "请按以下步骤测试 PWA 离线功能:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. 访问 PWA 管理页面进行预缓存:" -ForegroundColor White
Write-Host "     https://192.168.171.3:9443/report/pwa" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. 关闭 Next.js 服务进行离线测试:" -ForegroundColor White
Write-Host "     kubectl scale deployment sei-nextjs --replicas=0 -n seirep" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. 再次访问 PWA 页面,应该看到友好的错误提示而非 502:" -ForegroundColor White
Write-Host "     https://192.168.171.3:9443/report/pwa" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. 恢复 Next.js 服务:" -ForegroundColor White
Write-Host "     kubectl scale deployment sei-nextjs --replicas=2 -n seirep" -ForegroundColor Gray
Write-Host ""
Write-Host "详细信息请查看: PWA-OFFLINE-TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果问题仍然存在,请检查:" -ForegroundColor Yellow
Write-Host "  1. 浏览器 Service Worker 是否已注册" -ForegroundColor White
Write-Host "  2. /report/~offline 页面是否已缓存" -ForegroundColor White
Write-Host "  3. Nginx 日志: docker logs nginx" -ForegroundColor White
Write-Host ""
