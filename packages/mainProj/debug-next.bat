@echo off
echo Starting Next.js in Debug Mode...
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NODE_OPTIONS=--inspect
yarn dev
pause