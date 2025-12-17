@echo off
echo 简单的Next.js调试脚本（带断点），模仿camunda-worker方式...

REM 设置环境变量
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NODE_OPTIONS=--inspect-brk

REM 直接使用yarn运行
yarn dev