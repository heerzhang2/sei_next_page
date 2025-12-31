@echo off
chcp 65001 >nul
echo =========================================
echo 部署主项目 (Production)
echo =========================================
echo.

cd /d "%~dp0"

echo [1/5] 拉取最新代码...
git pull origin master
if %errorlevel% neq 0 (
    echo ✗ Git pull 失败
    pause
    exit /b 1
)
echo ✓ 代码更新完成
echo.

echo [2/5] 安装依赖 (Yarn Workspace 自动处理)...
call yarn install --frozen-lockfile
if %errorlevel% neq 0 (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [3/5] 构建所有包...
call yarn build
if %errorlevel% neq 0 (
    echo ✗ 构建失败
    pause
    exit /b 1
)
echo ✓ 所有包构建完成
echo.

echo [4/5] 构建主项目 (生产版本)...
cd packages\mainProj
call yarn build
if %errorlevel% neq 0 (
    echo ✗ 主项目构建失败
    pause
    exit /b 1
)
cd ..\..
echo ✓ 主项目构建完成
echo.

echo [5/5] 重启服务...
call packages\mainProj\restart:pm2
if %errorlevel% neq 0 (
    echo ⚠  PM2 重启失败,可能需要手动启动
    echo   手动启动: cd packages\mainProj && yarn start:pm2
) else (
    echo ✓ 服务重启完成
)
echo.

echo =========================================
echo 部署完成！
echo =========================================
echo.
echo 检查服务状态: cd packages\mainProj && pm2 status
echo.
pause
