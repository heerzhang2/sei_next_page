"use client"

import { fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { ssrExchange as ssrExchangeNext } from "@urql/next"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useRef, useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import type { Exchange, Operation, OperationResult, Client } from "@urql/core"
import { pipe, tap, map, filter } from "wonka"
import { usePathname, useSearchParams } from "next/navigation"
import { useNetworkStatusActions } from "@/contexts/network-status-context"
import { useVersionConflictManager } from "@/hooks/use-version-conflict-manager"
import { manualRetryExchange } from "@/lib/manual-retry-exchange"
import { preventDuplicateExchange } from "@/lib/prevent-duplicate-exchange"
import { acquireRefreshLock } from "@/lib/token-refresh-lock"
import { customQueryCacheExchange } from "@/lib/custom-query-cache-exchange"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import type { SSRExchange } from "@urql/next"
import schema from "./urql-schema.json"
import { useAccessToken } from "./use-access-token"
import {AuthCompQuery} from "@/component/header-wrapper";
import { withBasePath } from "@/lib/tool"

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
    // 检查是否为 502 Bad Gateway 错误
    const is502Error = errorMessage.includes("502") || 
                       errorMessage.includes("bad gateway") ||
                       (error.response && error.response.status === 502)

    return (
        networkErrorKeywords.some((keyword) => errorMessage.includes(keyword)) ||
        (error.name === "TypeError" && errorMessage.includes("fetch")) ||
        is502Error
    )
}

let errorCount = 0
let lastErrorTime = 0
const MAX_ERRORS_PER_MINUTE = 10
const ERROR_RESET_TIME = 60000

const getDeviceId = (): string => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("clientId") || ""
}

const maskToken = (token: string | null): string => {
    if (!token || token.length < 8) return "***"
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

const updateBackendStatusExchange = (
    updateGraphQLBackendStatus: (isReachable: boolean) => void,
): Exchange => {
    return ({ forward, client }) => {
        return (operations$) => {
            return pipe(
                operations$,
                forward,
                map((result: OperationResult) => {
                    if (result.error) {
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
                                updateGraphQLBackendStatus(false)
                                if (typeof window !== "undefined") {
                                    ;(window as any).__graphqlBackendReachable = false
                                }
                            }
                        } else {
                            if (result.data) {
                                updateGraphQLBackendStatus(true)
                                if (typeof window !== "undefined") {
                                    ;(window as any).__graphqlBackendReachable = true
                                }
                                errorCount = 0
                            }
                        }
                    } else if (result.data) {
                        updateGraphQLBackendStatus(true)
                        if (typeof window !== "undefined") {
                            ;(window as any).__graphqlBackendReachable = true
                        }
                        errorCount = 0
                    }
                    return result
                }),
            )
        }
    }
}

const customFetchExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            map((operation: Operation) => {
                // 检查离线状态：使用 window.__graphqlBackendReachable 或 sessionStorage 中的状态
                // 默认假设在线，除非明确检测到离线
                let isOffline = false
                if (typeof window !== "undefined") {
                    // 只有在 __graphqlBackendReachable 明确为 false 时才认为离线
                    // undefined 或 true 都认为是在线状态
                    if ((window as any).__graphqlBackendReachable === false) {
                        isOffline = true
                    } else if (!navigator.onLine) {
                        isOffline = true
                    } else {
                        // 尝试从 sessionStorage 读取后端状态
                        try {
                            const savedStatus = sessionStorage.getItem("network-status")
                            if (savedStatus) {
                                const parsed = JSON.parse(savedStatus)
                                const now = Date.now()
                                const MAX_AGE = 5 * 60 * 1000 // 5 分钟
                                if (parsed.timestamp && (now - parsed.timestamp) < MAX_AGE && parsed.isGraphQLBackendReachable === false) {
                                    isOffline = true
                                }
                            }
                        } catch (error) {
                            // 忽略错误，保持 isOffline = false
                        }
                    }
                }

                // 只在非查询操作或明确离线时输出日志，减少噪音
                if (isOffline || operation.kind !== "query") {
                    console.log("[customFetchExchange] 离线状态:", isOffline, "操作类型:", operation.kind)
                }

                // 检查操作是否已有 signal
                const existingSignal = operation.context.fetchOptions?.signal
                const isSignalAborted = existingSignal?.aborted === true
                
                // 如果操作已经有 signal 且没有被 abort，可以复用
                // 如果 signal 已被 abort（如 authExchange 重试时），必须创建新的 AbortController
                if (existingSignal && !isSignalAborted) {
                    console.log("[customFetchExchange] 检测到已有signal且未被abort，复用现有的AbortController")
                    const deviceId = getDeviceId()
                    const existingHeaders = operation.context.fetchOptions?.headers || {}
                    
                    return {
                        ...operation,
                        context: {
                            ...operation.context,
                            _isOffline: isOffline,
                            fetchOptions: {
                                ...operation.context.fetchOptions,
                                headers: {
                                    ...existingHeaders,
                                    "X-Device-Id": deviceId,
                                },
                            },
                        },
                    }
                }

                // 如果 signal 已被 abort，记录日志
                if (isSignalAborted) {
                    console.log(`[customFetchExchange] 检测到signal已被abort（可能是authExchange重试），创建新的AbortController`)
                }

                const controller = new AbortController()

                // 离线模式下超时时间缩短到 300ms，快速失败
                // 正常模式下使用5分钟超时（必须足够长以容纳token刷新+重试）
                // authExchange刷新token可能需要几秒，之后还要重试原请求
                const timeout = isOffline ? 300 : 300000  // 5分钟
                const timeoutId = setTimeout(() => {
                    console.log(`[customFetchExchange] 请求超时，自动取消: ${operation.kind}`)
                    controller.abort()
                }, timeout)

                const deviceId = getDeviceId()
                const existingHeaders = operation.context.fetchOptions?.headers || {}

                // 在 context 中标记离线状态，供后续 exchange 使用
                return {
                    ...operation,
                    context: {
                        ...operation.context,
                        _isOffline: isOffline,
                        _abortController: controller, // 保存引用以便后续使用
                        fetchOptions: {
                            ...operation.context.fetchOptions,
                            signal: controller.signal,
                            timeoutId: timeoutId,
                            headers: {
                                ...existingHeaders,
                                "X-Device-Id": deviceId,
                            },
                        },
                    },
                }
            }),
            forward,
            tap((result: OperationResult) => {
                // 清理超时定时器
                const timeoutId = result.operation.context.fetchOptions?.timeoutId
                if (timeoutId) {
                    clearTimeout(timeoutId)
                }
                
                const app401 = result.error?.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401
                if (result.error?.response?.status === 401 || app401) {
                    console.log("检测到401错误，token无效，准备触发刷新流程,app401=", app401)
                    result.error.networkError = result.error.response
                    result.error.isAuthError = true
                    if (result.operation.kind === "mutation")
                        console.warn(
                            "碰到Token错误401，正进行修改保存的操作需新做一次避免更新丢失",
                            result.operation?.variables?.id,
                        )
                }
            }),
        )
    }
}

const refreshTokenDirectly = async (): Promise<{ accessToken: string; refreshToken: string; user: any } | null> => {
    try {
        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        if (!endpoint) throw new Error("Backend endpoint not configured")
        console.log("[v0] refreshTokenDirectly: Using refresh_token from cookie")
        const requestBody: any = {
            query: `
        mutation RefreshToken($refreshToken: String) {
          refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
            user {
              id
            }
          }
        }
      `,
        }

        const deviceId = getDeviceId()
        const response = await fetch(`${endpoint}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        console.log("refreshTokenDirectly Set-Cookie header:", response.headers.get("set-cookie"))
        const result = await response.json()

        // 检查 GraphQL 错误 - 包括认证错误
        if (result.errors) {
            const error = result.errors[0]
            const errorCode = error?.extensions?.errorCode || error?.extensions?.code
            const errorMessage = error?.message || "GraphQL error"
            console.error("[v0] refreshTokenDirectly GraphQL error:", errorCode, errorMessage)

            // 如果是认证错误（refresh token 也过期了），返回 null 让调用方处理重定向
            if (errorCode === "UNAUTHORIZED" || errorCode === "UNAUTHENTICATED" || errorMessage.includes("没有登录")) {
                console.log("[v0] refreshTokenDirectly: Refresh token 已过期，需要重新登录")
                return null
            }
            throw new Error(errorMessage)
        }

        // 检查返回的数据结构
        console.log("[v0] refreshTokenDirectly: Response data:", JSON.stringify(result.data))

        // 检查返回的数据是否有效
        const refreshTokenData = result.data?.refreshToken
        if (!refreshTokenData) {
            console.error("[v0] refreshTokenDirectly: No refreshToken data in response")
            return null
        }

        // 严格检查 accessToken - 必须是有效的非空字符串
        const accessToken = refreshTokenData.accessToken
        if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 10) {
            console.error("[v0] refreshTokenDirectly: Invalid or empty access token:", accessToken)
            return null
        }

        const newTokens = {
            accessToken: accessToken,
            refreshToken: refreshTokenData.refreshToken,
            user: refreshTokenData.user || result.data.user,
        }
        console.log("[v0] refreshTokenDirectly: New tokens received successfully")
        console.log("  - accessToken:", maskToken(newTokens.accessToken))
        console.log("  - refreshToken:", maskToken(newTokens.refreshToken))
        console.log("  - user:", newTokens.user?.id || "no user id")
        return newTokens
    } catch (error) {
        console.error("Direct token refresh failed:", error)
        return null
    }
}

const checkNetworkConnectivity = async (): Promise<{ nextjsReachable: boolean; javaBackendReachable: boolean }> => {
    const results = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_APP_WEB}/api/nextLive`, { method: "HEAD", cache: "no-cache" }).then((r) => r.ok),
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
            const timeoutPromise = new Promise<void>((_, reject) => {
                setTimeout(() => reject(new Error("Service Worker缓存清除超时")), 2000)
            })
            const messagePromise = new Promise<void>((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data?.success) {
                        resolve()
                    } else {
                        console.error("Service Worker缓存清除失败:", event.data?.error)
                        reject(new Error(event.data?.error || "未知错误"))
                    }
                }
                registration.active!.postMessage({ type: "CLEAR_AUTH_CACHE" }, [messageChannel.port2])
            })
            // 竞争：消息响应或超时
            await Promise.race([messagePromise, timeoutPromise])
        }
    } catch (error) {
        console.error("清除Service Worker缓存失败:", error)
    }
}

let pendingMetadataBeforeRefresh: SerializedRequest[] = []

const makeAuthExchange = (
    getCurrentToken: () => string | null,
    updateSession?: (data: any) => Promise<any>,
    print?: boolean,
) => {
    return authExchange(async (utils) => {
        return {
            addAuthToOperation(operation) {
                const currentToken = getCurrentToken()
                const deviceId = getDeviceId()
                const headers: Record<string, string> = {}
                if (deviceId) {
                    headers["X-Device-Id"] = deviceId
                }
                // 记录所有经过的操作，帮助调试重试行为
                const operationName = operation.query?.definitions?.[0]?.name?.value || 'unknown'
                console.log(`[AuthExchange] addAuthToOperation: ${operation.kind} ${operationName}, hasToken: ${!!currentToken}`)
                
                if (!currentToken) {
                    return utils.appendHeaders(operation, headers)
                }
                console.log(`[AuthExchange] 为操作添加token: ${maskToken(currentToken)}`)
                return utils.appendHeaders(operation, {
                    ...headers,
                    Authorization: `Bearer ${currentToken}`,
                })
            },
            didAuthError(error) {
                const hasGraphQLAuthError = error.graphQLErrors?.some(
                    (e) => e.extensions?.code === "UNAUTHORIZED" || e.extensions?.code === "UNAUTHENTICATED",
                )
                const response = error.response || error.networkError
                const hasNetworkAuthError = response && (response.status === 401 || response.status === 403)
                const hasCustomAuthError = error.isAuthError === true
                const isSpecial500 =
                    response &&
                    response.status === 500 &&
                    response.headers?.get("content-length") === "0" &&
                    response.headers?.get("content-type")?.includes("application/graphql-response+json")
                const finalResult = hasGraphQLAuthError || hasNetworkAuthError || isSpecial500 || hasCustomAuthError

                if (finalResult) {
                    const currentToken = getCurrentToken()
                    console.log("[AuthExchange] 检测到认证错误，当前token:", maskToken(currentToken))
                }

                return finalResult
            },
            async refreshAuth() {
                const tokenBeforeRefresh = getCurrentToken()
                console.log("[AuthExchange] 准备刷新token，当前token:", maskToken(tokenBeforeRefresh))
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("token:refresh-start"))
                }
                const result = await acquireRefreshLock(async () => {
                    try {
                        console.log("[AuthExchange] 已获取refresh锁")

                        const connectivity = print ? undefined : await checkNetworkConnectivity()
                        let tokenData: { user: any; accessToken: string; refreshToken: string } | null = null
                        let fromNextjs = true
                        if (print || (connectivity && connectivity.nextjsReachable)) {
                            console.log("[AuthExchange] 通过NextJS API刷新token")
                            const refreshStartTime = Date.now()
                            //发送给Nextjs服务器的！不是发给Java后端。
                            const response = await fetch("/report/api/refresh-token", {
                                method: "POST",
                                credentials: "include",
                            })

                            console.log(`[AuthExchange] NextJS API响应时间: ${Date.now() - refreshStartTime}ms`)

                            if (response.ok) {
                                const data = await response.json()
                                if (data.success) {
                                    tokenData = {
                                        accessToken: data.accessToken,
                                        refreshToken: data.refreshToken,
                                        user: data.user,
                                    }

                                    console.log("[AuthExchange] NextJS API刷新成功")
                                    console.log("  - 新accessToken:", maskToken(tokenData.accessToken))
                                    console.log("  - 新refreshToken:", maskToken(tokenData.refreshToken))
                                }
                            } else {
                                console.error(`[AuthExchange] NextJS API刷新失败: ${response.status} ${response.statusText}`)
                                const errorText = await response.text()
                                console.error("[AuthExchange] 错误响应:", errorText)

                                if (response.status === 401) {
                                    if (typeof window !== "undefined") {
                                        window.dispatchEvent(new CustomEvent("token:refresh-failed"))
                                    }

                                    console.log("[AuthExchange] 401错误，清除认证信息并重定向到首页")

                                    if (typeof window !== "undefined") {
                                        localStorage.removeItem("offline_auth")
                                    }

                                    if (window.confirm("登录已失效，您的登录凭证已过期，是否跳转到登录页面重新登录？")) {
                                        if (typeof window !== "undefined") {
                                            window.location.href = withBasePath("/login")
                                        }
                                    }

                                    return null
                                }
                            }
                        } else if (!print && connectivity && !connectivity.nextjsReachable && connectivity.javaBackendReachable) {
                            console.log("[AuthExchange] 离线模式直接刷新token")
                            tokenData = await refreshTokenDirectly()
                            if (tokenData) {
                                fromNextjs = false
                                console.log("[AuthExchange] 直接刷新成功")
                                console.log("  - 新accessToken:", maskToken(tokenData.accessToken))
                                console.log("  - 新refreshToken:", maskToken(tokenData.refreshToken))
                            } else {
                                console.error("[AuthExchange] 直接刷新失败")

                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("token:refresh-failed"))
                                }

                                if (typeof window !== "undefined") {
                                    localStorage.removeItem("offline_auth")
                                }

                                if (window.confirm("登录已失效，您的登录凭证已过期，是否跳转到登录页面重新登录？")) {
                                    if (typeof window !== "undefined") {
                                        window.location.href = withBasePath("/login")
                                    }
                                }

                                return null
                            }
                        } else {
                            if (!print && (!connectivity || !connectivity.nextjsReachable)) {
                                if (typeof window !== "undefined") {
                                    window.dispatchEvent(new CustomEvent("token:refresh-failed"))
                                }
                                throw new Error("没有refresh token且NextJS不可达，直接跳转登录页")
                            }
                        }
                        if (!tokenData) {
                            pendingMetadataBeforeRefresh = []
                            console.error("[AuthExchange] Token刷新失败，无tokenData返回")

                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("token:refresh-failed"))
                            }

                            toast.error("登录已过期", {
                                description: "请重新登录，点导航登录",
                                duration: 60 * 1000,
                            })
                            return tokenData
                        }
                        
                        // 先触发 token:refreshed 事件，让 UI 立即响应
                        // 不要等到 clearServiceWorkerAuthCache 完成，因为它可能会卡住
                        if (typeof window !== "undefined") {
                            console.log("[AuthExchange] 触发token:refreshed事件并更新next-auth session")
                            window.dispatchEvent(
                                new CustomEvent("token:refreshed", {
                                    detail: {
                                        accessToken: tokenData.accessToken,
                                        refreshToken: tokenData.refreshToken,
                                        fromNextjs,
                                        user: tokenData.user,
                                        skipUpdate: false,
                                    },
                                }),
                            )
                        }
                        
                        // 异步清除 Service Worker 缓存，不阻塞主流程
                        clearServiceWorkerAuthCache().catch(err => {
                            console.error("[AuthExchange] 清除Service Worker缓存失败（非阻塞）:", err)
                        })

                        setTimeout(async () => {
                            if (pendingMetadataBeforeRefresh.length > 0) {
                                console.log("[AuthExchange] Token刷新完成，恢复pending metadata:", pendingMetadataBeforeRefresh.length)
                                for (const request of pendingMetadataBeforeRefresh) {
                                }
                                window.dispatchEvent(
                                    new CustomEvent("graphql-manual-retry", {
                                        detail: { retryAll: true },
                                    }),
                                )
                                pendingMetadataBeforeRefresh = []
                            }
                        }, 800)
                        console.log("[AuthExchange] Token刷新流程完成")
                        return tokenData
                    } catch (error) {
                        console.error("Token 刷新失败:", error)
                        pendingMetadataBeforeRefresh = []

                        if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("token:refresh-failed"))
                        }

                        toast.error("登录已过期", {
                            description: "请重新登录，点导航登录",
                            duration: 60 * 1000,
                        })
                    }
                })

                console.log("[AuthExchange] Refresh锁已释放")
                return result
            },
        }
    })
}

const fetchAbortExchange: Exchange =
    ({ forward, client }) =>
        (ops$) => {
            return pipe(
                ops$,
                tap((op) => {}),
                forward,
                tap((result) => {
                    const error = result.error
                    let offlineError = false,
                        authError = false
                    if (isNetworkError(error)) offlineError = true
                    if (error?.response?.status === 401 || error?.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401)
                        authError = true
                    if (isVersionConflictError(error)) offlineError = false

                    // 如果是认证错误，触发事件清除preventDuplicate的pending标记
                    // 这样authExchange重试时不会被阻止
                    if (authError && result.operation.kind === "mutation") {
                        console.log("[fetchAbortExchange] 检测到401认证错误，触发清除pending标记事件")
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(
                                new CustomEvent("graphql:clear-pending-mutation", {
                                    detail: { 
                                        operationKey: result.operation.key,
                                        operationId: result.operation?.variables?.id,
                                    },
                                }),
                            )
                        }
                    }

                    if (result.error && (offlineError || authError)) {
                        if (result.operation.kind === "mutation") {
                            const operationName = result.operation.query?.definitions[0]?.name.value
                            if (operationName) {
                                if (offlineError && !authError)
                                    toast.success("离线中", {
                                        duration: 2 * 1000,
                                    })
                                setTimeout(() => {
                                    if (typeof window !== "undefined") {
                                        window.dispatchEvent(
                                            new CustomEvent("mutation-completed", {
                                                detail: {
                                                    operation: operationName,
                                                    variables: {
                                                        id: result.operation.variables.id,
                                                    },
                                                    error: result.error,
                                                    hasError: true,
                                                },
                                            }),
                                        )
                                    }
                                }, 100)
                            }
                        }
                    }
                }),
            )
        }

const isVersionConflictError = (error: any): boolean => {
    if (!error) return false
    const errorMessage = error.message || ""
    return (
        errorMessage.includes("操作数据记录已在其它设备或其他人改动") ||
        (error.graphQLErrors &&
            error.graphQLErrors.some(
                (err: any) => err.message && err.message.includes("操作数据记录已在其它设备或其他人改动"),
            ))
    )
}

export function GraphQLProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const print = "1" === searchParams?.get("print")
    const { accessToken, ConfirmDialog } = useAccessToken()
    const { updateGraphQLBackendStatus } = useNetworkStatusActions()
    const { addConflictRequest } = useVersionConflictManager()
    const currentTokenRef = useRef<string | null>(null)
    
    // 使用 ref 存储回调函数以避免依赖变化
    const updateGraphQLBackendStatusRef = useRef(updateGraphQLBackendStatus)
    const addConflictRequestRef = useRef(addConflictRequest)
    
    // 使用 useState 来存储 client 和 ssr，确保 SSR 和客户端首次渲染一致（都是 null）
    const [clientState, setClientState] = useState<{ client: Client | null; ssr: SSRExchange | null }>({
        client: null,
        ssr: null,
    })
    
    // 初始化时默认设置 GraphQL 后端为可达状态，避免首次请求被误判为离线
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).__graphqlBackendReachable === undefined) {
            (window as any).__graphqlBackendReachable = true
            console.log("[GraphQLProvider] 初始化 __graphqlBackendReachable = true")
        }
    }, [])
    
    useEffect(() => {
        updateGraphQLBackendStatusRef.current = updateGraphQLBackendStatus
    }, [updateGraphQLBackendStatus])
    
    useEffect(() => {
        addConflictRequestRef.current = addConflictRequest
    }, [addConflictRequest])

    useEffect(() => {
        currentTokenRef.current = accessToken
    }, [accessToken])

    // 在 useEffect 中初始化 client，确保只在客户端执行且 SSR/客户端首次渲染一致
    useEffect(() => {
        // 如果已经初始化过，跳过（使用 clientState.client 而不是 ref，避免 StrictMode 问题）
        if (clientState.client) return
        
        const getCurrentToken = () => {
            if (currentTokenRef.current) {
                return currentTokenRef.current
            }

            try {
                const offlineAuth = localStorage.getItem("offline_auth")
                if (offlineAuth) {
                    const authData = JSON.parse(offlineAuth)
                    if (authData.accessToken && authData.expiresAt > Date.now()) {
                        console.log("[getCurrentToken] 从localStorage读取token作为fallback")
                        return authData.accessToken
                    }
                }
            } catch (error) {
                console.error("[getCurrentToken] 读取localStorage失败:", error)
            }

            return null
        }

        const storage = makeDefaultStorage({
            idbName: "graphcache-sei",
            maxAge: 7,
        })

        const cache = customQueryCacheExchange({
            schema,
            keys: {
                RepLink: () => null,
            },
            storage,
        })

        const ssrInstance = ssrExchangeNext({
            isClient: true,
        })

        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        const newClient = createClient({
            url: `${endpoint}/graphql`,
            exchanges: [
                errorExchange({
                    onError: (error, operation) => {
                        if (isVersionConflictError(error)) {
                            const errorMessage = error.message || error.graphQLErrors?.[0]?.message || "版本冲突错误"
                            const invalidId = error.graphQLErrors?.[0]?.extensions?.invalidId || "未知ID"

                            setTimeout(() => {
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
                                    duration: 24 * 60 * 60 * 1000,
                                    action: {
                                        label: "刷新页面",
                                        onClick: () => window.location.reload(),
                                    },
                                })
                            }, 50)

                            addConflictRequestRef.current(operation, error)
                            if (operation.kind === "mutation") {
                                const request: SerializedRequest = {
                                    query: operation.query.loc?.source?.body || "",
                                    variables: operation.variables,
                                    extensions: operation.extensions,
                                }
                            }
                        }
                        const has401Error =
                            error.response?.status === 401 || error.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401
                        if (has401Error && operation.kind === "mutation") {
                            console.log("[errorExchange] 检测到401错误的mutation，已加入离线队列等待重试")
                            toast.warning("认证失效，数据变更已保存到离线队列", {
                                description: "登录后将自动重新提交保存的数据变更",
                                duration: 120000,
                            })
                        }
                    },
                }),
                cache,
                makeAuthExchange(getCurrentToken, undefined, print),
                preventDuplicateExchange,
                manualRetryExchange,
                updateBackendStatusExchange((isReachable) => updateGraphQLBackendStatusRef.current(isReachable)),
                ssrInstance,
                fetchAbortExchange,
                customFetchExchange,
                fetchExchange,
            ],
            suspense: true,
            preferGetMethod: false,
            fetchOptions: () => {
                const currentToken = getCurrentToken()
                const deviceId = getDeviceId()
                const headers: Record<string, string> = {}
                if (deviceId) {
                    headers["X-Device-Id"] = deviceId
                }
                if (currentToken) {
                    headers["Authorization"] = `Bearer ${currentToken}`
                }
                console.log("请求头部:", { deviceId, hasToken: !!currentToken })
                return { headers }
            },
        })

        console.log("[GraphQLProvider] Client 已初始化")
        setClientState({ client: newClient, ssr: ssrInstance })
    }, [print, clientState.client])

    useEffect(() => {
        const handleRefreshCache = () => {
            pendingMetadataBeforeRefresh = []
        }
        window.addEventListener("urql:refresh-cache", handleRefreshCache)
        return () => {
            window.removeEventListener("urql:refresh-cache", handleRefreshCache)
        }
    }, [])

    useEffect(() => {
        const handleOfflineLogin = (event: CustomEvent) => {
            console.log("[GraphQLProvider] 检测到离线登录，强制更新token ref")
            const { accessToken: newAccessToken } = event.detail
            if (newAccessToken) {
                currentTokenRef.current = newAccessToken
                console.log("[GraphQLProvider] Token ref已更新")
            }
        }

        const handleTokenRefreshed = (event: CustomEvent) => {
            console.log("[GraphQLProvider] 检测到token刷新，更新token ref和localStorage")
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: newUser } = event.detail
            if (newAccessToken) {
                currentTokenRef.current = newAccessToken
                console.log("[GraphQLProvider] Token ref已从token:refreshed事件更新")

                if (typeof window !== "undefined") {
                    try {
                        const offlineAuth = localStorage.getItem("offline_auth")
                        if (offlineAuth) {
                            const authData = JSON.parse(offlineAuth)
                            authData.accessToken = newAccessToken
                            if (newUser) {
                                authData.user = newUser
                            }
                            authData.expiresAt = Date.now() + 60 * 60 * 1000
                            localStorage.setItem("offline_auth", JSON.stringify(authData))
                            console.log("[GraphQLProvider] localStorage已同步更新新token (不含refreshToken)")
                        }
                    } catch (error) {
                        console.error("[GraphQLProvider] 更新localStorage失败:", error)
                    }
                }
            }
        }

        const handleLogout = () => {
            console.log("[GraphQLProvider] 检测到注销事件，清空token ref")
            currentTokenRef.current = null
            console.log("[GraphQLProvider] Token ref已清空")
        }

        const handleTokenRefreshTimeoutReload = (event: CustomEvent) => {
            console.log("[GraphQLProvider] 检测到token刷新超时，显示提示信息")
            toast.error("认证状态需要刷新", {
                description: event.detail?.message || "页面将在3秒后自动刷新以恢复认证状态",
                duration: 3000,
            })
        }

        window.addEventListener("offline:login", handleOfflineLogin as EventListener)
        window.addEventListener("token:refreshed", handleTokenRefreshed as EventListener)
        window.addEventListener("auth:logout", handleLogout)
        window.addEventListener("user:logout", handleLogout)
        window.addEventListener("token:refresh-timeout-reload", handleTokenRefreshTimeoutReload as EventListener)

        return () => {
            window.removeEventListener("offline:login", handleOfflineLogin as EventListener)
            window.removeEventListener("token:refreshed", handleTokenRefreshed as EventListener)
            window.removeEventListener("auth:logout", handleLogout)
            window.removeEventListener("user:logout", handleLogout)
            window.removeEventListener("token:refresh-timeout-reload", handleTokenRefreshTimeoutReload as EventListener)
        }
    }, [])

    useEffect(() => {
        const handleManualTokenRefresh = async () => {
            if (clientState.client) {
                try {
                    //发送一个测试查询来触发认证流程
                    await clientState.client.query(AuthCompQuery, { }, {requestPolicy: 'network-only'}).toPromise();
                } catch (error) {
                    console.log("[GraphQLProvider] 手动刷新触发完成");
                }
            }
        };
        const handleTokenRefreshNeeded = () => {
            handleManualTokenRefresh();
        };
        window.addEventListener("token:refresh-needed", handleTokenRefreshNeeded);
        return () => {
            window.removeEventListener("token:refresh-needed", handleTokenRefreshNeeded);
        };
    }, [clientState.client]);

    // 在 SSR 期间或客户端初始化之前显示加载状态
    if (!clientState.client || !clientState.ssr) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen gap-4">
                <div className="p-4 text-sm text-muted-foreground">正在初始化GraphQL客户端...</div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={() => window.location.reload()}
                >
                    刷新页面
                </button>
            </div>
        )
    }

    return (
        <UrqlProvider client={clientState.client} ssr={clientState.ssr}>
            {children}
            {pathname !== "/login" && ConfirmDialog}
        </UrqlProvider>
    )
}
