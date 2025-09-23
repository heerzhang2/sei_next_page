"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { SerializedRequest } from "@urql/exchange-graphcache"

export interface EnhancedSerializedRequest extends SerializedRequest {
    // 增强字段
    enhancedId: string
    timestamp: number
    status: "pending" | "retrying" | "failed" | "success"
    retryCount: number
    lastError?: string
    priority: "high" | "medium" | "low"
    userCanCancel: boolean
    operationName: string
}

export interface QueueHistory {
    id: string
    operationName: string
    variables: any
    query: string
    timestamp: number
    status: "success" | "failed" | "cancelled"
    error?: string
    processedAt: number
}

export interface OfflineQueueManager {
    queuedRequests: EnhancedSerializedRequest[]
    queueHistory: QueueHistory[]
    isProcessing: boolean
    totalRequests: number
    successCount: number
    failedCount: number
    pendingCount: number

    // 队列操作
    retryRequest: (id: string) => Promise<void>
    cancelRequest: (id: string) => Promise<void>
    retryAll: () => Promise<void>
    clearQueue: () => Promise<void>
    clearHistory: () => Promise<void>

    // 队列控制
    pauseQueue: () => void
    resumeQueue: () => void
    isPaused: boolean

    // 历史管理
    getHistoryByDate: (date: Date) => QueueHistory[]
    exportQueueData: () => string
}

const HISTORY_KEY = "urql-queue-history"
const QUEUE_SETTINGS_KEY = "urql-queue-settings"
const HISTORY_RETENTION_DAYS = 1

const openUrqlDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("graphcache-v3", 1)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
    })
}

const readUrqlMetadata = async (): Promise<SerializedRequest[]> => {
    try {
        const db = await openUrqlDatabase()
        const transaction = db.transaction(["metadata"], "readonly")
        const store = transaction.objectStore("metadata")

        return new Promise((resolve, reject) => {
            const request = store.get("metadata")
            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                const result = request.result
                if (result && result.value) {
                    resolve(JSON.parse(result.value))
                } else {
                    resolve([])
                }
            }
        })
    } catch (error) {
        console.error("读取URQL metadata失败:", error)
        return []
    }
}

const writeUrqlMetadata = async (requests: SerializedRequest[]): Promise<void> => {
    try {
        const db = await openUrqlDatabase()
        const transaction = db.transaction(["metadata"], "readwrite")
        const store = transaction.objectStore("metadata")

        return new Promise((resolve, reject) => {
            const request = store.put({
                key: "metadata",
                value: JSON.stringify(requests),
            })
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    } catch (error) {
        console.error("写入URQL metadata失败:", error)
        throw error
    }
}

export function useOfflineQueueManager(): OfflineQueueManager {
    const [queuedRequests, setQueuedRequests] = useState<EnhancedSerializedRequest[]>([])
    const [queueHistory, setQueueHistory] = useState<QueueHistory[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const queuedRequestsRef = useRef<EnhancedSerializedRequest[]>([])
    const lastSyncRef = useRef<string>("")

    // 更新 ref 当状态改变时
    useEffect(() => {
        queuedRequestsRef.current = queuedRequests
    }, [queuedRequests])

    const loadStoredData = useCallback(() => {
        try {
            // 加载队列设置
            const settings = localStorage.getItem(QUEUE_SETTINGS_KEY)
            if (settings) {
                const parsed = JSON.parse(settings)
                setIsPaused(parsed.isPaused || false)
            }

            // 加载历史记录
            const historyData = localStorage.getItem(HISTORY_KEY)
            if (historyData) {
                const history = JSON.parse(historyData)
                const cutoffTime = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000
                const validHistory = history.filter((item: QueueHistory) => item.processedAt > cutoffTime)
                setQueueHistory(validHistory)

                if (validHistory.length !== history.length) {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory))
                }
            }
        } catch (error) {
            console.error("加载存储数据失败:", error)
        }
    }, [])

    const saveSettings = useCallback(
        (paused: boolean = isPaused) => {
            try {
                localStorage.setItem(
                    QUEUE_SETTINGS_KEY,
                    JSON.stringify({
                        isPaused: paused,
                        lastUpdated: Date.now(),
                    }),
                )
            } catch (error) {
                console.error("保存设置失败:", error)
            }
        },
        [isPaused],
    )

    // 保存历史记录
    const saveHistory = useCallback((history: QueueHistory[]) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
        } catch (error) {
            console.error("保存历史记录失败:", error)
        }
    }, [])

    const syncWithUrqlQueue = useCallback(async () => {
        try {
            const urqlRequests = await readUrqlMetadata()

            // 创建当前状态的签名用于比较
            const currentSignature = JSON.stringify(
                urqlRequests.map((r) => ({
                    query: r.query,
                    variables: r.variables,
                })),
            )

            // 如果没有变化，跳过更新
            if (lastSyncRef.current === currentSignature) {
                return
            }

            lastSyncRef.current = currentSignature

            if (!urqlRequests.length) {
                if (queuedRequestsRef.current.length > 0) {
                    setQueuedRequests([])
                }
                return
            }

            const enhancedRequests: EnhancedSerializedRequest[] = urqlRequests.map((request, index) => {
                const operationName = extractOperationName(request.query)
                const existingRequest = queuedRequestsRef.current.find(
                    (r) => r.operationName === operationName && JSON.stringify(r.variables) === JSON.stringify(request.variables),
                )

                return {
                    ...request, // 保留所有URQL原始字段
                    enhancedId: existingRequest?.enhancedId || `req_${Date.now()}_${index}`,
                    operationName,
                    timestamp: existingRequest?.timestamp || Date.now(),
                    status: existingRequest?.status || "pending",
                    retryCount: existingRequest?.retryCount || 0,
                    lastError: existingRequest?.lastError,
                    priority: getPriority(operationName, request.variables),
                    userCanCancel: canUserCancel(operationName),
                }
            })

            setQueuedRequests(enhancedRequests)
            console.log(`[v0] 同步URQL队列: ${enhancedRequests.length} 个请求`)
        } catch (error) {
            console.error("同步URQL队列失败:", error)
        }
    }, [])

    const extractOperationName = (query: string): string => {
        const match = query.match(/(?:mutation|query)\s+(\w+)/)
        return match?.[1] || "Unknown"
    }

    const getPriority = (operationName: string, variables: any): "high" | "medium" | "low" => {
        if (
            operationName.toLowerCase().includes("save") ||
            operationName.toLowerCase().includes("update") ||
            operationName.toLowerCase().includes("modify")
        ) {
            return "high"
        }
        if (operationName.toLowerCase().includes("delete") || operationName.toLowerCase().includes("remove")) {
            return "medium"
        }
        return "low"
    }

    // 判断用户是否可以取消请求
    const canUserCancel = (operationName: string): boolean => {
        const criticalOperations = ["deleteReport", "finalizeReport"]
        return !criticalOperations.some((op) => operationName.toLowerCase().includes(op.toLowerCase()))
    }

    const retryRequest = useCallback(
        async (id: string) => {
            const request = queuedRequests.find((r) => r.enhancedId === id)
            if (!request) return

            setQueuedRequests((prev) =>
                prev.map((r) => (r.enhancedId === id ? { ...r, status: "retrying", retryCount: r.retryCount + 1 } : r)),
            )

            try {
                // 通过重新写入metadata来触发URQL的重试机制
                const currentQueue = await readUrqlMetadata()
                const requestToRetry = currentQueue.find(
                    (r) => r.query === request.query && JSON.stringify(r.variables) === JSON.stringify(request.variables),
                )

                if (requestToRetry) {
                    // 将请求移到队列前面��优先处理
                    const otherRequests = currentQueue.filter((r) => r !== requestToRetry)
                    const reorderedQueue = [requestToRetry, ...otherRequests]
                    await writeUrqlMetadata(reorderedQueue)

                    toast.success(`操作 "${request.operationName}" 已重新排队`)

                    // 等待一段时间后检查状态
                    setTimeout(async () => {
                        await syncWithUrqlQueue()
                    }, 1000)
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "未知错误"

                setQueuedRequests((prev) =>
                    prev.map((r) => (r.enhancedId === id ? { ...r, status: "failed", lastError: errorMessage } : r)),
                )

                toast.error(`操作 "${request.operationName}" 重试失败: ${errorMessage}`)
            }
        },
        [queuedRequests, syncWithUrqlQueue],
    )

    const cancelRequest = useCallback(
        async (id: string) => {
            const request = queuedRequests.find((r) => r.enhancedId === id)
            if (!request || !request.userCanCancel) return

            try {
                // 从URQL队列中移除这个请求
                const currentQueue = await readUrqlMetadata()
                const filteredQueue = currentQueue.filter(
                    (r) => !(r.query === request.query && JSON.stringify(r.variables) === JSON.stringify(request.variables)),
                )

                await writeUrqlMetadata(filteredQueue)

                // 添加到历史记录
                const historyItem: QueueHistory = {
                    id: request.enhancedId,
                    operationName: request.operationName,
                    variables: request.variables,
                    query: request.query,
                    timestamp: request.timestamp,
                    status: "cancelled",
                    processedAt: Date.now(),
                }

                setQueueHistory((prev) => {
                    const newHistory = [historyItem, ...prev]
                    saveHistory(newHistory)
                    return newHistory
                })

                // 更新本地状态
                setQueuedRequests((prev) => prev.filter((r) => r.enhancedId !== id))

                toast.info(`操作 "${request.operationName}" 已取消`)
            } catch (error) {
                console.error("取消请求失败:", error)
                toast.error("取消请求失败")
            }
        },
        [queuedRequests, saveHistory],
    )

    // 重试所有请求
    const retryAll = useCallback(async () => {
        if (isPaused) {
            toast.warning("队列已暂停，请先恢复队列")
            return
        }

        setIsProcessing(true)
        const pendingRequests = queuedRequests.filter((r) => r.status === "pending" || r.status === "failed")

        for (const request of pendingRequests) {
            await retryRequest(request.enhancedId)
            await new Promise((resolve) => setTimeout(resolve, 500))
        }

        setIsProcessing(false)
        toast.success("所有请求重试完成")
    }, [queuedRequests, retryRequest, isPaused])

    const clearQueue = useCallback(async () => {
        try {
            await writeUrqlMetadata([])
            setQueuedRequests([])
            toast.success("队列已清空")
        } catch (error) {
            console.error("清空队列失败:", error)
            toast.error("清空队列失败")
        }
    }, [])

    // 清空历史记录
    const clearHistory = useCallback(async () => {
        setQueueHistory([])
        localStorage.removeItem(HISTORY_KEY)
        toast.success("历史记录已清空")
    }, [])

    // 暂停队列
    const pauseQueue = useCallback(() => {
        setIsPaused(true)
        saveSettings(true)
        toast.info("队列已暂停")
    }, [saveSettings])

    // 恢复队列
    const resumeQueue = useCallback(() => {
        setIsPaused(false)
        saveSettings(false)
        toast.info("队列已恢复")
    }, [saveSettings])

    // 按日期获取历史记录
    const getHistoryByDate = useCallback(
        (date: Date): QueueHistory[] => {
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)

            return queueHistory.filter(
                (item) => item.processedAt >= startOfDay.getTime() && item.processedAt <= endOfDay.getTime(),
            )
        },
        [queueHistory],
    )

    // 导出队列数据
    const exportQueueData = useCallback((): string => {
        const exportData = {
            queuedRequests,
            queueHistory,
            exportedAt: new Date().toISOString(),
            version: "2.0",
        }
        return JSON.stringify(exportData, null, 2)
    }, [queuedRequests, queueHistory])

    // 统计数据
    const totalRequests = queuedRequests.length
    const successCount = queueHistory.filter((h) => h.status === "success").length
    const failedCount =
        queuedRequests.filter((r) => r.status === "failed").length +
        queueHistory.filter((h) => h.status === "failed").length
    const pendingCount = queuedRequests.filter((r) => r.status === "pending").length

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            if (!mounted) return
            loadStoredData()
            await syncWithUrqlQueue()
        }

        initialize()

        const interval = setInterval(() => {
            if (mounted) {
                syncWithUrqlQueue()
            }
        }, 1000) // 每秒检查一次

        const handleOnline = () => {
            if (mounted) {
                setTimeout(() => syncWithUrqlQueue(), 500)
            }
        }

        window.addEventListener("online", handleOnline)

        return () => {
            mounted = false
            clearInterval(interval)
            window.removeEventListener("online", handleOnline)
        }
    }, [loadStoredData, syncWithUrqlQueue])

    return {
        queuedRequests,
        queueHistory,
        isProcessing,
        totalRequests,
        successCount,
        failedCount,
        pendingCount,
        retryRequest,
        cancelRequest,
        retryAll,
        clearQueue,
        clearHistory,
        pauseQueue,
        resumeQueue,
        isPaused,
        getHistoryByDate,
        exportQueueData,
    }
}
