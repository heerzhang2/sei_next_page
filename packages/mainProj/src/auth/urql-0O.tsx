"use client"

import { createClient as createSSRClient, ssrExchange } from "@urql/core"
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import { retryExchange } from "@urql/exchange-retry"
import { fetchExchange, type Exchange, type CombinedError } from "urql"
import { pipe, tap } from "wonka"
import schema from "@/auth/urql-schema.json"
import https from "https"
import http from "http"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

const createHttpAgent = () => {
    const isHttps = url.startsWith("https")
    const AgentClass = isHttps ? https.Agent : http.Agent

    return new AgentClass({
        // 连接池配置
        maxSockets: 10, // 每个主机最大连接数
        maxFreeSockets: 5, // 每个主机最大空闲连接数
        timeout: 30000, // 连接超时 30秒
        freeSocketTimeout: 15000, // 空闲连接超时 15秒
        keepAlive: true, // 启用连接复用
        keepAliveMsecs: 1000, // keep-alive 间隔
        // 开发环境忽略自签名证书
        ...(process.env.NODE_ENV === "development" &&
            isHttps && {
                rejectUnauthorized: false,
            }),
    })
}

// 单例Agent实例
let httpAgent: http.Agent | https.Agent | null = null
const getHttpAgent = () => {
    if (!httpAgent) {
        httpAgent = createHttpAgent()
    }
    return httpAgent
}

const cleanupConnections = () => {
    if (httpAgent) {
        httpAgent.destroy()
        httpAgent = null
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanupConnections)
} else {
    // Node.js环境
    process.on("exit", cleanupConnections)
    process.on("SIGINT", cleanupConnections)
    process.on("SIGTERM", cleanupConnections)
}

// SSR exchange is safe to enable but we set suspense: false to avoid hydration mismatch
const ssr = ssrExchange({ isClient: typeof window !== "undefined" })

const storage =
    typeof window !== "undefined"
        ? makeDefaultStorage({ idbName: "graphcache-v3", maxAge: 7 })
        : {
            writeData: async () => {},
            readData: async () => ({}),
            writeMetadata: async () => {},
            readMetadata: async () => null,
        }

// Custom exchange to surface offline and unauthorized events to the UI
const networkStatusExchange: Exchange =
    ({ forward }) =>
        (ops$) =>
            pipe(
                forward(ops$),
                tap((result) => {
                    const err = result.error as CombinedError | undefined
                    if (!err) return

                    const offlineFlag =
                        !!err.networkError || err.graphQLErrors.some((ge) => (ge.extensions as any)?.offline === true)

                    const status = (err as any)?.response?.status as number | undefined
                    const unauth =
                        status === 401 || err.graphQLErrors.some((ge) => (ge.extensions as any)?.code === "UNAUTHENTICATED")

                    if (typeof window !== "undefined") {
                        if (offlineFlag) {
                            console.log("网络错误检测到:", err)

                            // 防抖：避免短时间内重复触发
                            const lastOfflineEvent = window.sessionStorage.getItem("lastOfflineEvent")
                            const now = Date.now()
                            if (!lastOfflineEvent || now - Number.parseInt(lastOfflineEvent) > 5000) {
                                window.sessionStorage.setItem("lastOfflineEvent", now.toString())
                                window.dispatchEvent(
                                    new CustomEvent("urql:offline", {
                                        detail: { error: { message: err.message } },
                                    }),
                                )
                            }
                        }
                        if (unauth) {
                            window.dispatchEvent(
                                new CustomEvent("urql:unauthorized", {
                                    detail: { message: "登录已过期或无效，请重新登录" },
                                }),
                            )
                        }
                    }
                }),
            )

const retry = retryExchange({
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    randomDelay: true,
    maxNumberAttempts: 2, // 进一步减少重试次数，避免连接堆积
    retryIf: (err) => {
        if (!err) return false
        const online = typeof navigator !== "undefined" ? navigator.onLine : true
        const status = (err as any)?.response?.status as number | undefined

        const isTransient = !!err.networkError || (status !== undefined && status >= 500 && status !== 503)

        // 如果是资源不足错误，不要重试
        if (err.message?.includes("ERR_INSUFFICIENT_RESOURCES")) {
            console.warn("资源不足错误，停止重试:", err.message)
            return false
        }

        if (
            err.message?.includes("ECONNRESET") ||
            err.message?.includes("ENOTFOUND") ||
            err.message?.includes("ETIMEDOUT")
        ) {
            console.warn("连接错误，停止重试:", err.message)
            return false
        }

        return online && isTransient
    },
})

const graphcache = offlineExchange({
    schema,
    storage,
    updates: {
        Mutation: {
            // Update for the correct mutation name from schema
            modifyOriginalRecordData: (_result, _args, _cache) => {
                if (typeof window !== "undefined" && navigator.serviceWorker?.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: "DATA_UPDATED" })
                }
            },
        },
    },
    optimistic: {
        // Example optimistic result; adapt to your schema
        modifyOriginalRecordData(args) {
            return {
                __typename: "Report",
                id: (args as any).id,
                data: (args as any).data,
            }
        },
    },
})

const fetchOptions = {
    headers: {
        authorization: "",
    },
    // 使用单例HTTP Agent，只在服务端环境使用
    ...(typeof window === "undefined" && {
        agent: getHttpAgent(),
    }),
}

const clientCache = new Map<string, ReturnType<typeof createSSRClient>>()

// 用于"服务端"环境（RSC、API 路由、NextAuth 回调等）
// 仅最小依赖：无 offlineExchange、无 suspense
export function urqlClient(accessToken: string | null) {
    const cacheKey = `server-${accessToken || "anonymous"}`

    if (clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey)!
    }

    const client = createSSRClient({
        url,
        fetchOptions: {
            ...fetchOptions,
            headers: {
                ...fetchOptions.headers,
                authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
        },
    })

    if (clientCache.size > 10) {
        const firstKey = clientCache.keys().next().value
        clientCache.delete(firstKey)
    }

    clientCache.set(cacheKey, client)
    return client
}

// 可选：客户端创建器（如果有需要）
export function makeUrqlClient(accessToken?: string | null) {
    const cacheKey = `client-${accessToken || "anonymous"}`

    if (clientCache.has(cacheKey)) {
        return clientCache.get(cacheKey)!
    }

    const client = createSSRClient({
        url,
        exchanges: [graphcache, networkStatusExchange, retry, ssr, fetchExchange],
        fetchOptions: {
            ...fetchOptions,
            headers: {
                ...fetchOptions.headers,
                authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
        },
    })

    if (clientCache.size > 10) {
        const firstKey = clientCache.keys().next().value
        clientCache.delete(firstKey)
    }

    clientCache.set(cacheKey, client)
    return client
}

export { cleanupConnections }
