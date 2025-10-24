"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

// 离线队列状态接口
export interface OfflineQueueStatus {
    hasPendingMutations: boolean
    queueLength: number
    lastUpdated: Date | null
}

export interface NetworkStatus {
    isClientOnline: boolean
    isOnline: boolean
    isGraphQLBackendReachable: boolean
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    isNextJSServerReachable: boolean
    offlineQueue: OfflineQueueStatus
    showOfflineQueueDialog?: (queueLength: number) => void
}

export interface NetworkStatusActions {
    updateGraphQLBackendStatus: (isReachable: boolean, isClientOnline?: boolean) => void
}

const NetworkStatusContext = createContext<NetworkStatus | null>(null)
const NetworkStatusActionsContext = createContext<NetworkStatusActions | null>(null)

declare global {
    var pendingQueueCallback: (() => void) | null
}

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const print = "1" === searchParams!.get("print")
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        lastError: null,
        lastOnlineTime: null,
        lastOfflineTime: null,
        connectionType: null,
        isClientOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        isNextJSServerReachable: true,
        isGraphQLBackendReachable: true,
        offlineQueue: { hasPendingMutations: false, queueLength: 0, lastUpdated: null },
    })

    const [showQueueDialog, setShowQueueDialog] = useState(false)
    const [queueDialogData, setQueueDialogData] = useState<{ queueLength: number } | null>(null)

    const showQueueConfirmationDialog = useCallback((queueLength: number) => {
        console.log("[v0] 显示离线队列确认对话框:", queueLength)
        setQueueDialogData({ queueLength })
        setShowQueueDialog(true)
    }, [])

    const handleQueueDecision = useCallback((shouldProcess: boolean) => {
        console.log("[v0] 用户队列决定:", shouldProcess)
        setShowQueueDialog(false)

        if (shouldProcess) {
            // 设置处理标记，防止重复处理
            localStorage.setItem("isProcessingQueue", "true")

            if (typeof window !== "undefined" && (window as any).pendingQueueCallback) {
                console.log("[v0] 执行待处理的队列回调")
                ;(window as any).pendingQueueCallback()
                ;(window as any).pendingQueueCallback = null
            }

            // 允许队列处理
            setNetworkStatus((prev) => ({
                ...prev,
                isGraphQLBackendReachable: true,
            }))

            toast.success("正在发送离线操作到服务器...", {
                duration: 3000,
            })

            // 5秒后清除处理标记
            setTimeout(() => {
                localStorage.removeItem("isProcessingQueue")
            }, 5000)
        } else {
            if (typeof window !== "undefined") {
                ;(window as any).pendingQueueCallback = null
            }

            // 保持后端为不可达状态，防止队列处理
            setNetworkStatus((prev) => ({
                ...prev,
                isGraphQLBackendReachable: false,
            }))

            toast.info("离线操作已保留，稍后可手动同步", {
                duration: 3000,
            })
        }
        setQueueDialogData(null)
    }, [])

     // 更新离线队列状态
    const updateOfflineQueueStatus = useCallback(async () => {
        const queueStatus = await checkOfflineQueue()
        setNetworkStatus((prev) => ({
            ...prev,
            offlineQueue: queueStatus,
        }))
        return queueStatus
    }, [])

    // 检查Next.js服务器连通性
    const checkNextJSServerConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch("/api/nextLive", {
                method: "HEAD",
                cache: "no-cache",
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            return response.ok
        } catch (error) {
            console.warn("Next.js服务器连接检查失败:", error)
            return false
        }
    }, [])

    // 检查GraphQL后端连通性
    const checkGraphQLBackendConnectivity = useCallback(async (retries = 1) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 15000)

                const backendUrl = process.env.NEXT_PUBLIC_BACK_END
                if (!backendUrl) return false

                const response = await fetch(`${backendUrl}/actuator/health`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    mode: "cors",
                    credentials: "include",
                    cache: "no-cache",
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)
                if (response.ok) {
                    const healthData = await response.json()
                    const dbStatus = healthData.components?.cockroachDB?.status
                    return dbStatus === "UP"
                }
                if (attempt < retries) {
                    console.log(`健康检查失败，第${attempt + 1}次重试...`)
                    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 15)))
                }
            } catch (error) {
                console.warn(`健康检查尝试${attempt + 1}失败:`, error)
                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 15)))
                }
            }
        }
        return false
    }, [])

    // 获取连接信息
    const getConnectionInfo = useCallback(() => {
        if (typeof navigator !== "undefined" && "connection" in navigator) {
            const connection = (navigator as any).connection
            return connection?.effectiveType || connection?.type || null
        }
        return null
    }, [])

    // 更新网络状态
    const updateNetworkStatus = useCallback(
        async (isClientOnline: boolean, error: Error | null = null) => {
            const isNextJSServerReachable = isClientOnline ? await checkNextJSServerConnectivity() : false
            const isGraphQLBackendReachable = isClientOnline ? await checkGraphQLBackendConnectivity() : false
            const connectionType = getConnectionInfo()

            const isOnline = isClientOnline && isNextJSServerReachable

            // 检查GraphQL后端状态变化
            const wasBackendOffline = !networkStatus.isGraphQLBackendReachable
            const isBackendNowOnline = isGraphQLBackendReachable

            setNetworkStatus((prev) => ({
                ...prev,
                isOnline,
                isClientOnline,
                isNextJSServerReachable,
                isGraphQLBackendReachable,
                lastError: error,
                lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
                lastOfflineTime: !isOnline ? new Date() : prev.lastOfflineTime,
                connectionType,
            }))
        },
        [
            checkNextJSServerConnectivity,
            checkGraphQLBackendConnectivity,
            getConnectionInfo,
            networkStatus.isGraphQLBackendReachable,
        ],
    )

    const updateGraphQLBackendStatus = useCallback((isReachable: boolean, isClientOnline = true) => {
        console.log("[v0] 外部更新GraphQL后端状态:", { isReachable, isClientOnline })

        setNetworkStatus((prev) => ({
            ...prev,
            isGraphQLBackendReachable: isReachable,
            isClientOnline: isClientOnline,
            isOnline: isClientOnline && prev.isNextJSServerReachable,
            lastOnlineTime: isReachable && isClientOnline ? new Date() : prev.lastOnlineTime,
            lastOfflineTime: !isReachable || !isClientOnline ? new Date() : prev.lastOfflineTime,
        }))
    }, [])

    const actions: NetworkStatusActions = {
        updateGraphQLBackendStatus,
    }

    const contextValue: NetworkStatus = {
        ...networkStatus,
        showOfflineQueueDialog: showQueueConfirmationDialog,
    }

    useEffect(() => {
        // 初始状态更新
        updateNetworkStatus(navigator.onLine)
        updateOfflineQueueStatus()

        const handleOnline = () => {
            console.log("Network: 客户端网络在线事件检测到")
            updateNetworkStatus(true)
        }

        const handleOffline = () => {
            console.log("Network: 客户端网络离线事件检测到")
            updateNetworkStatus(false)
        }

        // 定期服务器检查
        const serverCheckInterval = print
            ? undefined
            : setInterval(async () => {
                if (navigator.onLine) {
                    const isNextJSReachable = await checkNextJSServerConnectivity()
                    const isGraphQLReachable = await checkGraphQLBackendConnectivity()

                    // 检查后端状态变化
                    const wasBackendOffline = !networkStatus.isGraphQLBackendReachable
                    const isBackendNowOnline = isGraphQLReachable

                    setNetworkStatus((prev) => ({
                        ...prev,
                        isNextJSServerReachable: isNextJSReachable,
                        isGraphQLBackendReachable: isGraphQLReachable,
                        isOnline: prev.isClientOnline && isNextJSReachable,
                    }))

                    // 定期检查离线队列
                    await updateOfflineQueueStatus()
                }
            }, 80000)

        const handleConnectionChange = () => {
            const connectionType = getConnectionInfo()
            setNetworkStatus((prev) => ({
                ...prev,
                connectionType,
            }))
        }

        // 添加事件监听器
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        if (typeof navigator !== "undefined" && "connection" in navigator) {
            const connection = (navigator as any).connection
            connection?.addEventListener("change", handleConnectionChange)
        }

        return () => {
            // 清理事件监听器
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
            if (serverCheckInterval) clearInterval(serverCheckInterval)

            if (typeof navigator !== "undefined" && "connection" in navigator) {
                const connection = (navigator as any).connection
                connection?.removeEventListener("change", handleConnectionChange)
            }
        }
    }, [
        updateNetworkStatus,
        checkNextJSServerConnectivity,
        checkGraphQLBackendConnectivity,
        getConnectionInfo,
        print,
        updateOfflineQueueStatus,
    ])

    useEffect(() => {
        const checkInitialQueue = async () => {
            const queueStatus = await checkOfflineQueue()
            if (queueStatus.hasPendingMutations && queueStatus.queueLength > 0) {
                console.log("[v0] 发现离线队列:", queueStatus.queueLength)
                // showQueueConfirmationDialog(queueStatus.queueLength)
            }
            const isGraphQLReachable = navigator.onLine ? await checkGraphQLBackendConnectivity() : false
            setNetworkStatus((prev) => ({
                ...prev,
                isGraphQLBackendReachable: isGraphQLReachable,
            }))
        }
        // Initial status update with delayed backend check
        updateNetworkStatus(navigator.onLine)
        updateOfflineQueueStatus()
        // Check initial queue after a short delay
        setTimeout(checkInitialQueue, 1000)
    }, [updateNetworkStatus, updateOfflineQueueStatus, checkGraphQLBackendConnectivity, showQueueConfirmationDialog])

    return (
        <NetworkStatusContext.Provider value={contextValue}>
            <NetworkStatusActionsContext.Provider value={actions}>
                {children}
                {pathname !== "/login" && showQueueDialog && queueDialogData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">发现离线操作队列</h3>
                            <p className="text-gray-600 mb-6">
                                检测到 {queueDialogData.queueLength} 个离线保存的操作。 是否立即发送这些操作到服务器？
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleQueueDecision(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    暂不发送
                                </button>
                                <button
                                    onClick={() => handleQueueDecision(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    立即发送
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </NetworkStatusActionsContext.Provider>
        </NetworkStatusContext.Provider>
    )
}

export function useNetworkStatusContext() {
    const context = useContext(NetworkStatusContext)
    if (!context) {
        throw new Error("useNetworkStatusContext must be used within a NetworkStatusProvider")
    }
    return context
}

export function useNetworkStatusActions() {
    const context = useContext(NetworkStatusActionsContext)
    if (!context) {
        throw new Error("useNetworkStatusActions must be used within a NetworkStatusProvider")
    }
    return context
}

// 检查离线队列
const checkOfflineQueue = async (): Promise<OfflineQueueStatus> => {
    try {
        if (typeof window === "undefined") {
            return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
        }
        const metadata = localStorage.getItem("urql-metadata")
        if (!metadata) {
            return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
        }
        const requests = JSON.parse(metadata)
        return {
            hasPendingMutations: requests.length > 0,
            queueLength: requests.length,
            lastUpdated: new Date(),
        }
    } catch (error) {
        console.warn("检查离线队列失败:", error)
        return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
    }
}
