"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import type { SerializedRequest } from "@urql/exchange-graphcache"

export interface EnhancedSerializedRequest extends SerializedRequest {
    // 增强字段 - 仅用于UI显示和管理
    enhancedId: string
    timestamp: number
    status: "pending" | "retrying" | "failed" | "success"
    retryCount: number
    lastError?: string
    priority: "high" | "medium" | "low"
    userCanCancel: boolean
    operationName: string
    backupTimestamp: number // 备份时间戳
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
    queuedRequests: EnhancedSerializedRequest[]
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

    // 队列控制
    pauseQueue: () => void
    resumeQueue: () => void
    isPaused: boolean

    // 备份和恢复
    backupQueue: () => Promise<void>
    restoreFromBackup: (backupData: string) => Promise<void>

    // 历史管理
    getHistoryByDate: (date: Date) => QueueHistory[]
    exportQueueData: () => string
}

const HISTORY_KEY = "urql-queue-history"
const QUEUE_SETTINGS_KEY = "urql-queue-settings"
const BACKUP_KEY = "urql-queue-backup"
const HISTORY_RETENTION_DAYS = 1

const openUrqlDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("graphcache-sei")
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
    })
}

const readUrqlMetadata = async (): Promise<SerializedRequest[]> => {
    try {
        const db = await openUrqlDatabase()
        const transaction = db?.transaction(["metadata"], "readonly") // 只读事务
        const store = transaction?.objectStore("metadata")

        return new Promise((resolve, reject) => {
            const request = store.get("metadata")
            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                const result = request.result
                if (result) {
                    try {
                        resolve(Array.isArray(result) ? result : [])
                    } catch (e) {
                        console.error("【冲途中】解析URQL metadata失败:", e)
                        resolve([])
                    }
                } else {
                    resolve([])
                }
            }
        })
    } catch (error) {
        console.log("读取URQL metadata失败:", error)
        return []
    }
}

export function useOfflineQueueManager(): OfflineQueueManager {
    const [queuedRequests, setQueuedRequests] = useState<EnhancedSerializedRequest[]>([])
    const [queueHistory, setQueueHistory] = useState<QueueHistory[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const queuedRequestsRef = useRef<EnhancedSerializedRequest[]>([])
    const lastSyncRef = useRef<string>("")
    const mountedRef = useRef(true)

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
            console.error("[v0] 加载存储数据失败:", error)
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
                console.error("[v0] 保存设置失败:", error)
            }
        },
        [isPaused],
    )

    // 保存历史记录
    const saveHistory = useCallback((history: QueueHistory[]) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
        } catch (error) {
            console.error("[v0] 保存历史记录失败:", error)
        }
    }, [])

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
                    backupTimestamp: Date.now(),
                }
            })

            setQueuedRequests(enhancedRequests)
            console.log(`[v0] 监控到URQL队列变化: ${enhancedRequests.length} 个请求`)
        } catch (error) {
            console.error("[v0] 同步URQL队列失败:", error)
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
                // 触发网络状态变化，让URQL自动重试
                window.dispatchEvent(new Event("online"))

                toast.success(`操作 "${request.operationName}" 已触发重试`)

                // 等待一段时间后检查状态
                setTimeout(async () => {
                    await syncWithUrqlQueue()
                }, 2000)
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

                // 从UI中移除（不影响URQL的实际队列）
                setQueuedRequests((prev) => prev.filter((r) => r.enhancedId !== id))

                toast.info(`操作 "${request.operationName}" 已从监控中移除`)
            } catch (error) {
                console.error("[v0] 取消请求失败:", error)
                toast.error("取消请求失败")
            }
        },
        [queuedRequests, saveHistory],
    )

    const retryAll = useCallback(async () => {
        if (isPaused) {
            toast.warning("队列已暂停，请先恢复队列")
            return
        }

        setIsProcessing(true)
        const pendingRequests = queuedRequests.filter((r) => r.status === "pending" || r.status === "failed")

        // 批量更新状态
        setQueuedRequests((prev) =>
            prev.map((r) =>
                pendingRequests.some((p) => p.enhancedId === r.enhancedId)
                    ? { ...r, status: "retrying" as const, retryCount: r.retryCount + 1 }
                    : r,
            ),
        )

        // 触发网络重连事件，让URQL处理重试
        window.dispatchEvent(new Event("online"))

        setTimeout(async () => {
            setIsProcessing(false)
            await syncWithUrqlQueue()
            toast.success("所有请求重试完成")
        }, 3000)
    }, [queuedRequests, isPaused, syncWithUrqlQueue])

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
        localStorage.removeItem(HISTORY_KEY)
        toast.success("历史记录已清空")
    }, [])

    // 暂停队列
    const pauseQueue = useCallback(() => {
        setIsPaused(true)
        saveSettings(true)
        toast.info("队列监控已暂停")
    }, [saveSettings])

    // 恢复队列
    const resumeQueue = useCallback(() => {
        setIsPaused(false)
        saveSettings(false)
        toast.info("队列监控已恢复")
    }, [saveSettings])

    const backupQueue = useCallback(async () => {
        try {
            const backupData = {
                queuedRequests,
                timestamp: Date.now(),
                version: "2.0",
            }
            localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData))

            // 同时添加到历史记录
            const historyItems: QueueHistory[] = queuedRequests.map((req) => ({
                id: req.enhancedId,
                operationName: req.operationName,
                variables: req.variables,
                query: req.query,
                timestamp: req.timestamp,
                status: "backed_up",
                processedAt: Date.now(),
            }))

            setQueueHistory((prev) => {
                const newHistory = [...historyItems, ...prev]
                saveHistory(newHistory)
                return newHistory
            })

            toast.success(`已备份 ${queuedRequests.length} 个请求`)
        } catch (error) {
            console.error("[v0] 备份队列失败:", error)
            toast.error("备份队列失败")
        }
    }, [queuedRequests, saveHistory])

    const restoreFromBackup = useCallback(async (backupData: string) => {
        try {
            const parsed = JSON.parse(backupData)
            if (parsed.queuedRequests && Array.isArray(parsed.queuedRequests)) {
                setQueuedRequests(parsed.queuedRequests)
                toast.success(`已恢复 ${parsed.queuedRequests.length} 个请求`)
            } else {
                throw new Error("无效的备份数据格式")
            }
        } catch (error) {
            console.error("[v0] 恢复备份失败:", error)
            toast.error("恢复备份失败")
        }
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
            loadStoredData()
            // await syncWithUrqlQueue() 太早了 indexDB数据库可能还没有创建
        }

        initialize()

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "urql-metadata" && mountedRef.current) {
                setTimeout(() => syncWithUrqlQueue(), 500)
            }
        }

        const interval = setInterval(() => {
            if (mountedRef.current && !isPaused) {
                syncWithUrqlQueue()
            }
        }, 5000) // 每5秒检查一次

        const handleOnline = () => {
            if (mountedRef.current) {
                setTimeout(() => syncWithUrqlQueue(), 1000)
            }
        }

        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("online", handleOnline)

        return () => {
            mountedRef.current = false
            clearInterval(interval)
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("online", handleOnline)
        }
    }, [loadStoredData, syncWithUrqlQueue, isPaused])

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
        backupQueue,
        restoreFromBackup,
        getHistoryByDate,
        exportQueueData,
    }
}
