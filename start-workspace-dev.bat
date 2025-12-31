@echo off
chcp 65001 >nul
echo =========================================
echo 启动 Workspace 开发环境
echo =========================================
echo.

cd /d "%~dp0"

echo [1/2] 启动共享包 watch 模式...
start "shared-auth-config (watch)" cmd /k "cd packages\shared-auth-config && yarn dev"
echo ✓ shared-auth-config watch 模式已启动
echo.

timeout /t 2 /nobreak >nul

echo [2/2] 启动主项目...
start "mainProj (dev)" cmd /k "cd packages\mainProj && yarn dev"
echo ✓ mainProj 开发服务器已启动
echo.

echo =========================================
echo 开发环境已启动！
echo =========================================
echo.
echo 访问: http://localhost:3765/report
echo.
echo 注意: 修改 shared-auth-config 后会自动重新编译
echo.
pause
