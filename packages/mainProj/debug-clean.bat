@echo off
REM 清理并重启调试

echo 正在停止所有Node.js进程...
taskkill /f /im node.exe 2>nul

echo 正在清理Next.js缓存...
if exist .next rd /s /q .next 2>nul

echo 等待端口释放...
timeout /t 3 /nobreak >nul

echo 启动调试模式...
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NODE_OPTIONS=--inspect=127.0.0.1:9229
set SERWIST_SUPPRESS_TURBOPACK_WARNING=1
set NEXT_DEV_TURBOPACK=0

pnpm run start:debug