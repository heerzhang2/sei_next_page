import cluster from "cluster"
import { cpus } from "os"
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
const hostname = "0.0.0.0" // 生产环境监听所有接口
const port = process.env.PORT || 3765
const numCPUs = cpus().length

// 获取本地 IP 地址的辅助函数
function getLocalIP() {
    const nets = networkInterfaces()
    const results = {}

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                if (!results[name]) {
                    results[name] = []
                }
                results[name].push(net.address)
            }
        }
    }

    for (const name of Object.keys(results)) {
        if (results[name].length > 0) {
            return results[name][0]
        }
    }

    return "localhost"
}

if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} is running`)
    console.log(`📊 Starting ${numCPUs} worker processes...`)

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`💀 Worker ${worker.process.pid} died with code ${code} and signal ${signal}`)
        console.log("🔄 Starting a new worker...")
        cluster.fork()
    })

    // 优雅关闭主进程
    process.on("SIGTERM", () => {
        console.log("🛑 Master received SIGTERM, shutting down gracefully...")
        for (const id in cluster.workers) {
            cluster.workers[id].kill()
        }
    })

    process.on("SIGINT", () => {
        console.log("🛑 Master received SIGINT, shutting down gracefully...")
        for (const id in cluster.workers) {
            cluster.workers[id].kill()
        }
    })

} else {
    // Worker process
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
                    console.error(`❌ Worker ${process.pid} error handling`, req.url, err)
                    res.statusCode = 500
                    res.end("internal server error")
                }
            })

            server.listen(port, hostname, (err) => {
                if (err) throw err
                const localIP = getLocalIP()
                console.log(`✅ Worker ${process.pid} ready on https://${hostname}:${port}`)
                if (process.env.NODE_ENV === "production") {
                    console.log(`🌐 Production HTTPS server (Worker ${process.pid})`)
                    console.log(`📍 Network: https://${localIP}:${port}`)
                }
            })

        } catch (error) {
            console.warn(`⚠️  Worker ${process.pid}: HTTPS certificates not found, using HTTP`)

            // 回退到 HTTP 服务器
            server = createHttpServer(async (req, res) => {
                try {
                    const parsedUrl = parse(req.url, true)
                    await handle(req, res, parsedUrl)
                } catch (err) {
                    console.error(`❌ Worker ${process.pid} error handling`, req.url, err)
                    res.statusCode = 500
                    res.end("internal server error")
                }
            })

            server.listen(port, hostname, (err) => {
                if (err) throw err
                const localIP = getLocalIP()
                console.log(`✅ Worker ${process.pid} ready on http://${hostname}:${port}`)
                if (process.env.NODE_ENV === "production") {
                    console.log(`🌐 Production HTTP server (Worker ${process.pid})`)
                    console.log(`📍 Network: http://${localIP}:${port}`)
                }
            })
        }

        // Worker 优雅关闭
        process.on("SIGTERM", () => {
            console.log(`🛑 Worker ${process.pid} received SIGTERM, shutting down...`)
            server.close(() => {
                console.log(`✅ Worker ${process.pid} terminated`)
                process.exit(0)
            })
        })

        process.on("SIGINT", () => {
            console.log(`🛑 Worker ${process.pid} received SIGINT, shutting down...`)
            server.close(() => {
                console.log(`✅ Worker ${process.pid} terminated`)
                process.exit(0)
            })
        })
    })
}
