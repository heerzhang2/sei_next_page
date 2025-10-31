import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { redis } from "@/lib/redis"
import {
    registerServer,
    broadcastToAllServers,
    getActiveServers
} from "@/lib/sse-broadcaster"
/**
建立 SSE 连接：GET /api/sse
获取集群状态：GET /api/sse?action=stats
发送广播消息：POST /api/sse
serverlessFunction: edgeFunctions: 不适合SSE长连接，建议用轮询；
* */
const SERVER_ID = process.env.VERCEL_URL || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
const localClients: Set<ReadableStreamDefaultController> = new Set()

// 构建信息管理
let cachedBuildInfo: { version: string; buildTime: string } | null = null

function getBuildInfo() {
    if (cachedBuildInfo) {
        return cachedBuildInfo
    }
    try {
        const buildInfoPath = join(process.cwd(), "public", "build-info.json")
        const buildInfoContent = readFileSync(buildInfoPath, "utf-8")
        cachedBuildInfo = JSON.parse(buildInfoContent)
        return cachedBuildInfo
    } catch (error) {
        console.warn("build-info.json not found, using fallback version")
        cachedBuildInfo = {
            version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
            buildTime: new Date().toISOString(),
        }
        return cachedBuildInfo
    }
}

// 向所有本地客户端广播消息
function broadcastToLocalClients(message: any) {
    const messageStr = `data: ${JSON.stringify(message)}\n\n`

    localClients.forEach(controller => {
        try {
            controller.enqueue(messageStr)
        } catch (error) {
            localClients.delete(controller)
        }
    })
}

// 启动服务器注册和消息检查
async function startServer() {
    await registerServer()
    // 定期检查广播消息
    setInterval(async () => {
        try {
            const message = await redis.get(`sse:broadcast:${SERVER_ID}`)

            if (message) {
                const parsedMessage = JSON.parse(message)
                broadcastToLocalClients(parsedMessage)
                await redis.del(`sse:broadcast:${SERVER_ID}`)
            }
        } catch (error) {
            console.error('[SSE] 处理广播消息失败:', error)
        }
    }, 2000)
}

startServer().catch(console.error)

export async function GET(request: Request) {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    //如果是请求统计信息
    if (action === 'stats') {
        const servers = await getActiveServers()
        return NextResponse.json({
            serverId: SERVER_ID,
            localClients: localClients.size,
            activeServers: servers.length,
            servers
        })
    }
    //否则:建立 SSE 连接
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            localClients.add(controller)
            console.log(`[SSE] 新客户端连接到服务器 ${SERVER_ID}，当前连接数: ${localClients.size}`)

            //第一条消息: 欢迎；
            const welcomeData = {
                type: 'connected',
                data: { message: 'SSE连接已建立' },
                timestamp: Date.now()
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcomeData)}\n\n`))
            // 发送版本信息
            const buildInfo = getBuildInfo()
            const versionData = {
                type: 'version',
                data: {
                    version: buildInfo.version,
                    buildTime: buildInfo.buildTime,
                    type: 'initial'
                },
                timestamp: Date.now()
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(versionData)}\n\n`))
            // 监听连接关闭
            request.signal.addEventListener('abort', () => {
                localClients.delete(controller)
            })
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    })
}

// 广播消息端点 - 现在会广播到所有服务器
export async function POST(request: Request) {
    try {
        const { type, data } = await request.json()

        if (!type) {
            return NextResponse.json({ error: '缺少消息类型' }, { status: 400 })
        }

        const message = {
            type,
            data,
            timestamp: Date.now(),
            fromServer: SERVER_ID
        }

        // 广播到所有服务器（包括自己）
        await broadcastToAllServers(message)

        return NextResponse.json({
            success: true,
            message: '消息已广播到所有服务器',
            type,
            localClients: localClients.size
        })
    } catch (error) {
        return NextResponse.json({ error: '无效的请求数据' }, { status: 400 })
    }
}