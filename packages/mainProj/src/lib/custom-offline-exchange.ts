import { pipe, share, merge, makeSubject, filter, onPush } from "wonka"
import type { Operation, OperationResult, Exchange, ExchangeIO, CombinedError, RequestPolicy } from "@urql/core"
import { stringifyDocument, createRequest, makeOperation } from "@urql/core"
import type { SerializedRequest, CacheExchangeOpts, StorageAdapter } from "@urql/exchange-graphcache"
import { cacheExchange } from "@urql/exchange-graphcache"

const toRequestPolicy = (operation: Operation, policy: RequestPolicy): Operation => {
    return makeOperation(operation.kind, operation, {
        ...operation.context,
        requestPolicy: policy,
    })
}

const policyLevel = {
    "cache-only": 0,
    "cache-first": 1,
    "network-only": 2,
    "cache-and-network": 3,
} as const

/** 自定义离线交换器配置选项 */
export interface CustomOfflineExchangeOpts extends CacheExchangeOpts {
    /** 离线存储适配器 */
    storage: StorageAdapter
    /** 判断是否为离线错误的函数 */
    isOfflineError?(error: undefined | CombinedError, result: OperationResult): boolean
    /** 页面启动时间窗口（毫秒） */
    startupTimeWindow?: number
    /** 后端恢复时间窗口（毫秒） */
    recoveryTimeWindow?: number
}

/**用默认的没法满足要求，只好自己来定做：离线交换器工厂函数
 *【变更点】避免了请求没有成功发送但却丢失Metadata请求的情况，通过先读取现有Metadata、发送请求、收到成功响应后再删除的方式，确保了离线请求的可靠性。
 *取代原本的 import { offlineExchange } from "@urql/exchange-graphcache" 默认工厂。
 *实际是模仿替代了"@urql/exchange-graphcache" : "7.2.2",包的里面的src/offlineExchange.ts。
 * */
export const customOfflineExchange =
    <C extends CustomOfflineExchangeOpts>(opts: C): Exchange =>
        (input) => {
            const { storage } = opts
            const startupTimeWindow = opts.startupTimeWindow || 30000 // 30秒
            const recoveryTimeWindow = opts.recoveryTimeWindow || 30000 // 30秒

            const isOfflineError =
                opts.isOfflineError ||
                ((error: undefined | CombinedError) =>
                    error &&
                    error.networkError &&
                    !error.response &&
                    ((typeof navigator !== "undefined" && navigator.onLine === false) ||
                        /request failed|failed to fetch|network\s?error/i.test(error.networkError.message)))

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

            if (storage && storage.onOnline && storage.readMetadata && storage.writeMetadata) {
                const { forward: outerForward, client, dispatchDebug } = input
                const { source: reboundOps$, next } = makeSubject<Operation>()

                const pendingRequests = new Map<string, SerializedRequest>()
                const processingRequests = new Set<string>()
                let hasRehydrated = false
                let isFlushingQueue = false
                const pageStartTime = Date.now()
                let lastBackendRecoveryTime: number | null = null

                const getRequestId = (request: SerializedRequest): string => {
                    return `${request.query}_${JSON.stringify(request.variables || {})}_${JSON.stringify(request.extensions || {})}`
                }

                const isInCriticalTimeWindow = (): boolean => {
                    const now = Date.now()
                    const withinStartupWindow = now - pageStartTime <= startupTimeWindow
                    const withinRecoveryWindow = lastBackendRecoveryTime && now - lastBackendRecoveryTime <= recoveryTimeWindow
                    return withinStartupWindow || !!withinRecoveryWindow
                }

                const triggerEmptyArrayReminder = () => {
                    if (isInCriticalTimeWindow()) {
                        // 触发自定义事件通知组件显示提醒
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(
                                new CustomEvent("graphql-empty-array-reminder", {
                                    detail: { show: true },
                                }),
                            )
                        }
                    }
                }

                const hideEmptyArrayReminder = () => {
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(
                            new CustomEvent("graphql-empty-array-reminder", {
                                detail: { show: false },
                            }),
                        )
                    }
                }

                const updateMetadata = async () => {
                    if (hasRehydrated) {
                        const requests = Array.from(pendingRequests.values())

                        // 如果请求列表为空且在关键时间窗口内，触发提醒
                        if (requests.length === 0 && isInCriticalTimeWindow()) {
                            triggerEmptyArrayReminder()
                        }

                        await storage.writeMetadata!(requests)
                    }
                }

                const addPendingRequest = async (operation: Operation) => {
                    if (operation.kind === "mutation") {
                        const request: SerializedRequest = {
                            query: stringifyDocument(operation.query),
                            variables: operation.variables,
                            extensions: operation.extensions,
                        }
                        const requestId = getRequestId(request)
                        pendingRequests.set(requestId, request)
                        await updateMetadata()
                    }
                }

                const removePendingRequest = async (operation: Operation) => {
                    if (operation.kind === "mutation") {
                        const request: SerializedRequest = {
                            query: stringifyDocument(operation.query),
                            variables: operation.variables,
                            extensions: operation.extensions,
                        }
                        const requestId = getRequestId(request)
                        if (pendingRequests.has(requestId)) {
                            pendingRequests.delete(requestId)
                            processingRequests.delete(requestId)
                            await updateMetadata()

                            // 如果所有请求都处理完毕，隐藏提醒
                            if (pendingRequests.size === 0) {
                                hideEmptyArrayReminder()
                            }
                        }
                    }
                }

                const forceRemovePendingRequest = async (operation: Operation, reason = "unknown") => {
                    if (operation.kind === "mutation") {
                        const request: SerializedRequest = {
                            query: stringifyDocument(operation.query),
                            variables: operation.variables,
                            extensions: operation.extensions,
                        }
                        const requestId = getRequestId(request)
                        if (pendingRequests.has(requestId)) {
                            console.log(`[CustomOfflineExchange] 强制移除请求 (${reason}):`, requestId)
                            pendingRequests.delete(requestId)
                            processingRequests.delete(requestId)
                            await updateMetadata()

                            // 如果所有请求都处理完毕，隐藏提醒
                            if (pendingRequests.size === 0) {
                                hideEmptyArrayReminder()
                            }
                        }
                    }
                }

                const flushQueue = async () => {
                    if (!isFlushingQueue && pendingRequests.size > 0) {
                        isFlushingQueue = true

                        // 通知开始处理离线队列
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(
                                new CustomEvent("graphql-processing-queue", {
                                    detail: { processing: true, total: pendingRequests.size },
                                }),
                            )
                        }

                        const processedOperations = new Set<string>()

                        for (const [requestId, request] of pendingRequests.entries()) {
                            if (!processingRequests.has(requestId)) {
                                processingRequests.add(requestId)

                                try {
                                    const operation = client.createRequestOperation(
                                        "mutation",
                                        createRequest(request.query, request.variables),
                                        request.extensions,
                                    )

                                    const operationId = `${operation.query.loc?.source.body}_${JSON.stringify(operation.variables)}`

                                    if (!processedOperations.has(operationId)) {
                                        processedOperations.add(operationId)
                                        next(toRequestPolicy(operation, "network-only"))
                                    }
                                } catch (error) {
                                    console.error("[CustomOfflineExchange] Error creating operation:", error)
                                    processingRequests.delete(requestId)
                                }
                            }
                        }

                        isFlushingQueue = false

                        // 设置超时隐藏提醒（10秒后）
                        setTimeout(() => {
                            hideEmptyArrayReminder()
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(
                                    new CustomEvent("graphql-processing-queue", {
                                        detail: { processing: false, total: 0 },
                                    }),
                                )
                            }
                        }, 10000)
                    }
                }

                if (typeof window !== "undefined") {
                    window.addEventListener("graphql-backend-recovery", () => {
                        lastBackendRecoveryTime = Date.now()
                    })

                    window.addEventListener("graphql-force-remove-request", ((event: CustomEvent) => {
                        const { operation, reason } = event.detail
                        forceRemovePendingRequest(operation, reason)
                    }) as EventListener)
                }

                const forward: ExchangeIO = (ops$) => {
                    return pipe(
                        outerForward(ops$),
                        filter((res) => {
                            if (res.operation.kind === "mutation" && res.error && isVersionConflictError(res.error)) {
                                console.log("[CustomOfflineExchange] 检测到版本冲突错误，将移除请求:", res.operation.variables?.id)

                                // 延迟移除请求，确保错误先传播到errorExchange显示toast
                                setTimeout(() => {
                                    forceRemovePendingRequest(res.operation, "version-conflict").catch(console.error)
                                }, 100)

                                // 让错误继续传播到errorExchange，确保toast能正常显示
                                return true
                            }

                            if (
                                hasRehydrated &&
                                res.operation.kind === "mutation" &&
                                res.operation.context.optimistic &&
                                isOfflineError(res.error, res)
                            ) {
                                addPendingRequest(res.operation)
                                return false
                            }

                            if (res.operation.kind === "mutation" && !res.error && !isOfflineError(res.error, res)) {
                                removePendingRequest(res.operation)
                            }

                            return true
                        }),
                        share,
                    )
                }

                const cacheResults$ = cacheExchange({
                    ...opts,
                    storage: {
                        ...storage,
                        readData() {
                            const hydrate = storage.readData()
                            return {
                                async then(onEntries) {
                                    const mutations = await storage.readMetadata!()
                                    if (mutations && mutations.length > 0) {
                                        for (const request of mutations) {
                                            const requestId = getRequestId(request)
                                            pendingRequests.set(requestId, request)
                                        }
                                    } else if (isInCriticalTimeWindow()) {
                                        triggerEmptyArrayReminder()
                                    }

                                    onEntries!(await hydrate)
                                    storage.onOnline!(flushQueue)
                                    hasRehydrated = true

                                    if (pendingRequests.size > 0) {
                                        await flushQueue()
                                    }
                                },
                            }
                        },
                    },
                })({
                    client,
                    dispatchDebug,
                    forward,
                })

                return (operations$) => {
                    // 在查询请求发出前检查离线状态，避免不必要的网络请求
                    const isBackendOffline = (): boolean => {
                        if (typeof window === "undefined") return false

                        // 1. 检查 window.__graphqlBackendReachable
                        if ((window as any).__graphqlBackendReachable === false) {
                            return true
                        }

                        // 2. 检查 sessionStorage 中的网络状态
                        try {
                            const savedStatus = sessionStorage.getItem("network-status")
                            if (savedStatus) {
                                const parsed = JSON.parse(savedStatus)
                                const now = Date.now()
                                const MAX_AGE = 5 * 60 * 1000 // 5 分钟
                                if (parsed.timestamp && (now - parsed.timestamp) < MAX_AGE) {
                                    if (parsed.isGraphQLBackendReachable === false || parsed.isNextJSServerReachable === false) {
                                        return true
                                    }
                                }
                            }
                        } catch (error) {
                            // 忽略错误
                        }

                        return false
                    }

                    const opsAndRebound$ = merge([
                        reboundOps$,
                        pipe(
                            operations$,
                            onPush((operation) => {
                                if (operation.kind === "query" && !hasRehydrated) {
                                } else if (operation.kind === "teardown") {
                                } else if (operation.kind === "query") {
                                    // 查询请求发出前检查离线状态
                                    if (isBackendOffline()) {
                                        console.log("[CustomOfflineExchange] 检测到后端离线，强制使用 cache-only 策略")
                                        // 将请求策略改为 cache-only，避免发起网络请求
                                        next(toRequestPolicy(operation, "cache-only"))
                                    }
                                }
                            }),
                        ),
                    ])

                    return pipe(
                        cacheResults$(opsAndRebound$),
                        filter((res) => {
                            if (res.operation.kind === "query") {
                                if (isOfflineError(res.error, res)) {
                                    next(toRequestPolicy(res.operation, "cache-only"))
                                    return false
                                }
                            }
                            return true
                        }),
                    )
                }
            }

            return cacheExchange(opts)(input)
        }
