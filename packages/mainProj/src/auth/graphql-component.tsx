// graphql-component.tsx
"use client"

import { ssrExchange, fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { useAccessToken } from "./use-access-token"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useMemo, useRef, useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import schema from "./urql-schema.json"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { toast } from "sonner"
import type { CombinedError, Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, map } from "wonka"
import { usePathname, useSearchParams } from "next/navigation"
import { useNetworkStatusActions } from "@/contexts/network-status-context"
import { MetadataWriteConfirmationModal } from "@/components/metadata-write-confirmation-modal"
import { mutationCompensationStorage } from "@/lib/mutation-compensation-storage"
import { manualRetryExchange } from "@/lib/manual-retry-exchange" // 新增导入

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

//网络状态更新：
const updateBackendStatusExchange = (
    updateGraphQLBackendStatus: (isReachable: boolean, isClientOnline?: boolean) => void,
    storage: any,
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
                                updateGraphQLBackendStatus(false, false)
                            }
                            if (result.error.isImmediateError) {
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
                                updateGraphQLBackendStatus(true, true)
                                errorCount = 0
                            }
                        }
                    } else if (result.data) {
                        updateGraphQLBackendStatus(true, true)
                        errorCount = 0
                    }
                    return result
                }),
            )
        }
    }
}

// 自定义 fetch exchange 来更好地处理网络错误
const customFetchExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            map((operation: Operation) => {
                // 为每个操作添加超时和错误处理
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 120 * 1000) //120秒超时查询或变更
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
                // 清理超时
                if (result.operation.context.fetchOptions?.signal) {
                    clearTimeout(result.operation.context.fetchOptions.timeoutId)
                }
                const app401 = result.error?.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401 //应用层抛出401错误码
                if (result.error?.response?.status === 401 || app401) {
                    console.log("检测到401错误，token无效，准备触发刷新流程,app401=", app401)
                    // 确保错误对象包含足够的信息供 authExchange 识别
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

//直接post原生做法发送请求包了
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
        //简易方式做检查Java后端
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

//清理PWA的/api/auth/session的缓存；
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
                        resolve()
                    } else {
                        console.error("Service Worker缓存清除失败:", event.data.error)
                        reject(new Error(event.data.error))
                    }
                }
                registration.active!.postMessage({ type: "CLEAR_AUTH_CACHE" }, [messageChannel.port2])
            })
        }
    } catch (error) {
        console.error("清除Service Worker缓存失败:", error)
    }
}

//创建认证交换器
const makeAuthExchange = (accessToken: string | null, updateSession?: (data: any) => Promise<any>, print?: boolean) => {
    return authExchange(async (utils) => {
        return {
            addAuthToOperation(operation) {
                const currentToken = accessToken
                if (!currentToken) {
                    const refreshToken = getStoredRefreshToken()
                    if (refreshToken) {
                        console.log("使用refreshToken作为认证fallback")
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
                return finalResult
            },
            async refreshAuth() {
                try {
                    const connectivity = print ? undefined : await checkNetworkConnectivity()
                    const refreshToken = getStoredRefreshToken()
                    if (!refreshToken && !print && (!connectivity || !connectivity.nextjsReachable)) {
                        console.warn("没有refresh token且NextJS不可达，直接跳转登录页")
                        throw new Error("没有refresh token且NextJS不可达，直接跳转登录页")
                    }
                    if (print || (connectivity && connectivity.nextjsReachable)) {
                        const response = await fetch("/api/refresh-token", {
                            method: "POST",
                            credentials: "include",
                        })
                        if (response.ok) {
                            const data = await response.json()
                            if (data.success) {
                                await clearServiceWorkerAuthCache()
                                if (updateSession) {
                                    try {
                                        await updateSession({
                                            accessToken: data.accessToken,
                                            refreshToken: data.refreshToken,
                                        })
                                        await new Promise((resolve) => setTimeout(resolve, 100))
                                    } catch (error) {
                                        console.error("更新session失败:", error)
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
                        const result = await refreshTokenDirectly(refreshToken)
                        if (result) {
                            // 更新存储的refreshToken
                            setStoredRefreshToken(result.refreshToken)
                            await clearServiceWorkerAuthCache()
                            if (updateSession) {
                                try {
                                    await updateSession({
                                        accessToken: result.accessToken,
                                        refreshToken: result.refreshToken,
                                    })
                                    await new Promise((resolve) => setTimeout(resolve, 100))
                                } catch (error) {
                                    console.error("离线模式更新session失败:", error)
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
                    toast.error("务必重新登录！", {
                        duration: 30 * 1000,
                    })
                } catch (error) {
                    console.error("Token 刷新失败:", error)
                    setStoredRefreshToken(null)
                    toast.error("登录已过期", {
                        description: "请重新登录",
                        duration: 5000,
                    })
                    setTimeout(() => {
                        if (typeof window !== "undefined") {
                            const protocol = window.location.protocol === "https:" ? "https:" : "http:"
                            const host = window.location.host
                            console.error("Token刷新失败，立即跳转login")
                            window.location.href = `${protocol}//${host}/login`
                        }
                    }, 1000) // 减少到1秒，更快响应
                }
            },
        }
    })
}

const isOfflineError = (error: any): boolean => {
    if (!error) return false
    // Network errors should be treated as offline
    if (isNetworkError(error)) return true
    // 401 errors should be queued for retry after authentication
    const has401Error = error.response?.status === 401 || error.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401
    // Version conflicts should NOT be queued (permanent failures)
    if (isVersionConflictError(error)) return false
    return has401Error
}

//避免变更保存按钮的无限等待。
const fetchAbortExchange: Exchange =
    ({ forward, client }) =>
        (ops$) => {
            return pipe(
                ops$,
                tap((op) => {}),
                forward,
                tap((result) => {
                    if (result.operation.kind === "mutation" && !result.error && result.data) {
                        const request: SerializedRequest = {
                            query: result.operation.query.loc?.source?.body || "",
                            variables: result.operation.variables,
                            extensions: result.operation.extensions,
                        }
                        removeCompensationBackup(request)
                        console.log("[CompensationBackup] Mutation成功，已清理备份")
                    }

                    // 检测Java后端宕机错误 isJavaBackendDownError
                    if (result.error && isOfflineError(result.error)) {
                        //触发自定义事件通知页面, 对于mutation操作，可以设置一个超时来"强制完成"操作
                        if (result.operation.kind === "mutation") {
                            const operationName = result.operation.query?.definitions[0]?.name.value
                            if (operationName) {
                                toast.success("离线或未登录", {
                                    duration: 2 * 1000,
                                })
                                setTimeout(() => {
                                    if (typeof window !== "undefined") {
                                        window.dispatchEvent(
                                            new CustomEvent("mutation-completed", {
                                                detail: {
                                                    operation: operationName,
                                                    variables: {
                                                        id: result.operation.variables.id, //失败的操作匹配性
                                                    },
                                                    error: result.error,
                                                    hasError: true,
                                                },
                                            }),
                                        )
                                    }
                                }, 100) // 短暂延迟确保事件监听器已设置
                            }
                        }
                    }
                }),
            )
        }

//严谨："操作数据记录已在其它设备或其他人改动？这个请求失败以后就不会再被离线缓冲收进到metadata列表的。
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

/**
 * 点击Link切换不同的报告，后端恢复能自动发出缓存的报告变更队列,【可能】操作数据记录已在其它设备或其他人改动？只能从graphqlCache缓存找回来?metadata已经被丢弃。
 * 业务上没法按照ACID事务性锁定，乐观锁version机制能用于PWA离线修改报告的做法，很容易遇到考虑数据版本的冲突：
 * 假如流程引擎修改导致的version变动，后端转Pdf就是这个情况，后端网页转为Pdf完成，导致version改了：假如还在改这报告面临无法提交！因version被后台变更导致无法成功提交修改；最好必须等待网页转为Pdf后台已处理完才能继续刷新报告再修改。
 */
export function GraphQLProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const print = "1" === searchParams!.get("print") //进入页面是打印目的的
    const { accessToken, ConfirmDialog } = useAccessToken()
    const { update } = useSession()
    const { updateGraphQLBackendStatus } = useNetworkStatusActions()
    const [isClient, setIsClient] = useState(false)
    const [isWriteModalOpen, ] = useState(false)
    const handleWriteConfirm = useCallback(() => {
        console.log("[GraphQLProvider] 用户确认了metadata写入操作")
    }, [])

    const handleWriteCancel = useCallback(() => {
        console.log("[GraphQLProvider] 用户取消了metadata写入操作")
    }, [])

    useEffect(() => {
        setIsClient(true)
    }, [])

    const instanceIdRef = useRef(Math.random().toString(36).slice(2, 11))
    const mountCountRef = useRef(0)

    useEffect(() => {
        mountCountRef.current++
        console.log(`[v0] GraphQLProvider mounted - 实例ID: ${instanceIdRef.current}, 挂载次数: ${mountCountRef.current}`)

        return () => {
            console.log(`[v0] GraphQLProvider unmounted - 实例ID: ${instanceIdRef.current}`)
        }
    }, [])

    const clientRef = useRef<any>(null)
    const ssrRef = useRef<any>(null)
    const lastTokenRef = useRef<string | null>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true
        }
        return () => {}
    }, [])

    useEffect(() => {
        if (lastTokenRef.current !== accessToken) {
            console.log(`[v0] 复用现有客户端 - 实例ID: ${instanceIdRef.current}`)
            lastTokenRef.current = accessToken
        }
    }, [accessToken])

    const createClientStable = useCallback(() => {
        if (!isClient) {
            return [null, null]
        }
        if (lastTokenRef.current === accessToken && clientRef.current) {
            return [clientRef.current, ssrRef.current]
        }
        lastTokenRef.current = accessToken
        let storage
        if (typeof window !== "undefined") {
            const defaultStorage = makeDefaultStorage({
                idbName: "graphcache-sei",
                maxAge: 7,
            })
            storage = {
                ...defaultStorage,
            }
        } else {
            storage = {
                writeData: (data: any) => Promise.resolve(),
                readData: () => Promise.resolve(null),
                writeMetadata: (data: any) => Promise.resolve(),
                readMetadata: () => Promise.resolve(null),
            }
        }

        const cache = offlineExchange({
            schema,
            keys: {
                RepLink: () => null,
            },
            isOfflineError: (error: undefined | CombinedError, result: OperationResult) => {
                const shouldQueue = isOfflineError(error)
                if (shouldQueue && result.operation.kind === "mutation") {
                    console.log(
                        "[offlineExchange] 将mutation加入离线队列:",
                        result.operation.query.definitions[0]?.name?.value,
                        "error:",
                        error?.message,
                    )
                }
                return shouldQueue
            },
            storage: {
                ...storage,
                writeMetadata: async (json: SerializedRequest[]) => {
                    console.log("[GraphQLProvider] writeMetadata被调用，数据长度:", json?.length || 0)
                    if (json?.length !== 0) {
                        const uniqueRequests: SerializedRequest[] = []
                        const seen = new Map<string, SerializedRequest>()

                        for (let i = json.length - 1; i >= 0; i--) {
                            const request = json[i]
                            const key = request.variables?.id
                                ? `${request.query}-${request.variables.id}-${request.variables?.opType || ""}`
                                : `${request.query}-${JSON.stringify(request.variables || {})}`
                            if (!seen.has(key)) {
                                seen.set(key, request)
                                uniqueRequests.unshift(request)
                            }
                        }

                        const filteredRequests = uniqueRequests.filter((request) => {
                            if (request.variables?.id && request.query.includes("mutation")) {
                                return true
                            }
                            return true
                        })

                        await storage.writeMetadata!(filteredRequests)

                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                "urql-metadata",
                                JSON.stringify({
                                    length: filteredRequests.length,
                                    timestamp: new Date().toLocaleString(),
                                }),
                            )
                        }
                        console.log("[CompensationBackup] 开始备份mutations到补偿存储,长度", filteredRequests.length)
                        for (const request of filteredRequests) {
                            await backupMutationToCompensation(request)
                        }
                    } else {
                        await storage.writeMetadata!(json)
                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                "urql-metadata",
                                JSON.stringify({ length: 0, timestamp: new Date().toLocaleString() }),
                            )
                        }
                        console.log("[offlineExchange] writeMetadata写:", 0, "items")
                    }
                },
            } as any,
            resolverExchange: false,
            optimistic: {
                modifyOriginalRecordData(args, cache, info) {
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
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                errorExchange({
                    onError: (error, operation) => {
                        if (isVersionConflictError(error)) {
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
                                duration: 4 * 60 * 60 * 1000,
                                action: {
                                    label: "刷新页面",
                                    onClick: () => window.location.reload(),
                                },
                            })
                            return
                        }

                        const has401Error =
                            error.response?.status === 401 || error.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401
                        if (has401Error && operation.kind === "mutation") {
                            console.log("[errorExchange] 检测到401错误的mutation，已加入离线队列等待重试")
                            toast.warning("认证失效，数据变更已保存到离线队列", {
                                description: "登录后将自动重新提交保存的数据变更",
                                duration: 10000,
                            })
                        }
                    },
                }),
                cache,
                manualRetryExchange, // 新增手动重试 exchange
                makeAuthExchange(accessToken, update, print),
                updateBackendStatusExchange(updateGraphQLBackendStatus, storage),
                ssr,
                fetchAbortExchange,
                customFetchExchange,
                fetchExchange,
            ],
            suspense: true,
            preferGetMethod: false,
            fetchOptions: () => {
                const currentToken = accessToken
                console.warn("费用authorization Bearer:", currentToken)
                return {
                    headers: {
                        authorization: currentToken ? `Bearer ${currentToken}` : "",
                    },
                }
            },
        })
        clientRef.current = client
        ssrRef.current = ssr
        return [client, ssr]
    }, [accessToken, isClient, update, updateGraphQLBackendStatus])

    const memoizedClientRef = useRef<[any, any] | null>(null)
    const lastAccessTokenRef = useRef(accessToken)
    const [client, ssr] = useMemo(() => {
        if (!isClient) {
            return [null, null]
        }
        if (lastAccessTokenRef.current === accessToken && memoizedClientRef.current) {
            return memoizedClientRef.current
        }
        lastAccessTokenRef.current = accessToken
        const result = createClientStable()
        memoizedClientRef.current = result
        return result
    }, [accessToken, createClientStable, isClient])

    useEffect(() => {
        const handleMetadataRestored = (event: CustomEvent) => {
            console.log(`[GraphQLProvider] Metadata已恢复: ${event.detail.count} 项`)
        }
        const handleRefreshCache = () => {
            console.log("[GraphQLProvider] 收到刷新缓存事件，重新创建客户端")
            // 这里可以强制重新创建客户端
            clientRef.current = null
            lastTokenRef.current = null
        }
        window.addEventListener("urql:metadata-restored", handleMetadataRestored as EventListener)
        window.addEventListener('urql:refresh-cache', handleRefreshCache)
        return () => {
            window.removeEventListener("urql:metadata-restored", handleMetadataRestored as EventListener)
            window.removeEventListener('urql:refresh-cache', handleRefreshCache)
        }
    }, [])

    if (!client) {
        return <div className="p-4 text-sm text-muted-foreground">正在初始化GraphQL客户端...</div>
    }

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
            {pathname !== "/login" && ConfirmDialog}
            <MetadataWriteConfirmationModal
                isOpen={isWriteModalOpen}
                onConfirm={handleWriteConfirm}
                onCancel={handleWriteCancel}
                queueCount={0}
            />
        </UrqlProvider>
    )
}

const backupMutationToCompensation = async (request: SerializedRequest) => {
    try {
        await mutationCompensationStorage.backupMutation(request.query, request.variables, request.extensions);
    } catch (error) {
        console.error("[CompensationBackup] 备份mutation失败:", error);
    }
};

const removeCompensationBackup = async (request: SerializedRequest) => {
    try {
        await mutationCompensationStorage.removeBackup(request.query, request.variables);
    } catch (error) {
        console.error("[CompensationBackup] 清理备份失败:", error);
    }
};