import { createClient, fetchExchange } from "@urql/core"
import { cacheExchange } from "@urql/exchange-graphcache"
import schema from "./urql-schema.json"
import { registerUrql } from "@urql/next/rsc"

// 检测是否在 Edge Runtime 环境中
const isEdgeRuntime = typeof window !== "undefined" || 
                     (typeof process !== "undefined" && 
                      typeof process.versions === "undefined" && 
                      typeof process.env === "undefined")

// 使用 Function 构造器动态导入，避免静态分析检测到 Node.js 模块
const loadNodeModules = async () => {
    if (isEdgeRuntime) {
        return { https: null, http: null }
    }
    
    try {
        // 使用 Function 构造器避免静态分析
        const importHttps = new Function('return import("https")')
        const importHttp = new Function('return import("http")')
        const https = await importHttps()
        const http = await importHttp()
        return { https, http }
    } catch (error) {
        console.warn("Failed to import Node.js modules:", error)
        return { https: null, http: null }
    }
}

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

const createHttpAgent = async () => {
    // 在 Edge Runtime 中返回 null，不使用 HTTP Agent
    if (isEdgeRuntime) {
        return null
    }

    const { https, http } = await loadNodeModules()
    
    if (!https || !http) {
        return null
    }

    const isHttpsUrl = url.startsWith("https")
    const AgentClass = isHttpsUrl ? https.Agent : http.Agent

    return new AgentClass({
        keepAlive: true,
        maxSockets: 2, // 从5减少到2，严格限制并发连接
        maxFreeSockets: 1, // 从2减少到1
        timeout: 20000, // 从30秒减少到20秒
        freeSocketTimeout: 10000, // 从15秒减少到10秒
        // HTTPS特定配置
        ...(isHttpsUrl &&
            process.env.NODE_ENV === "development" && {
                rejectUnauthorized: false, // 开发环境忽略自签名证书
            }),
    })
}

let httpAgent: any = null
const getHttpAgent = async () => {
    if (!httpAgent) {
        httpAgent = await createHttpAgent()
    }
    return httpAgent
}

// 修改 createFetchOptions 支持设备ID头部
const createFetchOptions = async (accessToken?: string | null, deviceId?: string) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    // 添加设备ID头部（如果提供）
    if (deviceId) {
        headers["X-Device-Id"] = deviceId
        console.log("服务端请求添加设备ID头部:", deviceId)
    }

    // 添加认证token
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
    }
    const httpAgent = await getHttpAgent()
    const fetchOptions: any = {
        method: "POST",
        headers,
        timeout: 30000,
    }
    // 只在非 Edge Runtime 环境中添加 agent； 边缘计算的情况不支持httpAgent但会自动管理网络链接的
    if (httpAgent) {
        fetchOptions.agent = httpAgent
    }
    return fetchOptions
}

// 修改服务端 URQL 客户端工厂函数，支持传递设备ID
export const createServerUrqlClient = (deviceId?: string) => {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                schema,
                keys: {
                    RepLink: () => null,
                },
            }),
            fetchExchange,
        ],
        fetchOptions: async () => await createFetchOptions(undefined, deviceId), // 服务端请求不传token，但传设备ID
        // 服务端不需要 suspense
        suspense: false,
    })
}

// 保持原有的 get 函数兼容性
export const { get } = registerUrql(() => {
    return createServerUrqlClient()
})

//没用！ 已不需要手动清理
export const cleanupServerConnections = () => {
    if (httpAgent && typeof httpAgent.destroy === "function") {
        httpAgent.destroy()
        httpAgent = null
    }
}

// 在 Edge Runtime 环境中不注册进程事件监听器
// 这些清理函数在 Next.js 的现代架构中通常不是必需的
// 如果需要手动清理，可以调用 cleanupServerConnections()

//若依据参数传递session?.user?.accessToken，确实可区分不同的登录用户的情况。
export const urqlClient = (accessToken?: string | null) => {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                schema,
                keys: {
                    RepLink: () => null, // 不需要生成缓存键
                },
            }),
            fetchExchange,
        ],
        fetchOptions: async () => await createFetchOptions(accessToken),
        // 服务端不需要 suspense
        suspense: false,
        requestPolicy: "network-only", // 可选：确保总是发起网络请求
        preferGetMethod: false,
    })
}
