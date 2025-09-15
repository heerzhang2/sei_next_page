"use client"

import { ssrExchange, fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { useAccessToken } from "./use-access-token"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useMemo, useRef, useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
//离线保存支持的：
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import schema from "./urql-schema.json"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { toast } from "sonner"
import {CombinedError, Exchange, Operation, OperationResult} from "@urql/core"
import { pipe, map, tap } from "wonka"
import { useSearchParams, usePathname } from "next/navigation"
import { useNetworkStatusContext, useNetworkStatusActions } from "../contexts/network-status-context"
//文档： https://nearform.com/open-source/urql/docs/
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

const isVersionConflictError = (error: any): boolean => {
    if (!error) return false

    const errorMessage = error.message || ""
    return (
        errorMessage.includes("原始记录已在其它设备或其他人改动了") ||
        errorMessage.includes("版本是") ||
        (error.graphQLErrors &&
            error.graphQLErrors.some((err: any) => err.message && err.message.includes("原始记录已在其它设备或其他人改动了")))
    )
}

const removeOperationFromQueue = async (operationToRemove: Operation, storage: any) => {
    try {
        if (!storage.readMetadata || !storage.writeMetadata) return

        const currentMetadata = await storage.readMetadata()
        if (!currentMetadata || !Array.isArray(currentMetadata)) return

        // Filter out the failed operation based on operation name and variables
        const filteredMetadata = currentMetadata.filter((request: SerializedRequest) => {
            const isSameOperation = request.query === operationToRemove.query.loc?.source.body
            const isSameVariables = JSON.stringify(request.variables) === JSON.stringify(operationToRemove.variables)
            return !(isSameOperation && isSameVariables)
        })
        toast.success(
            `离线队列中移除原队长度: ${currentMetadata.length}, 新队列长度: ${filteredMetadata.length} ${operationToRemove.variables?.id} ${operationToRemove.variables?.verion}`,
            {
                duration: 40000,
            },
        )
        console.log(
            `[v0] 从离线队列中移除操作，原队列长度: ${currentMetadata.length}, 新队列长度: ${filteredMetadata.length}`,
        )

        await storage.writeMetadata(filteredMetadata)

        // Update localStorage backup
        if (typeof window !== "undefined") {
            localStorage.setItem(
                "urql-metadata",
                JSON.stringify({
                    length: filteredMetadata.length,
                    timestamp: new Date().toLocaleString(),
                }),
            )
        }

        return true
    } catch (error) {
        console.error("[v0] 移除离线队列操作失败:", error)
        return false
    }
}

// 自定义网络错误处理 Exchange
let errorCount = 0
let lastErrorTime = 0
const MAX_ERRORS_PER_MINUTE = 2
const ERROR_RESET_TIME = 60000 // 1分钟

const createNetworkErrorExchange = (
    updateGraphQLBackendStatus: (isReachable: boolean, isClientOnline?: boolean) => void,
    storage: any, // Add storage parameter for queue management
): Exchange => {
    return ({ forward, client }) => {
        return (operations$) => {
            return pipe(
                operations$,
                forward,
                map((result: OperationResult) => {
                    if (result.data && !result.error && result.operation.kind === "mutation") {
                        handleSuccessfulMutation(result, result.operation, storage)
                    }

                    if (result.error) {
                        console.log("[v0] networkErrorExchange - 原始错误对象:", {
                            error: result.error,
                            networkError: result.error.networkError,
                            graphQLErrors: result.error.graphQLErrors,
                            response: result.error.response,
                            operation: result.operation.operationName,
                            isImmediateError: result.error.isImmediateError,
                        })

                        const now = Date.now()

                        if (now - lastErrorTime > ERROR_RESET_TIME) {
                            errorCount = 0
                        }

                        const hasNetworkError =
                            result.error.networkError ||
                            result.error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                            isNetworkError(result.error) ||
                            result.error.isNetworkError

                        if (hasNetworkError) {
                            errorCount++
                            lastErrorTime = now
                            if (errorCount <= MAX_ERRORS_PER_MINUTE) {
                                console.error("网络错误检测到:", result.error)
                                updateGraphQLBackendStatus(false, false)
                            } else {
                                console.log("GraphQL错误过于频繁，暂停错误处理")
                            }

                            if (result.error.isImmediateError) {
                                console.log("[v0] networkErrorExchange - 立即返回网络错误")
                                return {
                                    ...result,
                                    error: {
                                        ...result.error,
                                        message: result.error.message || "网络连接失败，请检查网络后重试",
                                    },
                                }
                            }
                        } else {
                            if (result.data) {
                                console.log("GraphQL后端网络已恢复")
                                updateGraphQLBackendStatus(true, true)
                                errorCount = 0
                            }
                        }
                    } else if (result.data) {
                        console.log("GraphQL后端网络已恢复")
                        updateGraphQLBackendStatus(true, true)
                        errorCount = 0
                    }

                    return result
                }),
            )
        }
    }
}

const handleSuccessfulMutation = async (result: OperationResult, operation: Operation, storage: any) => {
    try {
        // Check if this is a successful mutation response
        if (result.data && operation.kind === "mutation" && !result.error) {
            console.log("[v0] 检测到成功的mutation响应，准备从离线队列中移除:", {
                variables: operation.variables,
            })
            // Remove the successful operation from offline queue
            const success = await removeOperationFromQueue(operation, storage)
            const { id, version } = result.data.modifyOriginalRecordData || {}
            if (success) {
                console.log("[v0] 成功mutation操作已从离线队列中移除", id, version)
            }
            toast.success(`离线队SuccessMuta移除:${id} ${version}`, {
                duration: 40000,
            })
        }
    } catch (error) {
        console.error("[v0] 处理成功mutation时出错:", error)
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
            map((result: OperationResult) => {
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

                if (result.error) {
                    const hasNetworkError =
                        result.error.networkError ||
                        result.error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                        isNetworkError(result.error)

                    if (hasNetworkError) {
                        console.log("[v0] customFetchExchange - 检测到网络错误，立即返回错误结果")
                        // Mark as network error for immediate handling
                        result.error.isNetworkError = true
                        result.error.isImmediateError = true

                        // Return the error result immediately
                        return {
                            ...result,
                            error: {
                                ...result.error,
                                message: result.error.message || "网络连接失败",
                                networkError: result.error.networkError || new Error("Network connection failed"),
                                isNetworkError: true,
                                isImmediateError: true,
                            },
                        }
                    }
                }

                if (result.error?.response?.status === 401) {
                    console.log("[v0] 检测到401错误，token无效，准备触发刷新流程")

                    // 确保错误对象包含足够的信息供 authExchange 识别
                    if (result.error.response) {
                        result.error.networkError = result.error.response
                        result.error.isAuthError = true
                    }
                }

                return result
            }),
        )
    }
}

const getStoredRefreshToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refresh_token")
}

const setStoredRefreshToken = (token: string | null): void => {
    if (typeof window === "undefined") return
    if (token) {
        localStorage.setItem("refresh_token", token)
    } else {
        localStorage.removeItem("refresh_token")
    }
}

const refreshTokenDirectly = async (
    refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        if (!endpoint) throw new Error("Backend endpoint not configured")

        const response = await fetch(`${endpoint}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
              }
            }
          }
        `,
                variables: { refreshToken },
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.errors) {
            throw new Error(result.errors[0]?.message || "GraphQL error")
        }

        if (!result.data?.refreshToken) {
            throw new Error("No refresh token data returned")
        }

        return {
            accessToken: result.data.refreshToken.accessToken,
            refreshToken: result.data.refreshToken.refreshToken,
        }
    } catch (error) {
        console.error("Direct token refresh failed:", error)
        return null
    }
}

const checkNetworkConnectivity = async (): Promise<{ nextjsReachable: boolean; javaBackendReachable: boolean }> => {
    const results = await Promise.allSettled([
        // 检查Next.js服务器
        fetch("/api/nextLive", { method: "HEAD", cache: "no-cache" }).then((r) => r.ok),
        // 检查Java后端
        fetch(`${process.env.NEXT_PUBLIC_BACK_END}/graphql`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{ __typename }" }),
            cache: "no-cache",
        }).then((r) => r.ok),
    ])

    return {
        nextjsReachable: results[0].status === "fulfilled" && results[0].value,
        javaBackendReachable: results[1].status === "fulfilled" && results[1].value,
    }
}

const clearServiceWorkerAuthCache = async (): Promise<void> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return
    }

    try {
        const registration = await navigator.serviceWorker.ready
        if (registration.active) {
            const messageChannel = new MessageChannel()

            return new Promise((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        console.log("[v0] Service Worker认证缓存已清除")
                        resolve()
                    } else {
                        console.error("[v0] Service Worker缓存清除失败:", event.data.error)
                        reject(new Error(event.data.error))
                    }
                }

                registration.active!.postMessage({ type: "CLEAR_AUTH_CACHE" }, [messageChannel.port2])
            })
        }
    } catch (error) {
        console.error("[v0] 清除Service Worker缓存失败:", error)
    }
}

// 创建认证交换器
const makeAuthExchange = (accessToken: string | null, updateSession?: (data: any) => Promise<any>, print?: boolean) => {
    return authExchange(async (utils) => {
        return {
            addAuthToOperation(operation) {
                const currentToken = accessToken

                if (!currentToken) {
                    const refreshToken = getStoredRefreshToken()
                    if (refreshToken) {
                        console.log("[v0] 使用refreshToken作为认证fallback")
                        return utils.appendHeaders(operation, {
                            Authorization: `Bearer ${refreshToken}`,
                            "X-Auth-Type": "refresh", // 标记这是refreshToken认证
                        })
                    }
                    return operation
                }
                return utils.appendHeaders(operation, {
                    Authorization: `Bearer ${currentToken}`,
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
                    isAuthError: error.isAuthError,
                })

                // 检查 GraphQL 错误
                const hasGraphQLAuthError = error.graphQLErrors?.some(
                    (e) => e.extensions?.code === "UNAUTHORIZED" || e.extensions?.code === "UNAUTHENTICATED",
                )

                const response = error.response || error.networkError
                const hasNetworkAuthError = response && (response.status === 401 || response.status === 403)

                // 检查自定义的认证错误标记
                const hasCustomAuthError = error.isAuthError === true

                // 检查特殊的 Java 后端 500 错误（实际是 token 过期）
                const isSpecial500 =
                    response &&
                    response.status === 500 &&
                    response.headers?.get("content-length") === "0" &&
                    response.headers?.get("content-type")?.includes("application/graphql-response+json")

                const finalResult = hasGraphQLAuthError || hasNetworkAuthError || isSpecial500 || hasCustomAuthError

                console.log("[v0] authExchange.didAuthError - 认证错误判断结果:", {
                    hasGraphQLAuthError,
                    hasNetworkAuthError,
                    hasCustomAuthError,
                    isSpecial500,
                    finalResult,
                })

                return finalResult
            },
            async refreshAuth() {
                try {
                    console.log("[v0] 开始token刷新流程...")

                    const connectivity = print ? undefined : await checkNetworkConnectivity()
                    console.log("[v0] 网络连接状态:", connectivity)

                    const refreshToken = getStoredRefreshToken()

                    if (!refreshToken && !print && (!connectivity || !connectivity.nextjsReachable)) {
                        console.warn("[v0] 没有refresh token且NextJS不可达，直接跳转登录页")
                        throw new Error("No refresh token available and NextJS unreachable")
                    }

                    if (print || (connectivity && connectivity.nextjsReachable)) {
                        console.log("[v0] 使用Next.js服务器刷新token...")
                        const response = await fetch("/api/refresh-token", {
                            method: "POST",
                            credentials: "include",
                        })

                        if (response.ok) {
                            const data = await response.json()
                            if (data.success) {
                                console.log("[v0] Next.js服务器token刷新成功")

                                await clearServiceWorkerAuthCache()

                                if (updateSession) {
                                    try {
                                        const newsession = await updateSession({
                                            accessToken: data.accessToken,
                                            refreshToken: data.refreshToken,
                                        })
                                        console.log("[v0] Session已更新新的token", newsession, "目标", data.accessToken)

                                        await new Promise((resolve) => setTimeout(resolve, 100))
                                    } catch (error) {
                                        console.error("[v0] 更新session失败:", error)
                                    }
                                }

                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(
                                        new CustomEvent("token:refreshed", {
                                            detail: {
                                                accessToken: data.accessToken,
                                                refreshToken: data.refreshToken,
                                            },
                                        }),
                                    )
                                }

                                toast.success("登录已刷新，会话已自动续期", {
                                    duration: 2000,
                                })
                                return
                            }
                        }
                    }

                    if (
                        !print &&
                        connectivity &&
                        !connectivity.nextjsReachable &&
                        connectivity.javaBackendReachable &&
                        refreshToken
                    ) {
                        console.log("[v0] Next.js离线，尝试直接调用Java后端刷新token...")

                        const result = await refreshTokenDirectly(refreshToken)
                        if (result) {
                            console.log("[v0] 直接调用Java后端token刷新成功")

                            // 更新存储的refreshToken
                            setStoredRefreshToken(result.refreshToken)

                            await clearServiceWorkerAuthCache()

                            if (updateSession) {
                                try {
                                    const newsession = await updateSession({
                                        accessToken: result.accessToken,
                                        refreshToken: result.refreshToken,
                                    })
                                    console.log("[v0] 离线模式Session已更新新的token", newsession, "目标", result.accessToken)

                                    await new Promise((resolve) => setTimeout(resolve, 100))
                                } catch (error) {
                                    console.error("[v0] 离线模式更新session失败:", error)
                                }
                            }

                            // 触发自定义事件通知token更新
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(
                                    new CustomEvent("token:refreshed", {
                                        detail: {
                                            accessToken: result.accessToken,
                                            refreshToken: result.refreshToken,
                                        },
                                    }),
                                )
                            }

                            toast.success("离线模式登录刷新直接,直接与后端服务器通信", {
                                duration: 3000,
                            })
                            return
                        }
                    }

                    throw new Error("所有token刷新方式都失败")
                } catch (error) {
                    console.error("[v0] Token 刷新失败:", error)

                    setStoredRefreshToken(null)

                    toast.error("登录已过期", {
                        description: "请重新登录",
                        duration: 5000,
                    })

                    setTimeout(() => {
                        if (typeof window !== "undefined") {
                            const protocol = window.location.protocol === "https:" ? "https:" : "http:"
                            const host = window.location.host
                            console.error("[v0] Token刷新失败，立即跳转login")
                            window.location.href = `${protocol}//${host}/login`
                        }
                    }, 1000) // 减少到1秒，更快响应
                }
            },
        }
    })
}

export function GraphQLProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const print = "1" === searchParams!.get("print")
    const { accessToken, ConfirmDialog } = useAccessToken()
    const { update } = useSession()
    const networkStatusContext = useNetworkStatusContext()
    const { updateGraphQLBackendStatus } = useNetworkStatusActions()

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // 使用 useRef 来保持客户端实例的稳定性
    const clientRef = useRef<any>(null)
    const ssrRef = useRef<any>(null)
    const lastTokenRef = useRef<string | null>(null)
    const instanceIdRef = useRef(Math.random().toString(36).substr(2, 9))
    const storageRef = useRef<any>(null) // Add storage ref for queue management

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
            `Token变化检测实例ID: ${instanceIdRef.current}, accessToken: ${accessToken}, 旧lastTokenRef.current: ${lastTokenRef.current}`,
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

        storageRef.current = storage

        const cache = offlineExchange({
            schema,
            keys: {
                RepLink: () => null, //不需要生成缓存键
            },
            storage: {
                ...storage,
                // 覆盖DefaultStorage writeMetadata方法： 进来就是重复的队列，离线mutation保存才会进入这里的;点击太快会重复出现的。
                writeMetadata: async (json: SerializedRequest[]) => {
                    console.log('[offlineExchange] writeMetadata called with:', json?.length, 'items');
                    try {
                        if (!json?.length) {
                            // 谨慎处理：只有在确定存储为空时才删除备份
                            if (typeof window !== "undefined") {
                                setTimeout(async () => {
                                    try {
                                        const currentMetadata = await storage.readMetadata!()
                                        if (!currentMetadata || currentMetadata.length === 0) {
                                            localStorage.removeItem("urql-metadata")
                                            await storage.writeMetadata!(json || [])
                                        }
                                    } catch (error) {
                                        console.warn("检查存储状态失败:", error)
                                    }
                                }, 5000) // 延迟检查，确保写入完成：页面刚刚启动可能连续出现writeMetadata调用的。
                            }
                            return
                        }
                        // 使用对象来去重，保留最后一次出现的请求
                        const uniqueRequests: SerializedRequest[] = []
                        const seen = new Set()
                        // 反向遍历，保留每个唯一键的最后一次出现
                        for (let i = json.length - 1; i >= 0; i--) {
                            const request = json[i]
                            const key = request.variables?.id ? `${request.query}-${request.variables.id}` : request.query

                            if (!seen.has(key)) {
                                seen.add(key)
                                uniqueRequests.unshift(request)
                            }
                        }
                        storage.writeMetadata!(uniqueRequests)
                        // 在 localStorage 中备份队列信息，便于检查
                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                "urql-metadata",
                                JSON.stringify({
                                    length: uniqueRequests.length,
                                    timestamp: new Date().toLocaleString(),
                                }),
                            )
                        }
                    } catch (error) {
                        console.error("Error in writeMetadata:", error)
                        await storage.writeMetadata!(json || [])
                    }
                },
                readMetadata: async () => {
                    const result = await storage.readMetadata!();
                    console.log('[offlineExchange] readMetadata returned:', result?.length, 'items');
                    return result;
                },
            } as any,
            // 修改 offlineExchange 配置，确保网络错误能正确传播
            resolverExchange: false, // 禁用解析器交换，让网络错误能够传播
            optimistic: {
                modifyOriginalRecordData(args, cache, info) {
                    console.log('[offlineExchange] optimistic update for:', args.id);
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

        const debugExchange: Exchange = ({ forward }) => (ops$) => {
            return pipe(
                ops$,
                tap((op) => {
                    console.log(`操作 ${op.operationName} 开始处理`, op);
                }),
                forward,
                tap((result) => {
                    console.log(`操作 ${result.operation.operationName} 处理完成`, result);
                })
            );
        };

        //must be prefixed with NEXT_PUBLIC_.
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                // 1. 离线/缓存 exchange 应该在最前面
                cache,
                debugExchange,
                // 2. 开发工具 (如果有)
                // devToolsExchange,
                // 3. 认证 exchange - 需要尽早添加认证头
                makeAuthExchange(accessToken, update, print),
                // 4. 错误处理 exchange - 在认证后处理错误
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

                        if (isVersionConflictError(error)) {
                            console.log("[v0] 检测到版本冲突错误，显示详细提示并从队列中移除")

                            // Show detailed error message to user
                            const errorMessage = error.message || error.graphQLErrors?.[0]?.message || "版本冲突错误"
                            const invalidId = error.graphQLErrors?.[0]?.extensions?.invalidId || "未知ID"

                            toast.error("数据版本冲突", {
                                description: (
                                    <div className="space-y-2">
                                        <p className="font-medium text-red-700">{errorMessage}</p>
                                        <p className="text-sm text-gray-600">记录ID: {invalidId}</p>
                                        <p className="text-sm text-gray-500">
                                            该记录已被其他设备或用户修改，请刷新页面获取最新数据后重新操作。
                                        </p>
                                    </div>
                                ),
                                duration: 8000,
                                action: {
                                    label: "刷新页面",
                                    onClick: () => window.location.reload(),
                                },
                            })

                            // Remove the failed operation from offline queue
                            if (storageRef.current && operation.kind === "mutation") {
                                removeOperationFromQueue(operation, storageRef.current)
                                    .then((success) => {
                                        if (success) {
                                            toast.success(`离线队中移除度: ${JSON.stringify(operation.query.loc?.source)}`, {
                                                duration: 40000,
                                            })
                                            console.log("[v0] 版本冲突操作已从离线队列中移除")
                                        }
                                    })
                                    .catch((err) => {
                                        console.error("[v0] 移除版本冲突操作失败:", err)
                                    })
                            }

                            return // Don't process as network error
                        }

                        // 检查是否为网络错误
                        const hasNetworkError =
                            error.networkError ||
                            error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                            isNetworkError(error)

                        if (hasNetworkError) {
                            networkStatusContext && console.log("使用全局网络状态更新")
                        }
                    },
                }),

                // 5. 自定义网络错误处理
                createNetworkErrorExchange(updateGraphQLBackendStatus, storage),
                // 6. SSR exchange
                ssr,
                // 7. 自定义 fetch 处理
                // customFetchExchange,
                fetchExchange,
            ],
            suspense: true,
            preferGetMethod: false, //默认会可能用GET方法的。
            fetchOptions: () => {
                const currentToken = accessToken
                console.log(`createClientStable:最后:fetchOptions: ${currentToken}`)
                return {
                    headers: {
                        authorization: currentToken ? `Bearer ${currentToken}` : "",
                    },
                }
            },
        })

        // 缓存客户端实例
        clientRef.current = client
        ssrRef.current = ssr

        return [client, ssr]
    }, [accessToken, isClient, update, networkStatusContext])

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

        lastAccessTokenRef.current = accessToken
        const result = createClientStable()

        console.log(`[v0] 重新计算客户端 - 实例ID: ${instanceIdRef.current}`, accessToken)
        memoizedClientRef.current = result
        return result
    }, [createClientStable, accessToken, isClient])

    if (typeof window !== "undefined")
        console.log("停滞isClient:", isClient, "accessToken: ", accessToken, "client空=", client === null)
    if (!client) {
        return <div className="p-4 text-sm text-muted-foreground">正在初始化GraphQL客户端...</div>
    }

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
            {pathname !== "/login" && <ConfirmDialog />}
        </UrqlProvider>
    )
}
