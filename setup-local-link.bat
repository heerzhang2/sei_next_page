@echo off
REM ========================================
REM 设置共享认证包本地链接
REM ========================================

echo ========================================
echo 设置共享认证包本地链接
echo ========================================
echo.

echo [1/3] 构建共享认证包...
cd /d d:\home\sei_next_page\packages\shared-auth-config
call npm install
if errorlevel 1 (
    echo [ERROR] npm install 失败
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] 构建失败
    pause
    exit /b 1
)
echo [OK] 共享认证包构建完成
echo.

echo [2/3] 创建全局链接...
call npm link
if errorlevel 1 (
    echo [ERROR] npm link 失败
    pause
    exit /b 1
)
echo [OK] 全局链接创建成功
echo.

echo [3/3] 在主项目中链接...
cd /d d:\home\sei_next_page\packages\mainProj
call npm link @fjsei/shared-auth-config
if errorlevel 1 (
    echo [ERROR] 链接到主项目失败
    pause
    exit /b 1
)
echo [OK] 主项目链接成功
echo.

echo ========================================
echo 验证链接状态...
echo ========================================
call npm list @fjsei/shared-auth-config
echo.

echo ========================================
echo 设置完成！
echo ========================================
echo.
echo 下一步：
echo   1. 修改 src/app/auth.config.ts 使用共享配置
echo   2. 启动开发服务器: cd mainProj ^&^& npm run dev
echo.
echo 修改共享包后，需要：
echo   cd shared-auth-config ^&^& npm run build
echo   cd ../mainProj ^&^& npm run dev
echo.

pause
