@echo off
REM ========================================
REM 修改共享包后快速重启主项目
REM ========================================

echo ========================================
echo 修改共享包后快速重启
echo ========================================
echo.

echo [1/2] 重新构建共享认证包...
cd /d d:\home\sei_next_page\packages\shared-auth-config
call npm run build
if errorlevel 1 (
    echo [ERROR] 构建失败
    pause
    exit /b 1
)
echo [OK] 共享认证包构建完成
echo.

echo [2/2] 清除主项目缓存并重启...
cd /d d:\home\sei_next_page\packages\mainProj

REM 检查 .next 目录是否存在
if exist .next (
    echo 删除 .next 缓存目录...
    rmdir /s /q .next
)

echo 启动开发服务器...
call npm run dev
