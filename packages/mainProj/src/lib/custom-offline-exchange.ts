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
}

const pendingRequests = new Map<string, SerializedRequest>()
const requestKeyMap = new Map<string, number>()
//只能刷新才变成空的： 数据量太大了？
const sendingRequests = new Set<string>()

const LAST_FLUSH_TIME_KEY = "graphql_last_flush_time"

const canFlushQueue = (): boolean => {
    const now = Date.now()
    const lastFlushTimeStr = localStorage.getItem(LAST_FLUSH_TIME_KEY)

    if (!lastFlushTimeStr) {
        // First time, allow flush
        return true
    }

    const lastFlushTime = Number.parseInt(lastFlushTimeStr, 10)
    const timeSinceLastFlush = now - lastFlushTime // in milliseconds

    // Base wait time: 2 minutes (120 seconds)
    const baseWaitTime = 120 * 1000 // 120 seconds in ms

    // Additional wait time: 20 seconds per pending request
    const additionalWaitTime = pendingRequests.size * 20 * 1000 // 20 seconds per request in ms

    const requiredWaitTime = baseWaitTime + additionalWaitTime

    console.log(
        `[v0] Rate limit check: timeSince=${timeSinceLastFlush}ms, required=${requiredWaitTime}ms, pending=${pendingRequests.size}`,
    )

    return timeSinceLastFlush >= requiredWaitTime
}

const updateLastFlushTime = (): void => {
    const now = Date.now()
    localStorage.setItem(LAST_FLUSH_TIME_KEY, now.toString())
    console.log(`[v0] Updated last flush time: ${new Date(now).toLocaleString()}`)
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
                //原来const sendingRequests = new Set<string>()放在这的，导致很多情况sendingRequests都是空的，经常要初始化的；
                let hasRehydrated = false
                let isFlushingQueue = false
                let flushQueuePromise: Promise<void> | null = null
                let onlineHandlerRegistered = false
                //只适合每一个可离线的mutation的：
                const getRequestId = (request: SerializedRequest): string => {
                    //根据不同的mutation接口来具体优化生成的id：
                    return `${request.query}_${JSON.stringify(request.variables || {})}_${JSON.stringify(request.extensions || {})}`
                }

                const updateMetadata = async () => {
                    if (hasRehydrated) {
                        const requests = Array.from(pendingRequests.values())
                        const previousCount = pendingRequests.size

                        if (requests.length === 0 && previousCount > 0 && isFlushingQueue) {
                            triggerOfflineTaskCompletion()
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
                        console.log(`[v0] 添加离线请求到队列: ${requestId}`)
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
                            sendingRequests.delete(requestId)
                            requestKeyMap.delete(requestId)

                            console.log(`[v0] 移除成功的请求: ${requestId}`)
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
                            console.log(`[v0] 强制移除请求 (${reason}):`, requestId)
                            const previousCount = pendingRequests.size
                            pendingRequests.delete(requestId)
                            sendingRequests.delete(requestId)
                            requestKeyMap.delete(requestId)

                            await updateMetadata()

                            if (pendingRequests.size === 0 && previousCount > 0 && isFlushingQueue) {
                                triggerOfflineTaskCompletion()
                            }
                        }
                    }
                }

                const sendSingleRequest = async (requestId: string): Promise<boolean> => {
                    const request = pendingRequests.get(requestId)
                    if (!request) {
                        console.log(`[v0] 请求不存在: ${requestId}`)
                        return false
                    }

                    if (sendingRequests.has(requestId)) {
                        console.log(`[v0] 请求已在发送中: ${requestId}`)
                        return false
                    }

                    try {
                        const operation = client.createRequestOperation(
                            "mutation",
                            createRequest(request.query, request.variables),
                            request.extensions,
                        )

                        sendingRequests.add(requestId)
                        requestKeyMap.set(requestId, operation.key)

                        console.log(`[v0] 手动发送请求: ${requestId}`)
                        next(toRequestPolicy(operation, "network-only"))
                        return true
                    } catch (error) {
                        console.error(`[v0] 发送请求失败:`, error)
                        sendingRequests.delete(requestId)
                        return false
                    }
                }

                const flushQueue = async (): Promise<void> => {
                    // 如果已经在执行，返回同一个 Promise
                    if (flushQueuePromise) {
                        console.log("[v0] flushQueue 已在执行中，跳过重复调用")
                        return flushQueuePromise
                    }

                    if (!isFlushingQueue && pendingRequests.size > 0) {
                        isFlushingQueue = true
                        flushQueuePromise = (async () => {
                            try {
                                const totalTasks = pendingRequests.size
                                console.log(`[v0] 开始处理 ${totalTasks} 个离线请求`)

                                updateLastFlushTime()

                                // 创建请求条目的快照，避免在循环过程中队列被修改
                                const requestEntries = Array.from(pendingRequests.entries())

                                for (let i = 0; i < requestEntries.length; i++) {
                                    const [requestId, request] = requestEntries[i]

                                    console.log(`[v0] 处理请求 ${i + 1}/${requestEntries.length}: ${requestId}`)

                                    // 检查是否已在发送中
                                    if (sendingRequests.has(requestId)) {
                                        console.log(`[v0] 请求已在发送中，跳过: ${requestId}`)
                                        continue
                                    }

                                    // 检查请求是否还在队列中（可能被其他逻辑移除）
                                    if (!pendingRequests.has(requestId)) {
                                        console.log(`[v0] 请求已被移除，跳过: ${requestId}`)
                                        continue
                                    }

                                    // 添加延迟，避免同时发送太多请求
                                    if (i > 0) {
                                        await new Promise((resolve) => setTimeout(resolve, 500)) // 每个请求间隔500ms
                                    }

                                    await sendSingleRequest(requestId)
                                }

                                // 检查是否所有请求都已完成
                                setTimeout(() => {
                                    console.log(`[v0] 检查完成状态: pendingRequests.size=${pendingRequests.size}`)
                                    if (pendingRequests.size === 0) {
                                        triggerOfflineTaskCompletion()
                                    }
                                }, 3000) // 3秒后检查完成状态
                            } catch (error) {
                                console.error("[v0] flushQueue 执行出错:", error)
                            } finally {
                                // 清理锁状态
                                isFlushingQueue = false
                                flushQueuePromise = null
                                console.log("[v0] flushQueue 执行完成，锁已释放")
                            }
                        })()

                        return flushQueuePromise
                    } else {
                        console.log("[v0] 无需执行 flushQueue，队列为空或正在执行")
                    }
                }

                // 统一的离线队列处理触发函数
                const triggerOfflineQueueProcessing = async (): Promise<void> => {
                    if (hasRehydrated && pendingRequests.size > 0) {
                        if (!canFlushQueue()) {
                            console.log("[v0] Rate limit: 跳过 flushQueue，距离上次执行时间不足")
                            return
                        }
                        console.log("[v0] 触发离线队列处理")
                        await flushQueue()
                    } else {
                        console.log("[v0] 跳过离线队列处理:", {
                            hasRehydrated,
                            pendingRequestsSize: pendingRequests.size,
                        })
                    }
                }
                //手动点击：不受时间限制
                const triggerOfflineProcessingManual = async (): Promise<void> => {
                    if (hasRehydrated && pendingRequests.size > 0) {
                        console.log("[v0] 触发离线队列处理")
                        updateLastFlushTime()
                        await flushQueue()
                    } else {
                        console.log("[v0] 跳过离线队列处理:", {
                            hasRehydrated,
                            pendingRequestsSize: pendingRequests.size,
                        })
                    }
                }

                if (typeof window !== "undefined") {
                    window.addEventListener("graphql-manual-retry", ((event: CustomEvent) => {
                        const { requestId, retryAll } = event.detail
                        console.log(`[v0] 收到手动重试请求:`, { requestId, retryAll })
                        if (retryAll) {
                            // 重试所有请求
                            triggerOfflineProcessingManual().catch(console.error)
                        } else if (requestId) {
                            // 重试单个请求
                            sendSingleRequest(requestId).catch(console.error)
                        }
                    }) as EventListener)
                    window.addEventListener("graphql-backend-recovery", () => {
                        // 后端恢复时触发队列处理
                        triggerOfflineQueueProcessing().catch(console.error)
                    })
                    window.addEventListener("graphql-force-remove-request", ((event: CustomEvent) => {
                        const { operation, reason } = event.detail
                        forceRemovePendingRequest(operation, reason)
                    }) as EventListener)
                    // 监听浏览器在线事件
                    window.addEventListener("online", () => {
                        console.log("[v0] 浏览器在线状态恢复")
                        triggerOfflineQueueProcessing().catch(console.error)
                    })
                }

                const forward: ExchangeIO = (ops$) => {
                    return pipe(
                        outerForward(ops$),
                        filter((res) => {
                            if (res.operation.kind === "mutation" && res.error && isVersionConflictError(res.error)) {
                                console.log("[v0] 检测到版本冲突错误，将移除请求:", res.operation.variables?.id)

                                // 延迟移除请求，确保错误先传播到errorExchange显示toast
                                setTimeout(() => {
                                    forceRemovePendingRequest(res.operation, "version-conflict").catch(console.error)
                                }, 100)

                                // 让错误继续传播到errorExchange，确保toast能正常显示
                                return true
                            }

                            if (hasRehydrated && res.operation.kind === "mutation" && res.error && isOfflineError(res.error, res)) {
                                console.log("[v0] 检测到离线错误，添加到pending:", res.operation.variables?.id)
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
                                        console.log(`[v0] 从metadata读取${mutations.length}个离线请求`)
                                        for (const request of mutations) {
                                            const requestId = getRequestId(request)
                                            pendingRequests.set(requestId, request)
                                        }
                                    }
                                    onEntries!(await hydrate)

                                    // 防止重复注册 online 监听器
                                    if (!onlineHandlerRegistered) {
                                        storage.onOnline!(triggerOfflineQueueProcessing)
                                        onlineHandlerRegistered = true
                                        console.log("[v0] Online 监听器已注册")
                                    }

                                    hasRehydrated = true

                                    // 水合完成后触发队列处理（通过统一入口）
                                    if (pendingRequests.size > 0) {
                                        console.log("[v0] 水合完成，开始处理离线队列")
                                        await triggerOfflineQueueProcessing()
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
                        console.log("[v0] 所有离线任务已完成，触发完成提醒")
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
