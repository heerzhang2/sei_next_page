@echo off
chcp 65001 >nul
echo =========================================
echo 验证 Workspace 配置
echo =========================================
echo.

cd /d "%~dp0"

echo [检查 1/6] 根 package.json workspace 配置...
findstr /C:"\"workspaces\"" package.json >nul
if %errorlevel% equ 0 (
    echo ✓ 根 package.json 包含 workspace 配置
) else (
    echo ✗ 根 package.json 缺少 workspace 配置
)
echo.

echo [检查 2/6] turbo.json 配置...
if exist "turbo.json" (
    echo ✓ turbo.json 存在
) else (
    echo ✗ turbo.json 不存在
)
echo.

echo [检查 3/6] shared-auth-config package.json...
if exist "packages\shared-auth-config\package.json" (
    echo ✓ shared-auth-config package.json 存在
    type packages\shared-auth-config\package.json | findstr /C:"\"@fjsei/shared-auth-config\"" >nul
    if %errorlevel% equ 0 (
        echo ✓ 包名正确: @fjsei/shared-auth-config
    ) else (
        echo ✗ 包名不正确
    )
) else (
    echo ✗ shared-auth-config package.json 不存在
)
echo.

echo [检查 4/6] mainProj 对 shared-auth-config 的依赖...
type packages\mainProj\package.json | findstr /C:"\"@fjsei/shared-auth-config\"" >nul
if %errorlevel% equ 0 (
    echo ✓ mainProj 依赖 shared-auth-config
    type packages\mainProj\package.json | findstr /C:"\"workspace:\*\"" >nul
    if %errorlevel% equ 0 (
        echo ✓ 使用 workspace:* 协议
    ) else (
        echo ⚠  未使用 workspace:* 协议
    )
) else (
    echo ✗ mainProj 未依赖 shared-auth-config
)
echo.

echo [检查 5/6] shared-auth-config 构建产物...
if exist "packages\shared-auth-config\dist\index.js" (
    echo ✓ shared-auth-config 已构建 (dist/index.js)
) else (
    echo ✗ shared-auth-config 未构建
)
echo.

echo [检查 6/6] Workspace 链接...
if exist "packages\mainProj\node_modules\@fjsei\shared-auth-config" (
    echo ✓ shared-auth-config 已链接到 mainProj
) else (
    echo ✗ shared-auth-config 未链接到 mainProj
)
echo.

echo =========================================
echo 列出所有 workspace 包:
echo =========================================
call yarn workspaces list
echo.

pause
