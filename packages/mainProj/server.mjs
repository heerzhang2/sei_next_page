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
    let server

    // 尝试读取 SSL 证书
    try {
        const httpsOptions = {
            key: fs.readFileSync(path.join(__dirname, "ssl/localhost.key")),
            cert: fs.readFileSync(path.join(__dirname, "ssl/localhost.crt")),
        }

        // 创建 HTTPS 服务器
        server = createServer(httpsOptions, async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true)
                await handle(req, res, parsedUrl)
            } catch (err) {
                console.error("Error occurred handling", req.url, err)
                res.statusCode = 500
                res.end("internal server error")
            }
        })

        server.listen(port, (err) => {
            if (err) throw err
            const localIP = getLocalIP()
            console.log(`> Ready on https://${hostname}:${port}`)
            console.log(`> HTTPS server started successfully`)
            console.log(`> Local:    https://localhost:${port}`)
            console.log(`> Network:  https://${localIP}:${port}`)
            console.log(`> For mobile devices, use the Network URL`)
        })
    } catch (error) {
        console.warn("HTTPS certificates not found, starting HTTP server instead")
        console.warn('Run "npm run generate-ssl" to create SSL certificates')
        console.warn("Error details:", error.message)

        // 回退到 HTTP 服务器
        server = createHttpServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true)
                await handle(req, res, parsedUrl)
            } catch (err) {
                console.error("Error occurred handling", req.url, err)
                res.statusCode = 500
                res.end("internal server error")
            }
        })

        server.listen(port, (err) => {
            if (err) throw err
            const localIP = getLocalIP()
            console.log(`> Ready on http://${hostname}:${port}`)
            console.log(`> Local:    http://localhost:${port}`)
            console.log(`> Network:  http://${localIP}:${port}`)
            console.log(`> Note: PWA features require HTTPS. Generate SSL certificates with "npm run generate-ssl"`)
        })
    }

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
