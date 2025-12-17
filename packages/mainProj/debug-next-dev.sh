#!/bin/bash
# Next.js调试脚本，类似camunda-worker的调试方式

# 设置环境变量
export NODE_TLS_REJECT_UNAUTHORIZED=0
export TS_NODE_PROJECT="./tsconfig.debug.json"
export TS_NODE_TRANSPILE_ONLY=true

# 启动调试模式
npx ts-node --inspect --project ./tsconfig.debug.json -r tsconfig-paths/register node_modules/.bin/next dev