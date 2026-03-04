"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { withBasePath } from '@/lib/tool'

export interface NetworkStatus {
    isClientOnline: boolean         // 表示客户端网络状态（依赖浏览器 navigator.onLine）
    isOnline: boolean               //表示整体在线状态（只依赖nextjs前端服务器）
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
    checkNetworkStatus: () => Promise<{
        isClientOnline: boolean
        isNextJSServerReachable: boolean
        isGraphQLBackendReachable: boolean
    }>
}
const NetworkStatusContext = createContext<NetworkStatus | null>(null)
const NetworkStatusActionsContext = createContext<NetworkStatusActions | null>(null)

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        lastError: null,
        lastOnlineTime: null,
        lastOfflineTime: null,
        connectionType: null,
        isClientOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        isOnline: true,
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
            
            // 使用当前页面的源，确保直接访问 Next.js 服务器
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const url = `${baseUrl}${withBasePath('/api/nextLive')}`
            
            // 添加时间戳参数，确保绕过 Service Worker 的缓存
            const timestamp = Date.now()
            const urlWithTimestamp = `${url}?t=${timestamp}`
            
            const response = await fetch(urlWithTimestamp, {
                method: "GET",
                cache: "no-cache",
                signal: controller.signal,
                // 添加 credentials，确保请求包含认证信息
                credentials: 'same-origin',
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
    const checkGraphQLBackendConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 超时时间5秒
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
            return false
        } catch (error) {
            console.warn("健康检查失败:", error)
            // 发生错误时，更新状态为不可达
            setNetworkStatus(prev => ({ ...prev, isGraphQLBackendReachable: false }))
            return false
        }
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
                // 注意：isOnline 只依赖前端服务器，不依赖 Java 后端，避免后端健康检查阻塞前端状态显示
                const isOnline = isClientOnline && isNextJSServerReachable

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
            isOnline: isClientOnline && prev.isNextJSServerReachable, // 不依赖 GraphQL 后端状态
            lastOnlineTime: isReachable && isClientOnline ? new Date() : prev.lastOnlineTime,
            lastOfflineTime: !isReachable || !isClientOnline ? new Date() : prev.lastOfflineTime,
        }))
    }, [])

    const checkNetworkStatus = useCallback(async () => {
        const isClientOnline = typeof navigator !== "undefined" ? navigator.onLine : false
        
        // 独立并同时发起三个检查
        const [isNextJSServerReachable, isGraphQLBackendReachable] = await Promise.allSettled([
            checkNextJSServerConnectivity(),
            checkGraphQLBackendConnectivity()
        ])
        
        // 提取检查结果
        const nextJSResult = isNextJSServerReachable.status === "fulfilled" ? isNextJSServerReachable.value : false
        const graphQLResult = isGraphQLBackendReachable.status === "fulfilled" ? isGraphQLBackendReachable.value : false
        
        // 更新网络状态
        // 注意：isOnline 现在只依赖前端服务器状态，不依赖 Java 后端
        // 这样前端服务器的可用状态可以立即反映，不会被后端健康检查阻塞
        setNetworkStatus((prev) => ({
            ...prev,
            isClientOnline,
            isNextJSServerReachable: nextJSResult,
            isGraphQLBackendReachable: graphQLResult,
            isOnline: isClientOnline && nextJSResult, // 移除 isGraphQLBackendReachable 依赖
        }))

        // 返回网络状态，供 page.tsx 使用
        return {
            isClientOnline,
            isNextJSServerReachable: nextJSResult,
            isGraphQLBackendReachable: graphQLResult,
        }
    }, [checkNextJSServerConnectivity, checkGraphQLBackendConnectivity])


    const actions: NetworkStatusActions = {
        updateGraphQLBackendStatus,
        checkNetworkStatus,
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
                    await checkNetworkStatus()
                }
            }, 40000) // 检查间隔为40秒

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