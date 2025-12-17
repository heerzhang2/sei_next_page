@echo off
echo Starting Yarn Debug Mode...
set NODE_TLS_REJECT_UNAUTHORIZED=0
set NODE_OPTIONS=--inspect
yarn %*