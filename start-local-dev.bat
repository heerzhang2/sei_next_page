@echo off
chcp 65001 >nul
echo ====================================
echo Start Windows Local Dev Environment
echo ====================================
echo.

cd /d "%~dp0packages\mainProj"

echo Current Directory: %CD%
echo.

if not exist "..\..\..\.env.local.dev" (
    echo Warning: .env.local.dev not found
    echo Using existing .env.local config
    echo.
)

echo Starting Next.js dev server...
echo Access: http://localhost:3765
echo Press Ctrl+C to stop
echo.

npm run dev

pause
