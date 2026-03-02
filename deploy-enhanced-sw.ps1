# Service Worker 增强版自动部署脚本 (PowerShell)

param(
    [switch]$Build,
    [switch]$Deploy,
    [switch]$Test
)

$ErrorActionPreference = "Stop"

# 配置
$projectDir = "packages\mainProj"
$swSource = "packages\mainProj\src\app\sw-enhanced.tsx"
$swTarget = "packages\mainProj\src\app\sw.tsx"
$backupDir = "sw-backups"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Worker 增强版部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 创建备份目录
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "✓ 创建备份目录: $backupDir" -ForegroundColor Green
}

# 步骤 1: 备份现有配置
Write-Host "`n步骤 1: 备份现有 Service Worker 配置" -ForegroundColor Yellow

if (Test-Path $swTarget) {
    $backupFile = "$backupDir\sw.tsx.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $swTarget $backupFile
    Write-Host "  已备份到: $backupFile" -ForegroundColor Green
} else {
    Write-Host "  警告: 未找到现有的 sw.tsx" -ForegroundColor Yellow
}

# 步骤 2: 替换为增强版配置
Write-Host "`n步骤 2: 替换为增强版 Service Worker" -ForegroundColor Yellow

if (Test-Path $swSource) {
    Copy-Item $swSource $swTarget -Force
    Write-Host "  ✓ 增强版配置已应用" -ForegroundColor Green
} else {
    Write-Host "  ✗ 错误: 未找到增强版配置文件: $swSource" -ForegroundColor Red
    exit 1
}

# 步骤 3: 验证配置
Write-Host "`n步骤 3: 验证 Service Worker 配置" -ForegroundColor Yellow

if (Test-Path $swTarget) {
    $content = Get-Content $swTarget -Raw

    # 检查关键特性
    $hasOfflineHtml = $content -match "OFFLINE_FALLBACK_HTML"
    $hasFetchIntercept = $content -match "addEventListener\('fetch'"
    $hasErrorHandling = $content -match "enhancedErrorHandlingPlugin"
    $hasAggressivePlugin = $content -match "aggressiveNetworkErrorPlugin"

    Write-Host "  配置检查:" -ForegroundColor Cyan
    Write-Host "    ✓ 预构建离线页面: $($hasOfflineHtml ? '是' : '否')" -ForegroundColor $(if ($hasOfflineHtml) { 'Green' } else { 'Red' })
    Write-Host "    ✓ 自定义 Fetch 拦截: $($hasFetchIntercept ? '是' : '否')" -ForegroundColor $(if ($hasFetchIntercept) { 'Green' } else { 'Red' })
    Write-Host "    ✓ 增强错误处理: $($hasErrorHandling ? '是' : '否')" -ForegroundColor $(if ($hasErrorHandling) { 'Green' } else { 'Red' })
    Write-Host "    ✓ 激进网络策略: $($hasAggressivePlugin ? '是' : '否')" -ForegroundColor $(if ($hasAggressivePlugin) { 'Green' } else { 'Red' })

    if (-not ($hasOfflineHtml -and $hasFetchIntercept -and $hasErrorHandling -and $hasAggressivePlugin)) {
        Write-Host "`n  ✗ 配置验证失败,缺少关键特性" -ForegroundColor Red
        exit 1
    }

    Write-Host "`n  ✓ 配置验证通过" -ForegroundColor Green
} else {
    Write-Host "  ✗ 错误: Service Worker 文件不存在" -ForegroundColor Red
    exit 1
}

# 步骤 4: 构建项目
if ($Build) {
    Write-Host "`n步骤 4: 构建项目" -ForegroundColor Yellow

    $originalDir = Get-Location
    Set-Location $projectDir

    try {
        Write-Host "  执行: yarn build" -ForegroundColor Gray
        $buildResult = yarn build 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ 构建成功" -ForegroundColor Green
        } else {
            Write-Host "  ✗ 构建失败" -ForegroundColor Red
            Write-Host $buildResult -ForegroundColor Red
            exit 1
        }
    } finally {
        Set-Location $originalDir
    }
} else {
    Write-Host "`n步骤 4: 构建 (跳过,使用 -Build 参数启用)" -ForegroundColor Gray
}

# 步骤 5: 部署
if ($Deploy) {
    Write-Host "`n步骤 5: 部署到 Kubernetes" -ForegroundColor Yellow

    try {
        Write-Host "  执行: ./build-push-aliyun.ps1" -ForegroundColor Gray
        $deployResult = ./build-push-aliyun.ps1 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ 部署成功" -ForegroundColor Green
        } else {
            Write-Host "  ✗ 部署失败" -ForegroundColor Red
            Write-Host $deployResult -ForegroundColor Red
            Write-Host "`n  提示: 请检查 Kubernetes 配置和镜像仓库" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "  ✗ 部署过程中出错: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n步骤 5: 部署 (跳过,使用 -Deploy 参数启用)" -ForegroundColor Gray
}

# 步骤 6: 测试
if ($Test) {
    Write-Host "`n步骤 6: 测试离线功能" -ForegroundColor Yellow

    Write-Host "  测试步骤:" -ForegroundColor Cyan
    Write-Host "    1. 访问: https://192.168.171.3:9443/report/pwa" -ForegroundColor White
    Write-Host "    2. 打开浏览器 DevTools (F12)" -ForegroundColor White
    Write-Host "    3. 切换到 Network 面板,选择 Offline" -ForegroundColor White
    Write-Host "    4. 刷新页面" -ForegroundColor White
    Write-Host "    5. 应该看到离线页面而非 502 错误" -ForegroundColor White
    Write-Host ""
    Write-Host "  检查 Service Worker:" -ForegroundColor Cyan
    Write-Host "    1. 打开: chrome://serviceworker-internals/" -ForegroundColor White
    Write-Host "    2. 确认 SW 状态为 'Active'" -ForegroundColor White
    Write-Host "    3. 检查控制台是否有 [SW] 日志" -ForegroundColor White
    Write-Host ""
    Write-Host "  模拟离线测试:" -ForegroundColor Cyan
    Write-Host "    1. 关闭 Next.js 服务:" -ForegroundColor White
    Write-Host "       kubectl scale deployment sei-nextjs --replicas=0 -n seirep" -ForegroundColor Gray
    Write-Host "    2. 访问: https://192.168.171.3:9443/report/pwa" -ForegroundColor White
    Write-Host "    3. 应该看到友好的离线页面" -ForegroundColor White
    Write-Host "    4. 恢复服务:" -ForegroundColor White
    Write-Host "       kubectl scale deployment sei-nextjs --replicas=2 -n seirep" -ForegroundColor Gray

    # 自动化测试 (需要浏览器支持)
    Write-Host "`n  尝试自动测试..." -ForegroundColor Yellow

    try {
        $response = Invoke-WebRequest -Uri "https://192.168.171.3:9443/report/pwa" `
            -SkipCertificateCheck -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue

        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ 服务可访问 (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ 服务返回状态码: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠ 无法连接到服务 (可能是正常的,如果 SW 已激活)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n步骤 6: 测试 (跳过,使用 -Test 参数启用)" -ForegroundColor Gray
}

# 完成
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  部署完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步操作:" -ForegroundColor Green
Write-Host "  1. 如果未构建,运行: cd packages/mainProj && yarn build" -ForegroundColor White
Write-Host "  2. 如果未部署,运行: ./build-push-aliyun.ps1" -ForegroundColor White
Write-Host "  3. 如果需要测试,重新运行: .\deploy-enhanced-sw.ps1 -Test" -ForegroundColor White
Write-Host ""

Write-Host "回滚命令:" -ForegroundColor Yellow
Write-Host "  Copy-Item sw-backups\sw.tsx.backup.* packages\mainProj\src\app\sw.tsx" -ForegroundColor Gray
Write-Host ""

Write-Host "详细文档: SW-ENHANCED-IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""

# 清理旧的备份 (保留最近 5 个)
Write-Host "清理旧备份..." -ForegroundColor Gray
$oldBackups = Get-ChildItem $backupDir -Filter "*.backup.*" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 5

if ($oldBackups) {
    $oldBackups | Remove-Item -Force
    Write-Host "  ✓ 已删除 $($oldBackups.Count) 个旧备份" -ForegroundColor Green
}
