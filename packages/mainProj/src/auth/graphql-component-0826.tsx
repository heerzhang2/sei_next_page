"use client"

import { ssrExchange, fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { useAccessToken } from "./use-access-token"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useMemo, useRef, useCallback, useEffect, useState } from "react"
//离线保存支持的：
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import schema from "./urql-schema.json"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { toast } from "sonner"
import type { Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, map } from "wonka"

// 创建网络状态管理:全局的。
const networkStatus = {
    isOnline: true,
    lastError: null as Error | null,
    listeners: new Set<(status: { isOnline: boolean; lastError: Error | null }) => void>(),
}

// 网络状态监听器
export const subscribeToNetworkStatus = (
    callback: (status: { isOnline: boolean; lastError: Error | null }) => void,
) => {
    networkStatus.listeners.add(callback)
    return () => networkStatus.listeners.delete(callback)
}

// 更新网络状态
export const updateNetworkStatus = (isOnline: boolean, error: Error | null = null) => {
    networkStatus.isOnline = isOnline
    networkStatus.lastError = error
    networkStatus.listeners.forEach((callback) => callback({ isOnline, lastError: error }))
}

// 检查是否为网络错误
export const isNetworkError = (error: any): boolean => {
    if (!error) return false

    const errorMessage = error.message?.toLowerCase() || ""
    const networkErrorKeywords = [
        "network error",
        "fetch failed",
        "connection refused",
        "timeout",
        "network request failed",
        "failed to fetch",
        "err_connection_refused",
        "err_network",
        "err_internet_disconnected",
    ]

    return (
        networkErrorKeywords.some((keyword) => errorMessage.includes(keyword)) ||
        (error.name === "TypeError" && errorMessage.includes("fetch"))
    )
}

// 自定义网络错误处理 Exchange
let errorCount = 0
let lastErrorTime = 0
const MAX_ERRORS_PER_MINUTE = 10
const ERROR_RESET_TIME = 60000 // 1分钟

const networkErrorExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            forward,
            tap((result: OperationResult) => {
                if (result.error) {
                    console.log("[v0] networkErrorExchange - 原始错误对象:", {
                        error: result.error,
                        networkError: result.error.networkError,
                        graphQLErrors: result.error.graphQLErrors,
                        response: result.error.response,
                        operation: result.operation.operationName,
                    })

                    const now = Date.now()

                    if (now - lastErrorTime > ERROR_RESET_TIME) {
                        errorCount = 0
                    }

                    const hasNetworkError =
                        result.error.networkError ||
                        result.error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                        isNetworkError(result.error)

                    if (hasNetworkError) {
                        errorCount++
                        lastErrorTime = now

                        if (errorCount <= MAX_ERRORS_PER_MINUTE) {
                            console.error("网络错误检测到:", result.error)
                            updateNetworkStatus(false, result.error)

                            if (errorCount <= 3 && typeof window !== "undefined") {
                                toast.error("GraphQL后端连接失败", {
                                    description: "正在使用缓存数据，请检查后端服务器状态",
                                    duration: 5000,
                                })
                            }
                        } else {
                            console.warn("GraphQL错误过于频繁，暂停错误处理")
                        }

                        // 确保错误能被 useQuery 捕获
                        result.error.isNetworkError = true
                    } else {
                        // 如果有成功的响应，说明网络恢复了
                        if (result.data && !networkStatus.isOnline) {
                            console.log("GraphQL后端网络已恢复")
                            updateNetworkStatus(true)
                            errorCount = 0 // 重置错误计数
                        }
                    }
                } else if (result.data) {
                    // 成功获取数据，网络正常
                    if (!networkStatus.isOnline) {
                        console.log("GraphQL后端网络已恢复")
                        updateNetworkStatus(true)
                        errorCount = 0 // 重置错误计数
                    }
                }
            }),
        )
    }
}

// 自定义 fetch exchange 来更好地处理网络错误
const customFetchExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            map((operation: Operation) => {
                console.log("[v0] customFetchExchange - 发送请求:", {
                    operationName: operation.operationName,
                    query: operation.query.loc?.source.body.substring(0, 200) + "...",
                    variables: operation.variables,
                })

                // 为每个操作添加超时和错误处理
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

                return {
                    ...operation,
                    context: {
                        ...operation.context,
                        fetchOptions: {
                            ...operation.context.fetchOptions,
                            signal: controller.signal,
                            timeoutId: timeoutId, // 添加超时ID到上下文中
                        },
                    },
                }
            }),
            forward,
            tap((result: OperationResult) => {
                console.log("[v0] customFetchExchange - 收到响应:", {
                    operationName: result.operation.operationName,
                    hasData: !!result.data,
                    hasError: !!result.error,
                    error: result.error,
                    // 尝试获取原始HTTP响应信息
                    response: result.error?.response || result.response,
                    extensions: result.extensions,
                })

                // 清理超时
                if (result.operation.context.fetchOptions?.signal) {
                    clearTimeout(result.operation.context.fetchOptions.timeoutId)
                }
            }),
        )
    }
}

// 创建认证交换器
const makeAuthExchange = (accessToken: string | null) => {
    return authExchange(async (utils) => {
        return {
            addAuthToOperation(operation) {
                if (!accessToken) {
                    return operation
                }
                return utils.appendHeaders(operation, {
                    Authorization: `Bearer ${accessToken}`,
                })
            },
            didAuthError(error) {
                console.log("[v0] authExchange.didAuthError - 详细错误信息:", {
                    error: error,
                    message: error.message,
                    networkError: error.networkError,
                    graphQLErrors: error.graphQLErrors,
                    response: error.response,
                    responseStatus: error.response?.status,
                    responseStatusText: error.response?.statusText,
                    responseHeaders: error.response?.headers ? Object.fromEntries(error.response.headers.entries()) : null,
                    responseUrl: error.response?.url,
                    responseType: error.response?.type,
                    responseBodyUsed: error.response?.bodyUsed,
                })

                // 检查 GraphQL 错误
                const hasGraphQLAuthError = error.graphQLErrors?.some(
                    (e) => e.extensions?.code === "UNAUTHORIZED" || e.extensions?.code === "UNAUTHENTICATED",
                )

                // 检查网络错误状态码
                const response = error.response
                const hasNetworkAuthError = response && (response.status === 401 || response.status === 403)

                // 检查特殊的 Java 后端 500 错误（实际是 token 过期）
                const isSpecial500 =
                    response &&
                    response.status === 500 &&
                    response.headers?.get("content-length") === "0" &&
                    response.headers?.get("content-type")?.includes("application/graphql-response+json")

                console.log("[v0] authExchange.didAuthError - 认证错误判断结果:", {
                    hasGraphQLAuthError,
                    hasNetworkAuthError,
                    isSpecial500,
                    finalResult: hasGraphQLAuthError || hasNetworkAuthError || isSpecial500,
                })

                return hasGraphQLAuthError || hasNetworkAuthError || isSpecial500
            },
            async refreshAuth() {
                try {
                    console.log("尝试刷新 token...")
                    const response = await fetch("/api/refresh-token", {
                        method: "POST",
                        credentials: "include",
                    })

                    if (!response.ok) {
                        throw new Error("Token refresh failed")
                    }

                    const data = await response.json()
                    if (data.success) {
                        console.log("Token 刷新成功")
                        toast.success("登录已刷新", {
                            description: "会话已自动续期",
                            duration: 3000,
                        })
                        return
                    } else {
                        throw new Error(data.error || "Token refresh failed")
                    }
                } catch (error) {
                    console.error("Token 刷新失败:", error)
                    toast.error("登录已过期", {
                        description: "请重新登录",
                        duration: 5000,
                    })

                    // 派发未授权事件
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(
                            new CustomEvent("urql:unauthorized", {
                                detail: { error },
                            }),
                        )
                    }

                    setTimeout(() => {
                        if (typeof window !== "undefined") {
                            const protocol = window.location.protocol === "https:" ? "https:" : "http:"
                            const host = window.location.host
                            console.error("Token刷新失败跳转login")
                            window.location.href = `${protocol}//${host}/login`
                        }
                    }, 2000)
                }
            },
        }
    })
}

export function GraphQLProvider({ children }: { children: ReactNode }) {
    const accessToken = useAccessToken()

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // 使用 useRef 来保持客户端实例的稳定性
    const clientRef = useRef<any>(null)
    const ssrRef = useRef<any>(null)
    const lastTokenRef = useRef<string | null>(null)
    const instanceIdRef = useRef(Math.random().toString(36).substr(2, 9))

    const initializedRef = useRef(false)

    useEffect(() => {
        if (!initializedRef.current) {
            console.log(`[v0] GraphQLProvider 首次挂载，实例ID: ${instanceIdRef.current}`)
            initializedRef.current = true
        }
        return () => {
            console.log(`[v0] GraphQLProvider 卸载，实例ID: ${instanceIdRef.current}`)
        }
    }, [])

    useEffect(() => {
        console.log(
            `[v0] Token变化检测 - 实例ID: ${instanceIdRef.current}, accessToken: ${accessToken}, lastTokenRef.current: ${lastTokenRef.current}`,
        )
    }, [accessToken])

    // 防抖机制：避免频繁重新创建客户端
    const createClientStable = useCallback(() => {
        if (!isClient) {
            return [null, null]
        }

        console.log(`[v0] createClientStable调用 - 实例ID: ${instanceIdRef.current}`)
        console.log(
            `[v0] 当前状态 - accessToken: ${accessToken}, lastTokenRef.current: ${lastTokenRef.current}, clientRef存在: ${!!clientRef.current}`,
        )

        // 只有当 accessToken 真正发生变化时才重新创建客户端
        if (lastTokenRef.current === accessToken && clientRef.current) {
            console.log(`[v0] 复用现有客户端 - 实例ID: ${instanceIdRef.current}`)
            return [clientRef.current, ssrRef.current]
        }

        console.log(
            `[v0] 重新创建 GraphQL 客户端，token 变化: ${lastTokenRef.current} -> ${accessToken}, 实例ID: ${instanceIdRef.current}`,
        )
        lastTokenRef.current = accessToken

        //离线保存支持的：只在客户端代码中使用 indexedDB。
        let storage
        if (typeof window !== "undefined") {
            storage = makeDefaultStorage({
                idbName: "graphcache-v3", // The name of the IndexedDB database
                maxAge: 7, // The maximum age of the persisted data in days
            })
        } else {
            //[避免报错] 在SSR服务器端， 用 空存储或内存储
            storage = {
                writeData: (data: any) => Promise.resolve(),
                readData: () => Promise.resolve(null),
                writeMetadata: (data: any) => Promise.resolve(),
                readMetadata: () => Promise.resolve(null),
            }
        }

        const cache = offlineExchange({
            logger(severity: "debug" | "error" | "warn", message: string) {
                console.log("offlineExchange:", severity, "消息", message)
            },
            schema,
            keys: {
                RepLink: () => null, //不需要生成缓存键
            },
            storage: {
                ...storage,
                // 覆盖DefaultStorage writeMetadata方法： 进来就是重复的队列，不需要做storage.readMetadata!().then(existing;
                writeMetadata: (json: SerializedRequest[]) => {
                    if (json?.length !== 0) {
                        const newMetadata = [...(json || [])]
                        const thisIndex = newMetadata.length - 1 //[假设前提]最后一条是最新发送失败的变更mutation操作。
                        if (thisIndex > 0) {
                            //删除所有同样接口的未成功的pending操作（按操作类型）？不是同一份的检验报告 +json[thisIndex].variables id &&条件? 来区分吗。业务层面事务性锁定的。
                            newMetadata.forEach(({ query }, index) => {
                                if (index !== thisIndex && query === json[thisIndex].query) {
                                    delete newMetadata[index]
                                }
                            })
                        }
                        const out = [...newMetadata.filter((a) => a !== undefined)]
                        storage.writeMetadata!(out)
                    } else storage.writeMetadata!(json)
                },
            } as any,
            // 修改 offlineExchange 配置，确保网络错误能正确传播
            resolverExchange: false, // 禁用解析器交换，让网络错误能够传播
            optimistic: {
                modifyOriginalRecordData(args, cache, info) {
                    //没断网情况也会执行。
                    return {
                        __typename: "Report",
                        id: args.id,
                        data: args.data,
                    }
                },
            },
        })

        const ssr = ssrExchange({
            isClient: typeof window !== "undefined",
        })

        //must be prefixed with NEXT_PUBLIC_.
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                // 错误处理 exchange 应该在最前面
                errorExchange({
                    onError: (error, operation) => {
                        console.log("[v0] errorExchange.onError - 完整错误信息:", {
                            operationName: operation.operationName,
                            operationType: operation.kind,
                            error: error,
                            message: error.message,
                            networkError: error.networkError,
                            graphQLErrors: error.graphQLErrors,
                            response: error.response,
                            // 尝试获取原始HTTP响应的详细信息
                            responseDetails: error.response
                                ? {
                                    status: error.response.status,
                                    statusText: error.response.statusText,
                                    headers: Object.fromEntries(error.response.headers?.entries() || []),
                                    url: error.response.url,
                                    type: error.response.type,
                                    ok: error.response.ok,
                                    redirected: error.response.redirected,
                                    bodyUsed: error.response.bodyUsed,
                                }
                                : null,
                        })

                        console.error("GraphQL 错误:", error)

                        // 检查是否为网络错误
                        const hasNetworkError =
                            error.networkError ||
                            error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                            isNetworkError(error)

                        if (hasNetworkError) {
                            console.error("网络连接错误:", error)
                            updateNetworkStatus(false, error)

                            // 显示用户友好的错误提示
                            if (typeof window !== "undefined") {
                                toast.error("网络连接失败", {
                                    description: "后端服务器无法连接，正在使用缓存数据",
                                    duration: 5000,
                                })
                            }
                        }
                    },
                }),
                cache,
                makeAuthExchange(accessToken),
                networkErrorExchange, // 自定义网络错误处理
                ssr,
                customFetchExchange, // 自定义 fetch exchange
                fetchExchange,
            ],
            suspense: true,
            fetchOptions: () => {
                return {
                    headers: {
                        authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                }
            },
        })

        // 缓存客户端实例
        clientRef.current = client
        ssrRef.current = ssr

        return [client, ssr]
    }, [accessToken, isClient])

    const memoizedClientRef = useRef<[any, any] | null>(null)
    const lastAccessTokenRef = useRef(accessToken)

    const [client, ssr] = useMemo(() => {
        if (!isClient) {
            return [null, null]
        }

        // 如果token没有变化且已有缓存的客户端，直接返回
        if (lastAccessTokenRef.current === accessToken && memoizedClientRef.current) {
            console.log(`[v0] 使用memoized客户端 - 实例ID: ${instanceIdRef.current}`)
            return memoizedClientRef.current
        }

        console.log(`[v0] 重新计算客户端 - 实例ID: ${instanceIdRef.current}`)
        lastAccessTokenRef.current = accessToken
        const result = createClientStable()
        memoizedClientRef.current = result
        return result
    }, [createClientStable, accessToken, isClient])

    console.log("停滞isClient:", isClient, "accessToken: ", accessToken, "client空=", client === null)

    if (!client) {
        return <div className="p-4 text-sm text-muted-foreground">正在初始化GraphQL客户端...</div>
    }

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
        </UrqlProvider>
    )
}
