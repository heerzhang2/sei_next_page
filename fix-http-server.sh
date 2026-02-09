#!/bin/bash
# 临时修复：在 Pod 中创建 HTTP 服务器脚本

cat > /tmp/fix-server.mjs << 'EOF'
import { createServer as createHttpServer } from "http"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3765

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createHttpServer(async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        await handle(req, res, url)
    })

    server.listen(port, '0.0.0.0', (err) => {
        if (err) throw err
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log(`> HTTP server started successfully`)
    })
})
EOF

echo "修复脚本已创建：/tmp/fix-server.mjs"
echo ""
echo "请在 Pod 中执行："
echo "kubectl exec -n seirep sei-nextjs-84fbf4b4b4-447zn -- node /tmp/fix-server.mjs &"
echo ""
echo "注意：这会替换当前正在运行的服务器进程"
