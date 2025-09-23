"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

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
    timestamp: number
    status: "success" | "failed" | "cancelled"
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

const STORAGE_KEY = "urql-enhanced-queue"
const HISTORY_KEY = "urql-queue-history"
const HISTORY_RETENTION_DAYS = 1 // 保留1天历史

export function useOfflineQueueManager(): OfflineQueueManager {
    const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([])
    const [queueHistory, setQueueHistory] = useState<QueueHistory[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const queuedRequestsRef = useRef<QueuedRequest[]>([])

    // 更新 ref 当状态改变时
    useEffect(() => {
        queuedRequestsRef.current = queuedRequests
    }, [queuedRequests])

    // 从localStorage加载队列数据
    const loadQueueData = useCallback(() => {
        try {
            // 加载当前队列
            const queueData = localStorage.getItem(STORAGE_KEY)
            if (queueData) {
                const parsed = JSON.parse(queueData)
                setQueuedRequests(parsed.requests || [])
                setIsPaused(parsed.isPaused || false)
            }

            // 加载历史记录
            const historyData = localStorage.getItem(HISTORY_KEY)
            if (historyData) {
                const history = JSON.parse(historyData)
                // 清理过期历史记录
                const cutoffTime = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000
                const validHistory = history.filter((item: QueueHistory) => item.processedAt > cutoffTime)
                setQueueHistory(validHistory)

                // 如果清理了数据，更新存储
                if (validHistory.length !== history.length) {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory))
                }
            }
        } catch (error) {
            console.error("加载队列数据失败:", error)
        }
    }, [])

    // 保存队列数据到localStorage
    const saveQueueData = useCallback(
        (requests: QueuedRequest[], paused: boolean = isPaused) => {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        requests,
                        isPaused: paused,
                        lastUpdated: Date.now(),
                    }),
                )
            } catch (error) {
                console.error("保存队列数据失败:", error)
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

    // 从URQL metadata同步队列状态
    const syncWithUrqlMetadata = useCallback(() => {
        try {
            const metadata = localStorage.getItem("urql-metadata")
            if (!metadata) {
                if (queuedRequestsRef.current.length > 0) {
                    setQueuedRequests([])
                }
                return
            }

            let urqlData
            try {
                urqlData = JSON.parse(metadata)
            } catch (parseError) {
                console.error("解析URQL metadata失败:", parseError)
                return
            }

            if (!Array.isArray(urqlData)) {
                console.warn("URQL metadata 不是数组格式:", typeof urqlData)
                // 尝试从不同的可能结构中提取数组
                if (urqlData && typeof urqlData === "object") {
                    if (Array.isArray(urqlData.operations)) {
                        urqlData = urqlData.operations
                    } else if (Array.isArray(urqlData.queue)) {
                        urqlData = urqlData.queue
                    } else if (Array.isArray(urqlData.requests)) {
                        urqlData = urqlData.requests
                    } else {
                        // 如果找不到数组，清空队列
                        if (queuedRequestsRef.current.length > 0) {
                            setQueuedRequests([])
                        }
                        return
                    }
                } else {
                    if (queuedRequestsRef.current.length > 0) {
                        setQueuedRequests([])
                    }
                    return
                }
            }

            if (!urqlData.length) {
                if (queuedRequestsRef.current.length > 0) {
                    setQueuedRequests([])
                }
                return
            }

            // 解析URQL队列数据并转换为增强格式
            const enhancedRequests: QueuedRequest[] = urqlData.map((request: any, index: number) => {
                const operationName = request.query?.match(/(?:mutation|query)\s+(\w+)/)?.[1] || "Unknown"
                const existingRequest = queuedRequestsRef.current.find(
                    (r) => r.operationName === operationName && JSON.stringify(r.variables) === JSON.stringify(request.variables),
                )

                return {
                    id: existingRequest?.id || `req_${Date.now()}_${index}`,
                    operationName,
                    variables: request.variables || {},
                    query: request.query || "",
                    timestamp: existingRequest?.timestamp || Date.now(),
                    status: existingRequest?.status || ("pending" as const),
                    retryCount: existingRequest?.retryCount || 0,
                    lastError: existingRequest?.lastError,
                    priority: getPriority(operationName, request.variables),
                    userCanCancel: canUserCancel(operationName),
                }
            })

            const currentRequestsStr = JSON.stringify(
                queuedRequestsRef.current.map((r) => ({
                    id: r.id,
                    status: r.status,
                    operationName: r.operationName,
                    retryCount: r.retryCount,
                })),
            )
            const newRequestsStr = JSON.stringify(
                enhancedRequests.map((r) => ({
                    id: r.id,
                    status: r.status,
                    operationName: r.operationName,
                    retryCount: r.retryCount,
                })),
            )

            if (currentRequestsStr !== newRequestsStr) {
                setQueuedRequests(enhancedRequests)
                saveQueueData(enhancedRequests)
            }
        } catch (error) {
            console.error("同步URQL metadata失败:", error)
        }
    }, [saveQueueData]) // 移除 queuedRequests 依赖

    // 确定请求优先级
    const getPriority = (operationName: string, variables: any): "high" | "medium" | "low" => {
        // 保存操作优先级高
        if (
            operationName.toLowerCase().includes("save") ||
            operationName.toLowerCase().includes("update") ||
            operationName.toLowerCase().includes("modify")
        ) {
            return "high"
        }
        // 删除操作中等优先级
        if (operationName.toLowerCase().includes("delete") || operationName.toLowerCase().includes("remove")) {
            return "medium"
        }
        // 其他操作低优先级
        return "low"
    }

    // 判断用户是否可以取消请求
    const canUserCancel = (operationName: string): boolean => {
        // 某些关键操作不允许用户取消
        const criticalOperations = ["deleteReport", "finalizeReport"]
        return !criticalOperations.some((op) => operationName.toLowerCase().includes(op.toLowerCase()))
    }

    // 重试单个请求
    const retryRequest = useCallback(
        async (id: string) => {
            const request = queuedRequests.find((r) => r.id === id)
            if (!request) return

            setQueuedRequests((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: "retrying", retryCount: r.retryCount + 1 } : r)),
            )

            try {
                // 这里应该调用实际的GraphQL请求
                // 暂时模拟请求
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // 模拟成功/失败
                const success = Math.random() > 0.3 // 70%成功率

                if (success) {
                    // 移动到历史记录
                    const historyItem: QueueHistory = {
                        id: request.id,
                        operationName: request.operationName,
                        variables: request.variables,
                        timestamp: request.timestamp,
                        status: "success",
                        processedAt: Date.now(),
                    }

                    setQueueHistory((prev) => {
                        const newHistory = [historyItem, ...prev]
                        saveHistory(newHistory)
                        return newHistory
                    })

                    setQueuedRequests((prev) => {
                        const newRequests = prev.filter((r) => r.id !== id)
                        saveQueueData(newRequests)
                        return newRequests
                    })

                    toast.success(`操作 "${request.operationName}" 重试成功`)
                } else {
                    throw new Error("模拟请求失败")
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "未知错误"

                setQueuedRequests((prev) =>
                    prev.map((r) =>
                        r.id === id
                            ? {
                                ...r,
                                status: "failed",
                                lastError: errorMessage,
                            }
                            : r,
                    ),
                )

                toast.error(`操作 "${request.operationName}" 重试失败: ${errorMessage}`)
            }
        },
        [queuedRequests, saveQueueData, saveHistory],
    )

    // 取消单个请求
    const cancelRequest = useCallback(
        async (id: string) => {
            const request = queuedRequests.find((r) => r.id === id)
            if (!request || !request.userCanCancel) return

            // 移动到历史记录
            const historyItem: QueueHistory = {
                id: request.id,
                operationName: request.operationName,
                variables: request.variables,
                timestamp: request.timestamp,
                status: "cancelled",
                processedAt: Date.now(),
            }

            setQueueHistory((prev) => {
                const newHistory = [historyItem, ...prev]
                saveHistory(newHistory)
                return newHistory
            })

            setQueuedRequests((prev) => {
                const newRequests = prev.filter((r) => r.id !== id)
                saveQueueData(newRequests)
                return newRequests
            })

            toast.info(`操作 "${request.operationName}" 已取消`)
        },
        [queuedRequests, saveQueueData, saveHistory],
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
            await retryRequest(request.id)
            // 添加延迟避免过快请求
            await new Promise((resolve) => setTimeout(resolve, 500))
        }

        setIsProcessing(false)
        toast.success("所有请求重试完成")
    }, [queuedRequests, retryRequest, isPaused])

    // 清空队列
    const clearQueue = useCallback(async () => {
        setQueuedRequests([])
        saveQueueData([])
        localStorage.removeItem("urql-metadata")
        toast.success("队列已清空")
    }, [saveQueueData])

    // 清空历史记录
    const clearHistory = useCallback(async () => {
        setQueueHistory([])
        localStorage.removeItem(HISTORY_KEY)
        toast.success("历史记录已清空")
    }, [])

    // 暂停队列
    const pauseQueue = useCallback(() => {
        setIsPaused(true)
        saveQueueData(queuedRequests, true)
        toast.info("队列已暂停")
    }, [queuedRequests, saveQueueData])

    // 恢复队列
    const resumeQueue = useCallback(() => {
        setIsPaused(false)
        saveQueueData(queuedRequests, false)
        toast.info("队列已恢复")
    }, [queuedRequests, saveQueueData])

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
            version: "1.0",
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

    // 初始化和同步
    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            if (!mounted) return
            loadQueueData()
            syncWithUrqlMetadata()
        }

        initialize()

        // 监听URQL metadata变化
        const interval = setInterval(() => {
            if (mounted) {
                syncWithUrqlMetadata()
            }
        }, 2000)

        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [loadQueueData, syncWithUrqlMetadata])

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
