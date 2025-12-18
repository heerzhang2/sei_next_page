@echo off
REM VS Code调试专用脚本

echo 正在启动Next.js调试模式...
echo 端口: 9229
echo 调试器URL: ws://127.0.0.1:9229

REM 设置环境变量
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NODE_OPTIONS=--inspect=0.0.0.0:9229

REM 清理缓存
if exist .next rd /s /q .next

REM 启动调试模式
pnpm run start:debug