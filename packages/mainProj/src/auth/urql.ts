import { createClient, fetchExchange } from "@urql/core"
import { cacheExchange } from "@urql/exchange-graphcache"
import schema from "./urql-schema.json" // 确保你的 schema.json 路径正确
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

const createFetchOptions = (accessToken?: string | null) => {
    return {
        agent: getHttpAgent(),
        headers: {
            ...(accessToken && { authorization: `Bearer ${accessToken}` }),
        },
        timeout: 20000, // 从30秒减少到20秒
    }
}

// 服务端 URQL 客户端工厂函数
export const { get } = registerUrql(() => {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                schema,
                keys: {
                    RepLink: () => null, // 不需要生成缓存键
                },
            }),
            // 服务端不需要 authExchange 来刷新 token，因为 session 已经在 NextAuth 层面处理
            // 但如果需要传递 token，可以在 fetchOptions 中处理
            fetchExchange,
        ],
        fetchOptions: () => createFetchOptions(),
    })
})

// 可选：如果你需要在服务端组件中使用 URQL（比如匿名查看报告）
export function createServerUrqlClient(accessToken?: string | null) {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                keys: {
                    RepLink: () => null, // 不需要生成缓存键
                },
            }),
            fetchExchange,
        ],
        fetchOptions: createFetchOptions(accessToken),
        // 服务端不需要 suspense
        suspense: false,
    })
}

export const cleanupServerConnections = () => {
    if (httpAgent) {
        httpAgent.destroy()
        httpAgent = null
    }
}

if (typeof process !== "undefined") {
    process.on("exit", cleanupServerConnections)
    process.on("SIGINT", cleanupServerConnections)
    process.on("SIGTERM", cleanupServerConnections)
}

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
    })
}
