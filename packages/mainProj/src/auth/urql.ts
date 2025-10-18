import { createClient, fetchExchange } from "@urql/core"
import { cacheExchange } from "@urql/exchange-graphcache"
import schema from "./urql-schema.json"
import { registerUrql } from "@urql/next/rsc"
import https from "https"
import http from "http"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

const createHttpAgent = () => {
    const isHttps = url.startsWith("https")
    const AgentClass = isHttps ? https.Agent : http.Agent

    return new AgentClass({
        keepAlive: true,
        maxSockets: 2, // 从5减少到2，严格限制并发连接
        maxFreeSockets: 1, // 从2减少到1
        timeout: 20000, // 从30秒减少到20秒
        freeSocketTimeout: 10000, // 从15秒减少到10秒
        // HTTPS特定配置
        ...(isHttps &&
            process.env.NODE_ENV === "development" && {
                rejectUnauthorized: false, // 开发环境忽略自签名证书
            }),
    })
}

let httpAgent: http.Agent | https.Agent | null = null
const getHttpAgent = () => {
    if (!httpAgent) {
        httpAgent = createHttpAgent()
    }
    return httpAgent
}

// 修改 createFetchOptions 支持设备ID头部
const createFetchOptions = (accessToken?: string | null, deviceId?: string) => {
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

    return {
        agent: getHttpAgent(),
        method: "POST",
        headers,
        timeout: 30000,
    }
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
        fetchOptions: createFetchOptions(undefined, deviceId), // 服务端请求不传token，但传设备ID
        // 服务端不需要 suspense
        suspense: false,
    })
}

// 保持原有的 get 函数兼容性
export const { get } = registerUrql(() => {
    return createServerUrqlClient()
})

export const cleanupServerConnections = () => {
    if (httpAgent) {
        httpAgent.destroy()
        httpAgent = null
    }
}

if (typeof process !== "undefined" && typeof process.on === "function") {
    process.on("exit", cleanupServerConnections)
    process.on("SIGINT", cleanupServerConnections)
    process.on("SIGTERM", cleanupServerConnections)
}

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
        fetchOptions: createFetchOptions(accessToken),
        // 服务端不需要 suspense
        suspense: false,
        requestPolicy: "network-only", // 可选：确保总是发起网络请求
        preferGetMethod: false,
    })
}
