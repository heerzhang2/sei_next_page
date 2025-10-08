// hooks/use-offline-queue-manager.ts
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { SerializedRequest } from "@urql/exchange-graphcache"

export interface QueuedRequest {
    id: string
    operationName: string
    variables: any
    query: string
    timestamp: number
    status: "pending" | "retrying" | "failed" | "success"
    retryCount: number
    lastError?: string
    priority: "high" | "medium" | "low"
    userCanCancel: boolean
}

export interface QueueHistory {
    id: string
    operationName: string
    variables: any
    query: string
    timestamp: number
    status: "success" | "failed" | "cancelled" | "backed_up"
    error?: string
    processedAt: number
}

export interface OfflineQueueManager {
    queuedRequests: QueuedRequest[]
    queueHistory: QueueHistory[]
    isProcessing: boolean
    totalRequests: number
    successCount: number
    failedCount: number
    pendingCount: number

    // 队列操作 - 通过触发网络事件让URQL处理
    retryRequest: (id: string) => Promise<void>
    cancelRequest: (id: string) => Promise<void>
    retryAll: () => Promise<void>
    clearQueue: () => Promise<void>
    clearHistory: () => Promise<void>

    // 历史管理
    getHistoryByDate: (date: Date) => QueueHistory[]
    exportQueueData: () => string
}

// 生成请求标识的辅助函数
const generateRequestId = (request: SerializedRequest): string => {
    const operationName = extractOperationName(request.query)
    return `${operationName}_${JSON.stringify(request.variables)}_${Date.now()}`
}

const extractOperationName = (query: string): string => {
    const match = query.match(/(?:mutation|query)\s+(\w+)/)
    return match?.[1] || "Unknown"
}

const openUrqlDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("graphcache-sei", 1)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // Create metadata object store if it doesn't exist
            if (!db.objectStoreNames.contains("metadata")) {
                console.log("[v0] 创建 metadata 对象存储")
                db.createObjectStore("metadata")
            }

            if (!db.objectStoreNames.contains("entries")) {
                console.log("[v0] 创建 entries 对象存储")
                db.createObjectStore("entries")
            }
        }
    })
}

const readUrqlMetadata = async (): Promise<SerializedRequest[]> => {
    try {
        const db = await openUrqlDatabase()

        if (!db.objectStoreNames.contains("metadata")) {
            console.log("[v0] metadata 对象存储不存在，返回空数组")
            return []
        }

        const transaction = db.transaction(["metadata"], "readonly")
        const store = transaction.objectStore("metadata")

        return new Promise((resolve, reject) => {
            const request = store.get("metadata")
            request.onerror = () => {
                console.error("[v0] 读取 metadata 失败:", request.error)
                resolve([])
            }
            request.onsuccess = () => {
                const result = request.result
                if (result) {
                    try {
                        resolve(Array.isArray(result) ? result : [])
                    } catch (e) {
                        console.error("[v0] 解析URQL metadata失败:", e)
                        resolve([])
                    }
                } else {
                    resolve([])
                }
            }
        })
    } catch (error) {
        console.log("[v0] 读取URQL metadata失败:", error)
        return []
    }
}

export function useOfflineQueueManager(): OfflineQueueManager {
    const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([])
    const [queueHistory, setQueueHistory] = useState<QueueHistory[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    const queuedRequestsRef = useRef<QueuedRequest[]>([])
    const lastSyncRef = useRef<string>("")
    const mountedRef = useRef(true)

    // 更新 ref 当状态改变时
    useEffect(() => {
        queuedRequestsRef.current = queuedRequests
    }, [queuedRequests])

    //读取urql的离线metadata列表，转换为方便观察的形式
    const syncWithUrqlQueue = useCallback(async () => {
        if (!mountedRef.current) return

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

            const enhancedRequests: QueuedRequest[] = urqlRequests.map((request, index) => {
                const operationName = extractOperationName(request.query)
                const existingRequest = queuedRequestsRef.current.find(
                    (r) => r.operationName === operationName && JSON.stringify(r.variables) === JSON.stringify(request.variables),
                )

                return {
                    id: existingRequest?.id || `req_${Date.now()}_${index}`,
                    operationName,
                    query: request.query,
                    variables: request.variables,
                    timestamp: existingRequest?.timestamp || Date.now(),
                    status: existingRequest?.status || "pending",
                    retryCount: existingRequest?.retryCount || 0,
                    lastError: existingRequest?.lastError,
                    priority: getPriority(operationName, request.variables),
                    userCanCancel: canUserCancel(operationName),
                }
            })

            setQueuedRequests(enhancedRequests)
            console.log(`[v0] 监控到URQL队列变化: ${enhancedRequests.length} 个请求`)
        } catch (error) {
            console.error("[v0] 同步URQL队列失败:", error)
        }
    }, [])

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
            const request = queuedRequests.find((r) => r.id === id)
            if (!request) return

            setQueuedRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: "retrying", retryCount: r.retryCount + 1 } : r)),
            )

            try {
                // 生成请求标识并触发手动重试事件
                const requestId = generateRequestId(request)
                window.dispatchEvent(
                    new CustomEvent("graphql-manual-retry", {
                        detail: { requestId, retryAll: false },
                    }),
                )

                // 强制触发 online 事件让 URQL 处理队列
                if (typeof navigator !== 'undefined' && navigator.onLine) {
                    window.dispatchEvent(new Event('online'))
                }

                toast.success(`操作 "${request.operationName}" 已触发重试`)

                // 等待一段时间后检查状态
                setTimeout(async () => {
                    await syncWithUrqlQueue()
                }, 2000)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "未知错误"
                setQueuedRequests((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: "failed", lastError: errorMessage } : r)),
                )
                toast.error(`操作 "${request.operationName}" 重试失败: ${errorMessage}`)
            }
        },
        [queuedRequests, syncWithUrqlQueue],
    )

    const cancelRequest = useCallback(
        async (id: string) => {
            const request = queuedRequests.find((r) => r.id === id)
            if (!request || !request.userCanCancel) return

            try {
                // 添加到历史记录
                const historyItem: QueueHistory = {
                    id: request.id,
                    operationName: request.operationName,
                    variables: request.variables,
                    query: request.query,
                    timestamp: request.timestamp,
                    status: "cancelled",
                    processedAt: Date.now(),
                }

                setQueueHistory((prev) => {
                    const newHistory = [historyItem, ...prev]
                    return newHistory
                })

                // 从UI中移除（不影响URQL的实际队列）
                setQueuedRequests((prev) => prev.filter((r) => r.id !== id))

                toast.info(`操作 "${request.operationName}" 已从监控中移除`)
            } catch (error) {
                console.error("[v0] 取消请求失败:", error)
                toast.error("取消请求失败")
            }
        },
        [queuedRequests],
    )

    const retryAll = useCallback(async () => {
        setIsProcessing(true)
        const pendingRequests = queuedRequests.filter((r) => r.status === "pending" || r.status === "failed")

        if (pendingRequests.length === 0) {
            toast.info("没有需要重试的请求")
            setIsProcessing(false)
            return
        }

        // 批量更新状态
        setQueuedRequests((prev) =>
            prev.map((r) =>
                pendingRequests.some((p) => p.id === r.id)
                    ? { ...r, status: "retrying" as const, retryCount: r.retryCount + 1 }
                    : r,
            ),
        )

        // 触发批量重试事件
        window.dispatchEvent(
            new CustomEvent("graphql-manual-retry", {
                detail: { retryAll: true },
            }),
        )

        // 强制触发 URQL 的重试机制
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            window.dispatchEvent(new Event('online'))
        }

        toast.success(`开始重试 ${pendingRequests.length} 个请求`)

        setTimeout(async () => {
            setIsProcessing(false)
            await syncWithUrqlQueue()
        }, 3000)
    }, [queuedRequests, syncWithUrqlQueue])

    const clearQueue = useCallback(async () => {
        try {
            setQueuedRequests([])
            toast.success("监控队列已清空")
        } catch (error) {
            console.error("[v0] 清空队列失败:", error)
            toast.error("清空队列失败")
        }
    }, [])

    // 清空历史记录
    const clearHistory = useCallback(async () => {
        setQueueHistory([])
        toast.success("历史记录已清空")
    }, [])

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
        mountedRef.current = true
        const initialize = async () => {
            if (!mountedRef.current) return
            // 初始同步
            await syncWithUrqlQueue()
        }
        initialize()

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "urql-metadata" && mountedRef.current) {
                setTimeout(() => syncWithUrqlQueue(), 2000)
            }
        }

        const interval = setInterval(() => {
            if (mountedRef.current) {
                syncWithUrqlQueue()
            }
        }, 5000) // 每5秒检查一次

        const handleOnline = () => {
            if (mountedRef.current) {
                setTimeout(() => syncWithUrqlQueue(), 3000)
            }
        }
        // 监听补偿存储恢复事件
        const handleCompensationRestored = () => {
            setTimeout(() => syncWithUrqlQueue(), 1000)
        }
        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("online", handleOnline)
        window.addEventListener("urql:metadata-updated", handleCompensationRestored)
        return () => {
            mountedRef.current = false
            clearInterval(interval)
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("urql:metadata-updated", handleCompensationRestored)
        }
    }, [syncWithUrqlQueue])

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
        getHistoryByDate,
        exportQueueData,
    }
}