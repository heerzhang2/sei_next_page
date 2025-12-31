@echo off
REM ========================================
REM 取消共享认证包本地链接
REM ========================================

echo ========================================
echo 取消共享认证包本地链接
echo ========================================
echo.

echo [1/2] 取消主项目链接...
cd /d d:\home\sei_next_page\packages\mainProj
call npm unlink @fjsei/shared-auth-config
if errorlevel 1 (
    echo [WARN] 取消链接失败或不存在
) else (
    echo [OK] 主项目链接已取消
)
echo.

echo [2/2] 取消全局链接...
cd /d d:\home\sei_next_page\packages\shared-auth-config
call npm unlink
if errorlevel 1 (
    echo [WARN] 取消全局链接失败或不存在
) else (
    echo [OK] 全局链接已取消
)
echo.

echo ========================================
echo 清理完成！
echo ========================================
echo.
echo 如需重新链接，请运行:
echo   setup-local-link.bat
echo.

pause
