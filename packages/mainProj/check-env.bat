@echo off
echo 检查当前环境...
echo.
echo Node.js版本:
node --version
echo.
echo Yarn版本:
yarn --version
echo.
echo PNPM版本:
pnpm --version 2>nul || echo PNPM未安装
echo.
echo npm版本:
npm --version
echo.
echo 当前包管理器:
npm config get package-manager
echo.
echo 当前目录:
cd
echo.
echo 环境变量NODE_OPTIONS:
echo %NODE_OPTIONS%
echo.
echo VS Code检测到的包管理器信息:
type package.json | findstr packageManager
pause