import { redis } from "./redis"

const SERVER_ID = process.env.VERCEL_URL || `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
// 存储所有服务器实例
const SERVER_SET_KEY = 'sse:servers'

// 注册当前服务器实例
export async function registerServer() {
    await redis.hset(SERVER_SET_KEY, { [SERVER_ID]: Date.now() })
}
// 获取所有活跃的服务器实例
export async function getActiveServers(): Promise<string[]> {
    const servers = await redis.hgetall(SERVER_SET_KEY)
    return Object.keys(servers || {})
}
// 发送广播到所有服务器
export async function broadcastToAllServers(message: any) {
    const servers = await getActiveServers()
    // 为每个服务器存储广播消息
    for (const serverId of servers) {
        await redis.setex(
            `sse:broadcast:${serverId}`,
            60, // 60秒过期
            JSON.stringify(message)
        )
    }
}

// 定期清理过期服务器
setInterval(async () => {
    const servers = await redis.hgetall(SERVER_SET_KEY)
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟

    for (const [serverId, lastSeen] of Object.entries(servers)) {
        if (now - parseInt(lastSeen as string) > maxAge) {
            await redis.hdel(SERVER_SET_KEY, serverId)
            console.log(`[SSE] 移除过期服务器: ${serverId}`)
        }
    }
}, 60000) // 每分钟检查一次

// 定期更新服务器心跳
setInterval(() => {
    registerServer()
}, 30000) // 每30秒更新一次