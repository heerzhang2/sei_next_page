#!/bin/bash
set -e

echo "[INFO] 启动 LibreOffice UNO 套接字服务..."

# 确保前一个 soffice 进程已关闭
pkill -f "soffice" || true
sleep 1

# 创建 LibreOffice 用户配置目录
mkdir -p ~/.config/libreoffice/4/user

# 后台启动 soffice，禁用 GUI 和其他不必要的组件
soffice \
  --headless \
  --norestore \
  --accept="socket,host=127.0.0.1,port=2002;urp;" \
  &

SOFFICE_PID=$!
echo "[INFO] LibreOffice PID: $SOFFICE_PID"

# 等待套接字可用（最多 60 秒）
MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if python3 -c "import socket; s = socket.socket(); s.connect(('127.0.0.1', 2002)); s.close()" 2>/dev/null; then
        echo "[OK] LibreOffice UNO 套接字已就绪 (127.0.0.1:2002)"
        echo "[OK] soffice 进程 PID: $SOFFICE_PID"
        break
    fi
    echo "[WAIT] 等待 LibreOffice 启动... ($WAITED/$MAX_WAIT 秒)"
    sleep 2
    WAITED=$((WAITED + 2))
done

# 检查是否成功启动
if ! kill -0 $SOFFICE_PID 2>/dev/null; then
    echo "[ERROR] LibreOffice 进程已退出"
    exit 1
fi

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "[ERROR] LibreOffice UNO 套接字启动超时"
    kill -9 $SOFFICE_PID || true
    exit 1
fi

# 捕获 SIGTERM 信号，优雅关闭 soffice
trap 'echo "[INFO] 收到 SIGTERM，关闭 LibreOffice..."; kill -TERM $SOFFICE_PID 2>/dev/null; sleep 2; exit 0' SIGTERM

# 启动 Node.js 应用（保持前台运行，这样 soffice 会在 Docker 停止时关闭）
echo "[INFO] 启动 Node.js 应用..."
exec "$@"
