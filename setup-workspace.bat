@echo off
chcp 65001 >nul
echo =========================================
echo Workspace (Monorepo) 设置脚本
echo =========================================
echo.

cd /d "%~dp0"

echo [1/5] 清理旧的 node_modules...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "packages\mainProj\node_modules" rmdir /s /q "packages\mainProj\node_modules"
if exist "packages\shared-auth-config\node_modules" rmdir /s /q "packages\shared-auth-config\node_modules"
if exist "packages\camunda-worker\node_modules" rmdir /s /q "packages\camunda-worker\node_modules"
if exist ".turbo" rmdir /s /q ".turbo"
echo ✓ 清理完成
echo.

echo [2/5] 构建共享认证包...
cd packages\shared-auth-config
call yarn build
if %errorlevel% neq 0 (
    echo ✗ 共享包构建失败
    pause
    exit /b 1
)
cd ..\..
echo ✓ 共享包构建完成
echo.

echo [3/5] 安装依赖 (Yarn Workspace 自动链接)...
call yarn install
if %errorlevel% neq 0 (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [4/5] 验证 workspace...
call yarn workspaces info
echo.

echo [5/5] 验证共享包链接...
if exist "packages\mainProj\node_modules\@fjsei\shared-auth-config" (
    echo ✓ shared-auth-config 已正确链接到 mainProj
) else (
    echo ✗ shared-auth-config 链接失败
    pause
    exit /b 1
)
echo.

echo =========================================
echo Workspace 设置完成！
echo =========================================
echo.
echo 下一步:
echo   1. 开发模式: start-workspace-dev.bat
echo   2. 构建项目: yarn build
echo   3. 启动主项目: cd packages\mainProj && yarn dev
echo.
pause
