"use client"

import { fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { ssrExchange as ssrExchangeNext } from "@urql/next"
import { useAccessToken } from "./use-access-token"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useMemo, useRef, useCallback, useEffect, useState } from "react"
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import schema from "./urql-schema.json"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { toast } from "sonner"
import type { CombinedError, Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, map } from "wonka"
import { usePathname, useSearchParams } from "next/navigation"
import { useNetworkStatusActions } from "@/contexts/network-status-context"
import { useVersionConflictManager } from "@/hooks/use-version-conflict-manager"
import { mutationCompensationStorage } from "@/lib/mutation-compensation-storage"
import { manualRetryExchange } from "@/lib/manual-retry-exchange"
import { preventDuplicateExchange } from "@/lib/prevent-duplicate-exchange"
import { setCookie, getCookie, deleteCookie } from "cookies-next/client"
import { acquireRefreshLock, isTokenRefreshing as checkTokenRefreshing } from "@/lib/token-refresh-lock"

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
// 获取设备ID的辅助函数
const getDeviceId = (): string => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("clientId") || ""
}
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
                const timeoutId = setTimeout(() => controller.abort(), 180 * 1000) //180秒查询或变更超时
                const deviceId = getDeviceId()
                const existingHeaders = operation.context.fetchOptions?.headers || {}
                return {
                    ...operation,
                    context: {
                        ...operation.context,
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

//Nextjs服务器离线的：直接刷新token直接post原生做法发送请求包了, 修改 refreshTokenDirectly 函数，从cookie读取
const refreshTokenDirectly = async (): Promise<{ accessToken: string; refreshToken: string,user:any } | null> => {
    try {
        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        if (!endpoint) throw new Error("Backend endpoint not configured")
        // refreshToken = getStoredRefreshToken() // Use the enhanced getter
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
        //浏览器直连模式：不传参数，依赖cookie 没有经过URQL直接发送
        const response = await fetch(`${endpoint}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
            },
            credentials: "include", // 重要：包含cookie
            body: JSON.stringify(requestBody),
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

        const newTokens = {
            accessToken: result.data.refreshToken.accessToken,
            refreshToken: result.data.refreshToken.refreshToken,
            user: result.data.user,
        }
        console.log("[v0] refreshTokenDirectly: Saved new refresh_token to cookie")
        return newTokens
    } catch (error) {
        console.error("Direct token refresh failed:", error)
        return null
    }
}

//在刷新accessToken之前简易地判定网络状态。
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

// **CHANGE**: Remove global isTokenRefreshing flag, use the lock module instead
let pendingMetadataBeforeRefresh: SerializedRequest[] = []

//创建认证交换器
const makeAuthExchange = (
    getCurrentToken: () => string | null,
    updateSession?: (data: any) => Promise<any>,
    print?: boolean,
) => {
    return authExchange(async (utils) => {
        return {
            addAuthToOperation(operation) {
                const currentToken = getCurrentToken() // 动态获取最新 token
                const deviceId = getDeviceId()
                const headers: Record<string, string> = {}
                if (deviceId) {
                    headers["X-Device-Id"] = deviceId
                }
                if (!currentToken) {
                    return utils.appendHeaders(operation, headers)
                }
                return utils.appendHeaders(operation, {
                    ...headers,
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

                if (finalResult) {
                    console.log("[AuthExchange] 检测到认证错误")
                }

                return finalResult
            },
            async refreshAuth() {
                const result = await acquireRefreshLock(async () => {
                    try {
                        const connectivity = print ? undefined : await checkNetworkConnectivity()
                        let tokenData: {user: any; accessToken: string; refreshToken: string } | null = null
                        let fromNextjs=true;    //来自nextjs服务器的token更新流程的应答
                        if (print || (connectivity && connectivity.nextjsReachable)) {
                            console.log("[AuthExchange] 通过NextJS API刷新token")
                            const response = await fetch("/api/refresh-token", {
                                method: "POST",
                                credentials: "include",
                            })
                            if (response.ok) {
                                const data = await response.json()
                                if (data.success) {
                                    tokenData = {
                                        accessToken: data.accessToken,
                                        refreshToken: data.refreshToken,
                                        user: data.user,
                                    }
                                    console.log("[v0] refreshAuth (NextJS): Saved new refresh_token to cookie")
                                }
                            }
                        } else if (
                            !print &&
                            connectivity &&
                            !connectivity.nextjsReachable &&
                            connectivity.javaBackendReachable
                        ) {
                            console.log("[AuthExchange] 离线模式直接刷新token")
                            tokenData = await refreshTokenDirectly()
                            if(tokenData)   fromNextjs=false;
                        }
                        else{
                            if (!print && (!connectivity || !connectivity.nextjsReachable)) {
                                throw new Error("没有refresh token且NextJS不可达，直接跳转登录页")
                            }
                        }
                        if (!tokenData) {
                            pendingMetadataBeforeRefresh = []
                            toast.error("登录已过期", {
                                description: "请重新登录，点导航登录",
                                duration: 60*60*1000,
                            })
                            return tokenData;
                        }
                        // 清除Service Worker缓存
                        await clearServiceWorkerAuthCache()
                        if (typeof window !== "undefined") {
                            console.log("[AuthExchange] 触发token:refreshed事件")
                            window.dispatchEvent(
                                new CustomEvent("token:refreshed", {
                                    detail: {
                                        accessToken: tokenData.accessToken,
                                        refreshToken: tokenData.refreshToken,
                                        fromNextjs,     //判定nextjs离线与否
                                        user: tokenData.user,
                                    },
                                }),
                            )
                        }

                        setTimeout(async () => {
                            if (pendingMetadataBeforeRefresh.length > 0) {
                                console.log("[AuthExchange] Token刷新完成，恢复pending metadata:", pendingMetadataBeforeRefresh.length)
                                // Restore metadata to compensation storage
                                for (const request of pendingMetadataBeforeRefresh) {
                                    await backupMutationToCompensation(request)
                                }
                                // Trigger retry
                                window.dispatchEvent(
                                    new CustomEvent("graphql-manual-retry", {
                                        detail: { retryAll: true },
                                    }),
                                )
                                pendingMetadataBeforeRefresh = []
                            }
                        }, 500)
                        toast.warning("会话自动续期，若报告修改需刷新", {
                            duration: 20 * 1000,
                        })
                        return tokenData
                    } catch (error) {
                        console.error("Token 刷新失败:", error)
                        pendingMetadataBeforeRefresh = []
                        toast.error("登录已过期", {
                            description: "请重新登录，点导航登录",
                            duration: 60*60*1000,
                        })
                    }
                })
                return
            },
        }
    })
}

const shouldQueueOnErr = (error: any): boolean => {
    if (!error) return false
    // Network errors should be treated as offline
    if (isNetworkError(error)) return true
    // 401 errors should be queued for retry after authentication
    const has401Error = error.response?.status === 401 || error.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401
    // Version conflicts should NOT be queued (permanent failures)
    if (isVersionConflictError(error)) return false
    return has401Error
}
// 网络状态感知的离线交换器
const createNetworkAwareOfflineExchange = (storage: any) => {
    return offlineExchange({
        schema,
        keys: {
            RepLink: () => null,
        },
        isOfflineError: (error: undefined | CombinedError, result: OperationResult) => {
            const shouldQueue = shouldQueueOnErr(error)
            if (shouldQueue && result.operation.kind === "mutation") {
                const operationKey = generateOperationKey(result.operation)
                console.log(
                    "[offlineExchange] 将mutation加入离线队列:",
                    result.operation.query.definitions[0]?.name?.value,
                    "key:",
                    operationKey,
                    "error:",
                    error?.message,
                )
            }
            return shouldQueue
        },
        storage: {
            ...storage,
            // 修改 writeMetadata 方法，添加网络状态检查
            writeMetadata: async (json: SerializedRequest[]) => {
                console.log("[GraphQLProvider] writeMetadata被调用，数据长度:", json?.length || 0)

                const isRefreshing = checkTokenRefreshing()
                if (isRefreshing && json?.length === 0 && pendingMetadataBeforeRefresh.length === 0) {
                    // Read current metadata before it gets cleared
                    const currentMetadata = (await storage.readMetadata?.()) || []
                    if (currentMetadata.length > 0) {
                        pendingMetadataBeforeRefresh = currentMetadata
                        console.log("[GraphQLProvider] Token刷新期间保存metadata，长度:", pendingMetadataBeforeRefresh.length)
                        // Don't clear metadata during token refresh
                        return
                    }
                }

                // 检查是否是恢复操作触发的清空
                const isRestoreOperation = localStorage.getItem("isRestoringMetadata") === "true"

                if (isRestoreOperation && json?.length === 0) {
                    console.log("[GraphQLProvider] 检测到恢复操作期间的清空请求，跳过清空")
                    localStorage.removeItem("isRestoringMetadata")
                    return // 跳过清空操作
                }

                if (json?.length !== 0) {
                    const uniqueRequests: SerializedRequest[] = []
                    const seen = new Map<string, SerializedRequest>()

                    for (let i = json.length - 1; i >= 0; i--) {
                        const request = json[i]
                        const key = generateRequestKey(request)
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
                    // 只有非恢复操作且非token刷新时才允许清空
                    if (!isRestoreOperation && !isRefreshing) {
                        await storage.writeMetadata!(json)
                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                "urql-metadata",
                                JSON.stringify({ length: 0, timestamp: new Date().toLocaleString() }),
                            )
                        }
                        console.log("[offlineExchange] writeMetadata写:", 0, "items")
                    } else {
                        console.log("[GraphQLProvider] Token刷新或恢复操作期间跳过metadata清空")
                    }
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
}

// 生成请求的唯一标识
function generateRequestKey(request: SerializedRequest): string {
    const { query, variables } = request
    if (variables?.id) {
        // 针对 modifyOriginalRecordData 使用特殊标识
        if (typeof query === "string" && query.includes("mutation useOriginalDataMutation")) {
            return `modify_${variables.id}_${variables.version || "0"}`
        }
        return `${query}-${variables.id}-${variables?.opType || ""}`
    }
    return `${query}-${JSON.stringify(variables || {})}`
}

// 生成操作唯一标识（用于防重复）
function generateOperationKey(operation: Operation): string {
    const { query, variables } = operation
    const queryString = typeof query === "string" ? query : query.loc?.source.body || ""

    if (queryString.includes("mutation useOriginalDataMutation") && variables?.id) {
        return `modify_${variables.id}_${variables.version || "0"}`
    }

    return `${queryString}_${JSON.stringify(variables || {})}`
}

//避免变更保存按钮的无限等待。变更完成后移除补偿存储。
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
                    const error = result.error
                    let offlineError = false,
                        authError = false
                    if (isNetworkError(error)) offlineError = true
                    if (error?.response?.status === 401 || error?.graphQLErrors?.[0]?.extensions?.httpStatusCode === 401)
                        authError = true
                    if (isVersionConflictError(error)) offlineError = false
                    // 检测Java后端宕机错误 isJavaBackendDownError
                    if (result.error && (offlineError || authError)) {
                        //触发自定义事件通知页面, 对于mutation操作，可以设置一个超时来"强制完成"操作
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
    // const { update } = useSession()
    const { updateGraphQLBackendStatus } = useNetworkStatusActions()
    const [isClient, setIsClient] = useState(false)
    const { addConflictRequest } = useVersionConflictManager()
    const currentTokenRef = useRef<string | null>(null)
    useEffect(() => {
        setIsClient(true)
    }, [])
    useEffect(() => {
        currentTokenRef.current = accessToken
    }, [accessToken])
    const clientRef = useRef<any>(null)
    const ssrRef = useRef<any>(null)

    const createClientStable = useCallback(() => {
        if (!isClient) {
            return [null, null]
        }
        // 获取最新 token 的函数
        const getCurrentToken = () => currentTokenRef.current
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

        const cache = createNetworkAwareOfflineExchange(storage)
        const ssr = ssrExchangeNext({
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
                            // 确保toast在下一个事件循环中显示，避免被其他逻辑阻塞
                            setTimeout(() => {
                                // 显示详细的版本冲突toast提示
                                toast.error("数据版本冲突", {
                                    description: (
                                        <div className="space-y-2">
                                            <p className="font-medium text-red-700">{errorMessage}</p>
                                            <p className="text-sm text-gray-600">记录ID: {invalidId}</p>
                                            <p className="text-sm text-gray-500">
                                                该记录已被其他设备或用户修改，请刷新页面获取最新数据后重新操作。
                                            </p>
                                            <p className="text-sm text-blue-600">冲突请求已从离线队列中移除，并保存到版本冲突列表中。</p>
                                        </div>
                                    ),
                                    duration: 24 * 60 * 60 * 1000, // 24小时
                                    action: {
                                        label: "刷新页面",
                                        onClick: () => window.location.reload(),
                                    },
                                })
                            }, 50)
                            // 添加到版本冲突管理器
                            addConflictRequest(operation, error)
                            if (operation.kind === "mutation") {
                                const request: SerializedRequest = {
                                    query: operation.query.loc?.source?.body || "",
                                    variables: operation.variables,
                                    extensions: operation.extensions,
                                }
                                removeCompensationBackup(request)
                                console.log("[CompensationBackup] Mutation版本冲突，清理补偿")
                            }
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
                cache, //放在第二位来处理，处理后端应答放在倒数第二位。
                preventDuplicateExchange,
                manualRetryExchange,
                makeAuthExchange(getCurrentToken, undefined, print),
                updateBackendStatusExchange(updateGraphQLBackendStatus, storage),
                ssr,
                fetchAbortExchange,
                customFetchExchange,
                fetchExchange,
            ],
            suspense: true,
            preferGetMethod: false,
            fetchOptions: () => {
                const currentToken =getCurrentToken()
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
        clientRef.current = client
        ssrRef.current = ssr
        return [client, ssr]
    }, [isClient, updateGraphQLBackendStatus, print])

    const [client, ssr] = useMemo(() => {
        if (!isClient) return [null, null]
        // 只在首次挂载或 isClient 变化时创建客户端
        if (clientRef.current) {
            return [clientRef.current, ssrRef.current]
        }
        const result = createClientStable()
        return result
    }, [isClient, createClientStable])

    useEffect(() => {
        const handleRefreshCache = () => {
            // **CHANGE**: Clear pending metadata on manual cache refresh
            pendingMetadataBeforeRefresh = []
        }
        window.addEventListener("urql:refresh-cache", handleRefreshCache)
        return () => {
            window.removeEventListener("urql:refresh-cache", handleRefreshCache)
        }
    }, [])

    if (!client) {
        return <div className="p-4 text-sm text-muted-foreground">正在初始化GraphQL客户端...</div>
    }

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
            {pathname !== "/login" && ConfirmDialog}
        </UrqlProvider>
    )
}

const backupMutationToCompensation = async (request: SerializedRequest) => {
    try {
        await mutationCompensationStorage.backupMutation(request.query, request.variables, request.extensions)
    } catch (error) {
        console.error("[CompensationBackup] 备份mutation失败:", error)
    }
}

const removeCompensationBackup = async (request: SerializedRequest) => {
    try {
        await mutationCompensationStorage.removeBackup(request.query, request.variables)
    } catch (error) {
        console.error("[CompensationBackup] 清理备份失败:", error)
    }
}
