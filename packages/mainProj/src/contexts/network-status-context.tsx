"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { withBasePath } from '@/lib/tool'

export interface NetworkStatus {
    isClientOnline: boolean
    isOnline: boolean
    isGraphQLBackendReachable: boolean
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    isNextJSServerReachable: boolean
    showOfflineQueueDialog?: (queueLength: number) => void
}

export interface NetworkStatusActions {
    updateGraphQLBackendStatus: (isReachable: boolean, isClientOnline?: boolean) => void
}
const NetworkStatusContext = createContext<NetworkStatus | null>(null)
const NetworkStatusActionsContext = createContext<NetworkStatusActions | null>(null)

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
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
    })

    // 版本检查逻辑
    const checkVersion = useCallback((data: any) => {
        try {
            // 检查是否有离线报告数据
            const offlineReports = localStorage.getItem("offline-reports")
            if (!offlineReports) return

            // 检查当前页面是否是 /pwa（考虑 basePath）
            const basePath = typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_BASE_PATH__ || '';
            const pwaPath = `${basePath}/pwa`;
            if (window.location.pathname === pwaPath || window.location.pathname === '/pwa') return

            const serverVersion = data.version
            const lastCacheWarmup = localStorage.getItem("last-cache-warmup")

            if (!lastCacheWarmup || (lastCacheWarmup && serverVersion !== lastCacheWarmup)) {
                console.log("[Version] 检测到新构建版本:", serverVersion, "上次缓存版本:", lastCacheWarmup)

                toast.info("前端版本升级", {
                    id: "serverVersion-pwa",
                    description: "建议访问 /pwa 页面重新缓存，以确保离线报告编制功能",
                    duration: 10000,
                    action: {
                        label: "前往",
                        onClick: () => {
                            window.location.href = pwaPath
                        },
                    },
                })
            }
        } catch (error) {
            // 忽略错误
            console.log("[Version] 版本检查过程中出错:", error)
        }
    }, [])

    // 检查Next.js服务器连通性（现在包含版本检查）
    const checkNextJSServerConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            const response = await fetch(withBasePath('/api/nextLive'), {
                method: "GET",
                cache: "no-cache",
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (response.ok) {
                const data = await response.json()
                // 在成功连接时检查版本，直接使用已获取的数据
                checkVersion(data)
                return true
            }

            return false
        } catch (error) {
            console.warn("Next.js服务器连接检查失败:", error)
            return false
        }
    }, [checkVersion])

    // 检查GraphQL后端连通性
    const checkGraphQLBackendConnectivity = useCallback(async (retries = 1) => {
        // 使用固定的重试间隔，避免依赖 networkStatus 状态导致的循环
        const retryDelay = 15000 // 固定15秒检查一次

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000) // 减少超时时间到5秒
                const backendUrl = process.env.NEXT_PUBLIC_BACK_END
                if (!backendUrl) {
                    setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: false }))
                    return false
                }

                const response = await fetch(`${backendUrl}/actuator/health`, {
                    method: "GET",
                    mode: "cors",
                    cache: "no-cache",
                    signal: controller.signal,
                })
                clearTimeout(timeoutId)
                if (response.ok) {
                    const healthData = await response.json()
                    const dbStatus = healthData.components?.mainDB?.status
                    const isReachable = dbStatus === "UP"
                    // 更新后端可达性状态
                    setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: isReachable }))
                    return isReachable
                }

                // 响应不成功，更新状态为不可达
                setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: false }))

                if (attempt < retries) {
                    console.log(`健康检查失败，第${attempt + 1}次重试...`)
                    await new Promise((resolve) => setTimeout(resolve, retryDelay))
                }
            } catch (error) {
                console.warn(`健康检查尝试${attempt + 1}失败:`, error)
                // 发生错误时，更新状态为不可达
                setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: false }))

                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay))
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
            const connectionType = getConnectionInfo()
            setNetworkStatus((prev) => {
                const isNextJSServerReachable = isClientOnline && prev.isNextJSServerReachable
                // 保持 isGraphQLBackendReachable 不变，不由客户端网络状态决定
                const isOnline = isClientOnline && isNextJSServerReachable && prev.isGraphQLBackendReachable

                return {
                    ...prev,
                    isOnline,
                    isClientOnline,
                    isNextJSServerReachable,
                    // 不更新 isGraphQLBackendReachable，它由 checkGraphQLBackendConnectivity 单独管理
                    lastError: error,
                    lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
                    lastOfflineTime: !isOnline ? new Date() : prev.lastOfflineTime,
                    connectionType,
                }
            })
        },
        [
            checkNextJSServerConnectivity,
            checkGraphQLBackendConnectivity,
            getConnectionInfo,
        ],
    )

    const updateGraphQLBackendStatus = useCallback((isReachable: boolean, isClientOnline = true) => {
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
    }

    useEffect(() => {
        // Service Worker 更新监听
        const handleServiceWorkerUpdate = () => {
            // 检查是否有离线报告数据
            const offlineReports = localStorage.getItem("offline-reports")
            if (!offlineReports) return

            // 检查当前页面是否是 /pwa（考虑 basePath）
            const basePath = typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_BASE_PATH__ || '';
            const pwaPath = `${basePath}/pwa`;
            if (window.location.pathname === pwaPath || window.location.pathname === '/pwa') return

            console.log("[SW] Service Worker 已更新")

            toast.info("应用已更新", {
                description: "建议访问 /pwa 页面重新做预缓存",
                duration: 10000,
                action: {
                    label: "前往",
                    onClick: () => {
                        window.location.href = pwaPath
                    },
                },
            })
        }

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", handleServiceWorkerUpdate)
        }

        return () => {
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.removeEventListener("controllerchange", handleServiceWorkerUpdate)
            }
        }
    }, [])

    useEffect(() => {
        // 初始状态更新 - 只更新客户端网络状态，不影响后端可达性
        updateNetworkStatus(navigator.onLine)
        const handleOnline = () => {
            console.log("Network: 客户端网络在线事件检测到")
            // 只更新客户端网络状态，不直接设置后端可达性
            updateNetworkStatus(true)
            // 立即触发一次后端检查
            checkGraphQLBackendConnectivity()
        }
        const handleOffline = () => {
            console.log("Network: 客户端网络离线事件检测到")
            // 离线时，更新客户端状态并设置后端为不可达
            updateNetworkStatus(false)
            setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: false }))
        }
        // 定期服务器检查
        const serverCheckInterval = print
            ? undefined
            : setInterval(async () => {
                if (navigator.onLine) {
                    const isNextJSReachable = await checkNextJSServerConnectivity()
                    const isGraphQLReachable = await checkGraphQLBackendConnectivity()
                    setNetworkStatus((prev) => ({
                        ...prev,
                        isNextJSServerReachable: isNextJSReachable,
                        isGraphQLBackendReachable: isGraphQLReachable,
                        isOnline: prev.isClientOnline && isNextJSReachable,
                    }))
                }
            }, 120000) // 将检查间隔从40秒增加到120秒（2分钟）

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
    ])

    useEffect(() => {
        const checkInitialQueue = async () => {
            const isGraphQLReachable = navigator.onLine ? await checkGraphQLBackendConnectivity() : false
            setNetworkStatus((prev) => ({
                ...prev,
                isGraphQLBackendReachable: isGraphQLReachable,
            }))
        }
        // 只更新客户端网络状态，不影响后端可达性
        updateNetworkStatus(navigator.onLine)
        // Check initial queue after a short delay
        setTimeout(checkInitialQueue, 1000)
    }, [])

    return (
        <NetworkStatusContext.Provider value={contextValue}>
            <NetworkStatusActionsContext.Provider value={actions}>
                {children}
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