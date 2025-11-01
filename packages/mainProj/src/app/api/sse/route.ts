// app/api/sse/route.ts
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
 * 建立 SSE 连接：GET /api/sse
 * 获取集群状态：GET /api/sse?action=stats
 * 发送广播消息：POST /api/sse
 *
 * 注意：serverlessFunction 和 edgeFunctions 不适合 SSE 长连接，建议用轮询
 */

const SERVER_ID = process.env.VERCEL_URL || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 增强的客户端信息存储
interface ClientInfo {
    controller: ReadableStreamDefaultController
    userRole?: string
    unitId?: string
    userAgent?: string
    ip?: string
    connectedAt: number
}

const localClients: Map<ReadableStreamDefaultController, ClientInfo> = new Map()

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

// 消息过滤接口
interface MessageFilter {
    userRoles?: string[]      // 目标用户角色列表
    unitIds?: string[]        // 目标单位ID列表
    excludeUserIds?: string[] // 排除的用户ID
    includeUserIds?: string[] // 包含的用户ID
}

// 增强的广播消息接口
interface BroadcastMessage {
    type: string
    data: any
    filters?: MessageFilter
    timestamp: number
    fromServer: string
    metadata?: {
        priority?: 'low' | 'normal' | 'high'
        expiresAt?: number
        persistent?: boolean
    }
}

// 检查客户端是否匹配过滤条件
function clientMatchesFilter(clientInfo: ClientInfo, filters?: MessageFilter): boolean {
    if (!filters) return true // 没有过滤条件，发送给所有客户端

    // 按用户角色过滤
    if (filters.userRoles && filters.userRoles.length > 0) {
        if (!clientInfo.userRole || !filters.userRoles.includes(clientInfo.userRole)) {
            return false
        }
    }

    // 按单位ID过滤
    if (filters.unitIds && filters.unitIds.length > 0) {
        if (!clientInfo.unitId || !filters.unitIds.includes(clientInfo.unitId)) {
            return false
        }
    }

    // 这里可以添加更多过滤条件...

    return true
}

// 向匹配的本地客户端广播消息
function broadcastToLocalClients(message: BroadcastMessage) {
    const messageStr = `data: ${JSON.stringify(message)}\n\n`
    let sentCount = 0
    let filteredCount = 0

    localClients.forEach((clientInfo, controller) => {
        try {
            // 检查客户端是否匹配过滤条件
            if (clientMatchesFilter(clientInfo, message.filters)) {
                controller.enqueue(messageStr)
                sentCount++
            } else {
                filteredCount++
            }
        } catch (error) {
            // 连接已关闭，从集合中移除
            localClients.delete(controller)
            console.log(`[SSE] 清理无效客户端连接`)
        }
    })

    if (sentCount > 0 || filteredCount > 0) {
        console.log(`[SSE] 消息 ${message.type} 已发送: ${sentCount} 客户端, 过滤: ${filteredCount} 客户端`)
    }
}

// 启动服务器注册和消息检查
async function startServer() {
    try {
        await registerServer()

        // 定期检查广播消息
        setInterval(async () => {
            try {
                const message = await redis.get(`sse:broadcast:${SERVER_ID}`)
                if (message) {
                    const parsedMessage: BroadcastMessage = JSON.parse(message)
                    broadcastToLocalClients(parsedMessage)
                    await redis.del(`sse:broadcast:${SERVER_ID}`)
                }
            } catch (error) {
                console.error('[SSE] 处理广播消息失败:', error)
            }
        }, 2000)

        console.log(`[SSE] 服务器 ${SERVER_ID} 启动完成`)
    } catch (error) {
        console.error('[SSE] 服务器启动失败:', error)
    }
}

startServer().catch(console.error)

// 获取客户端IP
function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    return forwarded?.split(',')[0] || realIP || 'unknown'
}

export async function GET(request: Request) {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    // 如果是请求统计信息
    if (action === 'stats') {
        const servers = await getActiveServers()
        const clientStats = {
            total: localClients.size,
            byRole: {} as Record<string, number>,
            byUnit: {} as Record<string, number>
        }

        // 统计客户端信息
        localClients.forEach(client => {
            if (client.userRole) {
                clientStats.byRole[client.userRole] = (clientStats.byRole[client.userRole] || 0) + 1
            }
            if (client.unitId) {
                clientStats.byUnit[client.unitId] = (clientStats.byUnit[client.unitId] || 0) + 1
            }
        })

        return NextResponse.json({
            serverId: SERVER_ID,
            clients: clientStats,
            activeServers: servers.length,
            servers,
            uptime: process.uptime()
        })
    }

    // 建立 SSE 连接
    const encoder = new TextEncoder()

    // 获取客户端信息（从查询参数或headers）
    const userRole = url.searchParams.get('role') || undefined
    const unitId = url.searchParams.get('unitId') || undefined
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const clientIP = getClientIP(request)

    const stream = new ReadableStream({
        start(controller) {
            const clientInfo: ClientInfo = {
                controller,
                userRole,
                unitId,
                userAgent: userAgent.substring(0, 100), // 限制长度
                ip: clientIP,
                connectedAt: Date.now()
            }

            localClients.set(controller, clientInfo)

            console.log(`[SSE] 新客户端连接到服务器 ${SERVER_ID}，角色: ${userRole || '未知'}, 单位: ${unitId || '未知'}, 当前连接数: ${localClients.size}`)

            // 发送欢迎消息
            const welcomeData: BroadcastMessage = {
                type: 'connected',
                data: {
                    message: 'SSE连接已建立',
                    serverId: SERVER_ID,
                    timestamp: new Date().toISOString()
                },
                timestamp: Date.now(),
                fromServer: SERVER_ID
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(welcomeData)}\n\n`))

            // 发送版本信息
            const buildInfo = getBuildInfo()
            const versionData: BroadcastMessage = {
                type: 'version',
                data: {
                    version: buildInfo.version,
                    buildTime: buildInfo.buildTime,
                    type: 'initial'
                },
                timestamp: Date.now(),
                fromServer: SERVER_ID
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(versionData)}\n\n`))

            // 定期发送心跳防止超时
            const heartbeatInterval = setInterval(() => {
                try {
                    const heartbeatMessage: BroadcastMessage = {
                        type: 'heartbeat',
                        data: { timestamp: Date.now() },
                        timestamp: Date.now(),
                        fromServer: SERVER_ID
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeatMessage)}\n\n`))
                } catch (error) {
                    // 连接可能已关闭，清除定时器
                    clearInterval(heartbeatInterval)
                }
            }, 30000) // 每30秒发送一次心跳 # 心跳机制是 SSE 长连接可靠性的关键保障

            // 监听连接关闭
            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeatInterval)
                localClients.delete(controller)
                console.log(`[SSE] 客户端断开连接，剩余连接数: ${localClients.size}`)
            })
        },
        cancel() {
            localClients.delete(controller)
            console.log(`[SSE] 客户端连接被取消，剩余连接数: ${localClients.size}`)
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

// 广播消息端点 - 支持过滤条件
export async function POST(request: Request) {
    try {
        const { type, data, filters, metadata } = await request.json()

        if (!type) {
            return NextResponse.json({ error: '缺少消息类型' }, { status: 400 })
        }

        const message: BroadcastMessage = {
            type,
            data,
            filters, // 支持用户角色、单位ID等过滤条件
            timestamp: Date.now(),
            fromServer: SERVER_ID,
            metadata
        }

        // 广播到所有服务器（包括自己）
        await broadcastToAllServers(message)

        return NextResponse.json({
            success: true,
            message: '消息已广播到所有服务器',
            type,
            filters: filters || '无过滤条件',
            localClients: localClients.size,
            estimatedRecipients: '根据过滤条件动态计算'
        })
    } catch (error) {
        console.error('[SSE] 处理广播请求失败:', error)
        return NextResponse.json({ error: '无效的请求数据' }, { status: 400 })
    }
}