import { pipe, share, merge, makeSubject, filter, onPush } from "wonka"
import type { Operation, OperationResult, Exchange, ExchangeIO, CombinedError, RequestPolicy } from "@urql/core"
import { stringifyDocument, createRequest, makeOperation } from "@urql/core"
import type { SerializedRequest, CacheExchangeOpts, StorageAdapter } from "@urql/exchange-graphcache"
import { cacheExchange } from "@urql/exchange-graphcache"
import { mutationBackupStorage, type MutationBackupItem } from "./mutation-backup-storage"

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

/**用默认的没法满足要求,只好自己来定做：离线交换器工厂函数
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
                const requestKeyMap = new Map<string, number>()
                let hasRehydrated = false
                let isFlushingQueue = false
                const pageStartTime = Date.now()
                let lastBackendRecoveryTime: number | null = null

                mutationBackupStorage
                    .init()
                    .then(() => {
                        console.log("[CustomOfflineExchange] MutationBackupStorage已初始化")

                        // 启动超时检查
                        mutationBackupStorage.startTimeoutCheck(async (timeoutMutations: MutationBackupItem[]) => {
                            console.log(`[CustomOfflineExchange] 发现${timeoutMutations.length}个超时mutation，将加入failedQueue`)

                            // 将超时的mutation加入到pendingRequests，以便下次发送
                            for (const mutation of timeoutMutations) {
                                const request: SerializedRequest = {
                                    query: mutation.query,
                                    variables: mutation.variables,
                                    extensions: mutation.extensions,
                                }
                                const requestId = getRequestId(request)
                                if (!pendingRequests.has(requestId)) {
                                    pendingRequests.set(requestId, request)
                                    console.log(`[CustomOfflineExchange] 超时mutation已加入pendingRequests: ${requestId}`)
                                }
                            }

                            // 更新metadata，将超时的mutation写入离线缓存
                            await updateMetadata()
                        })
                    })
                    .catch((error) => {
                        console.error("[CustomOfflineExchange] MutationBackupStorage初始化失败:", error)
                    })

                const getRequestId = (request: SerializedRequest): string => {
                    return `${request.query}_${JSON.stringify(request.variables || {})}_${JSON.stringify(request.extensions || {})}`
                }

                const updateMetadata = async () => {
                    if (hasRehydrated) {
                        const requests = Array.from(pendingRequests.values())
                        const previousCount = pendingRequests.size

                        if (requests.length === 0 && previousCount > 0 && isFlushingQueue) {
                            triggerOfflineTaskCompletion()
                        }

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
                        requestKeyMap.set(requestId, operation.key)
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
                            const previousCount = pendingRequests.size
                            pendingRequests.delete(requestId)

                            const operationKey = requestKeyMap.get(requestId)
                            if (operationKey !== undefined) {
                                await mutationBackupStorage.removeMutation(operationKey)
                                requestKeyMap.delete(requestId)
                            }

                            await updateMetadata()

                            if (pendingRequests.size === 0 && previousCount > 0 && isFlushingQueue) {
                                triggerOfflineTaskCompletion()
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
                            const previousCount = pendingRequests.size
                            pendingRequests.delete(requestId)

                            const operationKey = requestKeyMap.get(requestId)
                            if (operationKey !== undefined) {
                                await mutationBackupStorage.removeMutation(operationKey)
                                requestKeyMap.delete(requestId)
                            }

                            await updateMetadata()

                            if (pendingRequests.size === 0 && previousCount > 0 && isFlushingQueue) {
                                triggerOfflineTaskCompletion()
                            }
                        }
                    }
                }

                const flushQueue = async () => {
                    if (!isFlushingQueue && pendingRequests.size > 0) {
                        isFlushingQueue = true
                        const totalTasks = pendingRequests.size

                        console.log(`[CustomOfflineExchange] 开始处理 ${totalTasks} 个离线请求`)

                        // 通知开始处理离线队列
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(
                                new CustomEvent("graphql-processing-queue", {
                                    detail: { processing: true, total: totalTasks },
                                }),
                            )
                        }

                        const requestEntries = Array.from(pendingRequests.entries())
                        for (let i = 0; i < requestEntries.length; i++) {
                            const [requestId, request] = requestEntries[i]

                            // 添加延迟，避免同时发送太多请求
                            if (i > 0) {
                                await new Promise((resolve) => setTimeout(resolve, 1000)) // 每个请求间隔1秒
                            }

                            try {
                                const operation = client.createRequestOperation(
                                    "mutation",
                                    createRequest(request.query, request.variables),
                                    request.extensions,
                                )

                                await mutationBackupStorage.addMutation(
                                    operation.key,
                                    request.query,
                                    request.variables,
                                    request.extensions,
                                )

                                requestKeyMap.set(requestId, operation.key)

                                console.log(`[CustomOfflineExchange] 发送请求: ${requestId}`)
                                next(toRequestPolicy(operation, "network-only"))
                            } catch (error) {
                                console.error(`[CustomOfflineExchange] 创建操作时出错:`, error)
                            }
                        }

                        setTimeout(() => {
                            if (pendingRequests.size === 0) {
                                triggerOfflineTaskCompletion()
                            }

                            if (typeof window !== "undefined") {
                                window.dispatchEvent(
                                    new CustomEvent("graphql-processing-queue", {
                                        detail: { processing: false, total: 0 },
                                    }),
                                )
                            }
                            isFlushingQueue = false
                        }, 5000) // 5秒后标记完成
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

                            if (hasRehydrated && res.operation.kind === "mutation" && res.error && isOfflineError(res.error, res)) {
                                console.log("[CustomOfflineExchange] 检测到离线错误，添加到pending:", res.operation.variables?.id)
                                addPendingRequest(res.operation)
                                return false
                            }

                            if (res.operation.kind === "mutation" && !res.error) {
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

                const triggerOfflineTaskCompletion = () => {
                    if (typeof window !== "undefined") {
                        console.log("[CustomOfflineExchange] 所有离线任务已完成，触发完成提醒")
                        window.dispatchEvent(
                            new CustomEvent("graphql-offline-tasks-completed", {
                                detail: {
                                    message: "所有离线mutation任务已完成发送",
                                    timestamp: new Date().toLocaleString(),
                                },
                            }),
                        )
                    }
                }

                const triggerEmptyArrayReminder = () => {
                    if (typeof window !== "undefined") {
                        console.log("[CustomOfflineExchange] 离线请求队列为空，触发提醒")
                        window.dispatchEvent(
                            new CustomEvent("graphql-offline-queue-empty", {
                                detail: {
                                    message: "离线请求队列为空，请检查网络连接",
                                    timestamp: new Date().toLocaleString(),
                                },
                            }),
                        )
                    }
                }

                const isInCriticalTimeWindow = (): boolean => {
                    const currentTime = Date.now()
                    return (
                        (currentTime - pageStartTime <= startupTimeWindow && !hasRehydrated) ||
                        (lastBackendRecoveryTime && currentTime - lastBackendRecoveryTime <= recoveryTimeWindow)
                    )
                }

                return (operations$) => {
                    const opsAndRebound$ = merge([
                        reboundOps$,
                        pipe(
                            operations$,
                            onPush((operation) => {
                                if (operation.kind === "query" && !hasRehydrated) {
                                } else if (operation.kind === "teardown") {
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
