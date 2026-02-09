import { createServer } from "https"
import { createServer as createHttpServer } from "http"
import { parse } from "url"
import next from "next"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { networkInterfaces } from "os"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3765

// 获取本地 IP 地址的辅助函数
function getLocalIP() {
    const nets = networkInterfaces()
    const results = {}

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // 跳过非 IPv4 和内部地址
            if (net.family === "IPv4" && !net.internal) {
                if (!results[name]) {
                    results[name] = []
                }
                results[name].push(net.address)
            }
        }
    }

    // 返回第一个找到的外部 IPv4 地址
    for (const name of Object.keys(results)) {
        if (results[name].length > 0) {
            return results[name][0]
        }
    }

    return "localhost"
}

// 创建 Next.js 应用
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    // 直接使用 HTTP 服务器
    console.log("Starting HTTP server (HTTPS is terminated by Nginx)")
    const server = createHttpServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error("Error occurred handling", req.url, err)
            res.statusCode = 500
            res.end("internal server error")
        }
    })

    server.listen(port, '0.0.0.0', (err) => {
        if (err) throw err
        const localIP = getLocalIP()
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log(`> HTTP server started successfully`)
        console.log(`> Local:    http://localhost:${port}`)
        console.log(`> Network:  http://${localIP}:${port}`)
        console.log(`> HTTPS is terminated by Nginx/APISIX`)
    })

    // 优雅关闭
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully")
        server.close(() => {
            console.log("Process terminated")
        })
    })

    process.on("SIGINT", () => {
        console.log("SIGINT received, shutting down gracefully")
        server.close(() => {
            console.log("Process terminated")
        })
    })
})
