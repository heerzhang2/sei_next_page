@echo off
REM Next.js调试脚本，类似camunda-worker的调试方式

REM 设置环境变量
set NODE_TLS_REJECT_UNAUTHORIZED=0
set TS_NODE_PROJECT=.\tsconfig.debug.json
set TS_NODE_TRANSPILE_ONLY=true

REM 启动调试模式
npx ts-node --inspect --project .\tsconfig.debug.json -r tsconfig-paths/register node_modules\.bin\next dev