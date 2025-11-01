// lib/sse-broadcaster.ts
import { redis } from "./redis"

const SERVER_ID = process.env.VERCEL_URL || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
const SERVER_SET_KEY = 'sse:servers'

// 注册当前服务器实例
export async function registerServer(): Promise<void> {
    try {
        await redis.hset(SERVER_SET_KEY, {
            [SERVER_ID]: Date.now(),
            lastHeartbeat: Date.now()
        })
        console.log(`[SSE] 服务器 ${SERVER_ID} 注册成功`)
    } catch (error) {
        console.error('[SSE] 服务器注册失败:', error)
    }
}

// 获取所有活跃的服务器实例
export async function getActiveServers(): Promise<string[]> {
    try {
        const servers = await redis.hgetall(SERVER_SET_KEY)
        const now = Date.now()
        const maxAge = 5 * 60 * 1000 // 5分钟

        // 过滤掉过期的服务器
        const activeServers = Object.entries(servers)
            .filter(([serverId, lastSeen]) => {
                // 跳过 lastHeartbeat 字段
                if (serverId === 'lastHeartbeat') return false
                return now - parseInt(lastSeen as string) <= maxAge
            })
            .map(([serverId]) => serverId)

        return activeServers
    } catch (error) {
        console.error('[SSE] 获取活跃服务器失败:', error)
        return []
    }
}

// 发送广播到所有服务器，支持消息过滤
export async function broadcastToAllServers(message: any): Promise<void> {
    try {
        const servers = await getActiveServers()
        console.log(`[SSE] 向 ${servers.length} 个服务器广播消息: ${message.type}`)

        // 为每个服务器存储广播消息
        const broadcastPromises = servers.map(serverId =>
            redis.setex(
                `sse:broadcast:${serverId}`,
                60, // 60秒过期
                JSON.stringify(message)
            )
        )

        await Promise.all(broadcastPromises)
    } catch (error) {
        console.error('[SSE] 广播消息失败:', error)
    }
}

// 清理过期服务器
async function cleanupExpiredServers(): Promise<void> {
    try {
        const servers = await redis.hgetall(SERVER_SET_KEY)
        const now = Date.now()
        const maxAge = 5 * 60 * 1000 // 5分钟

        for (const [serverId, lastSeen] of Object.entries(servers)) {
            // 跳过 lastHeartbeat 字段
            if (serverId === 'lastHeartbeat') continue

            if (now - parseInt(lastSeen as string) > maxAge) {
                await redis.hdel(SERVER_SET_KEY, serverId)
                console.log(`[SSE] 移除过期服务器: ${serverId}`)
            }
        }
    } catch (error) {
        console.error('[SSE] 清理过期服务器失败:', error)
    }
}

// 定期更新服务器心跳
function startHeartbeat(): void {
    setInterval(() => {
        registerServer().catch(console.error)
    }, 30000) // 每30秒更新一次；

    // 每分钟清理一次过期服务器
    setInterval(() => {
        cleanupExpiredServers().catch(console.error)
    }, 60000)
}

// 启动心跳
startHeartbeat()