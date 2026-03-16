"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { withBasePath } from '@/lib/tool'

export interface NetworkStatus {
    isClientOnline: boolean         // 表示客户端网络状态（依赖浏览器 navigator.onLine）
    isNextJSServerReachable: boolean | undefined  //表示Next.js服务器在线状态，undefined表示"未知"状态
    isGraphQLBackendReachable: boolean | undefined  //表示Java后端在线状态，undefined表示"未知"状态
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    showOfflineQueueDialog?: (queueLength: number) => void
}

export interface NetworkStatusActions {
    updateGraphQLBackendStatus: (isReachable: boolean) => void
    checkNetworkStatus: () => Promise<{
        isClientOnline: boolean
        isNextJSServerReachable: boolean | undefined
        isGraphQLBackendReachable: boolean | undefined
    }>
}
const NetworkStatusContext = createContext<NetworkStatus | null>(null)
const NetworkStatusActionsContext = createContext<NetworkStatusActions | null>(null)

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")

    // 从 sessionStorage 恢复网络状态
    const getInitialNetworkStatus = useCallback((): NetworkStatus => {
        if (typeof window === "undefined") {
            return {
                lastError: null,
                lastOnlineTime: null,
                lastOfflineTime: null,
                connectionType: null,
                isClientOnline: true,
                isNextJSServerReachable: true,
                isGraphQLBackendReachable: true,
            }
        }

        try {
            const savedStatus = sessionStorage.getItem("network-status")
            if (savedStatus) {
                const parsed = JSON.parse(savedStatus)
                const now = Date.now()
                // 只恢复最近 5 分钟内的状态，避免使用过期的状态
                const MAX_AGE = 5 * 60 * 1000
                if (parsed.timestamp && (now - parsed.timestamp) < MAX_AGE) {
                    console.log("[NetworkStatus] 从 sessionStorage 恢复网络状态:", {
                        isNextJSServerReachable: parsed.isNextJSServerReachable,
                        isGraphQLBackendReachable: parsed.isGraphQLBackendReachable,
                    })
                    return {
                        lastError: null,
                        lastOnlineTime: parsed.lastOnlineTime ? new Date(parsed.lastOnlineTime) : null,
                        lastOfflineTime: parsed.lastOfflineTime ? new Date(parsed.lastOfflineTime) : null,
                        connectionType: null,
                        isClientOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
                        // 从 sessionStorage 恢复时也默认 false，避免使用过期的缓存状态
                        isNextJSServerReachable: parsed.isNextJSServerReachable ?? false,
                        isGraphQLBackendReachable: parsed.isGraphQLBackendReachable ?? false,
                    }
                } else {
                    console.log("[NetworkStatus] sessionStorage 中的状态已过期，使用默认值")
                }
            }
        } catch (error) {
            console.error("[NetworkStatus] 从 sessionStorage 读取状态失败:", error)
        }

        return {
            lastError: null,
            lastOnlineTime: null,
            lastOfflineTime: null,
            connectionType: null,
            isClientOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
            // 初始值设为 undefined，表示"未知"状态，避免在检查完成前误报
            // 只有当检查确认服务器可达时才设置为 true，离线时设置为 false
            isNextJSServerReachable: undefined,
            isGraphQLBackendReachable: undefined,
        }
    }, [])

    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(getInitialNetworkStatus)

    // 保存网络状态到 sessionStorage
    const saveNetworkStatus = useCallback((status: NetworkStatus) => {
        if (typeof window === "undefined") return
        try {
            const toSave = {
                isNextJSServerReachable: status.isNextJSServerReachable,
                isGraphQLBackendReachable: status.isGraphQLBackendReachable,
                lastOnlineTime: status.lastOnlineTime?.toISOString() || null,
                lastOfflineTime: status.lastOfflineTime?.toISOString() || null,
                timestamp: Date.now(),
            }
            sessionStorage.setItem("network-status", JSON.stringify(toSave))
        } catch (error) {
            console.error("[NetworkStatus] 保存状态到 sessionStorage 失败:", error)
        }
    }, [])

    // 包装 setNetworkStatus，自动保存到 sessionStorage
    const setNetworkStatusWithSave = useCallback((updater: React.SetStateAction<NetworkStatus>) => {
        setNetworkStatus((prev) => {
            const newStatus = typeof updater === "function" ? updater(prev) : updater
            saveNetworkStatus(newStatus)
            return newStatus
        })
    }, [saveNetworkStatus])

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
            setNetworkStatusWithSave(prev => ({ ...prev, isGraphQLBackendReachable: false }))
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
                setNetworkStatusWithSave(prev => ({ ...prev, isGraphQLBackendReachable: isReachable }))
                return isReachable
            }

            // 响应不成功，更新状态为不可达
            setNetworkStatusWithSave(prev => ({ ...prev, isGraphQLBackendReachable: false }))
            return false
        } catch (error) {
            console.warn("健康检查失败:", error)
            // 发生错误时，更新状态为不可达
            setNetworkStatusWithSave(prev => ({ ...prev, isGraphQLBackendReachable: false }))
            return false
        }
    }, [setNetworkStatusWithSave])

    // 获取连接信息
    const getConnectionInfo = useCallback(() => {
        if (typeof navigator !== "undefined" && "connection" in navigator) {
            const connection = (navigator as any).connection
            return connection?.effectiveType || connection?.type || null
        }
        return null
    }, [])

    // 更新客户端网络状态
    const updateNetworkStatus = useCallback(
        async (isClientOnline: boolean, error: Error | null = null) => {
            const connectionType = getConnectionInfo()
            setNetworkStatusWithSave((prev) => {
                return {
                    ...prev,
                    isClientOnline,
                    // 不更新 isGraphQLBackendReachable，它由 checkGraphQLBackendConnectivity 单独管理
                    lastError: error,
                    lastOnlineTime: isClientOnline ? new Date() : prev.lastOnlineTime,
                    lastOfflineTime: !isClientOnline ? new Date() : prev.lastOfflineTime,
                    connectionType,
                }
            })
        },
        [setNetworkStatusWithSave, getConnectionInfo],
    )

    const updateGraphQLBackendStatus = useCallback((isReachable: boolean) => {
        setNetworkStatusWithSave((prev) => ({
            ...prev,
            isGraphQLBackendReachable: isReachable,
        }))
    }, [setNetworkStatusWithSave])

    const checkNetworkStatus = useCallback(async () => {
        const isClientOnline = typeof navigator !== "undefined" ? navigator.onLine : false

        // 并行检查 Next.js 前端和 Java 后端
        const [nextjsResult, graphQLResult] = await Promise.all([
            checkNextJSServerConnectivity(),
            checkGraphQLBackendConnectivity()
        ])

        // 更新网络状态
        setNetworkStatusWithSave((prev) => ({
            ...prev,
            isClientOnline,
            isNextJSServerReachable: nextjsResult,
            isGraphQLBackendReachable: graphQLResult,
        }))

        // 通知 Service Worker Next.js 服务器状态变化
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            if (networkStatus.isNextJSServerReachable !== nextjsResult) {
                console.log(`[NetworkStatus][checkNetworkStatus] Next.js 服务器状态变化，通知 SW`)
                navigator.serviceWorker.controller.postMessage({
                    type: 'NEXTJS_SERVER_STATUS_UPDATE',
                    isOnline: nextjsResult,
                    timestamp: Date.now()
                })
            }
        }

        // 返回网络状态，供 page.tsx 使用
        return {
            isClientOnline,
            isNextJSServerReachable: nextjsResult,
            isGraphQLBackendReachable: graphQLResult,
        }
    }, [checkNextJSServerConnectivity, checkGraphQLBackendConnectivity, networkStatus.isNextJSServerReachable, setNetworkStatusWithSave])


    const actions: NetworkStatusActions = {
        updateGraphQLBackendStatus,
        checkNetworkStatus,
    }

    const contextValue: NetworkStatus = {
        ...networkStatus,
    }

    useEffect(() => {
        // 从 Service Worker 获取当前服务器状态
        const fetchServerStatusFromSW = async () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                try {
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data?.type === 'SERVER_STATUS_RESPONSE') {
                            const { isOnline, timestamp } = event.data;
                            console.log(`[NetworkStatus] 从 SW 获取服务器状态: ${isOnline}, 时间戳: ${timestamp}`);
                            setNetworkStatusWithSave(prev => ({
                                ...prev,
                                isNextJSServerReachable: isOnline
                            }));
                        }
                    };
                    
                    navigator.serviceWorker.controller.postMessage(
                        { type: 'GET_SERVER_STATUS' },
                        [messageChannel.port2]
                    );
                } catch (error) {
                    console.error(`[NetworkStatus] 从 SW 获取服务器状态失败:`, error);
                }
            }
        };

        // 组件挂载时立即获取服务器状态
        fetchServerStatusFromSW();

        // Service Worker 消息监听
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            console.log(`[NetworkStatus] 收到 Service Worker 消息:`, event.data);
        if (event.data?.type === 'SERVER_STATUS_UPDATE') {
            const { isOnline, timestamp } = event.data;
            console.log(`[NetworkStatus] 收到服务器状态更新: ${isOnline}, 时间戳: ${timestamp}`);
            console.log(`[NetworkStatus] 更新前 isNextJSServerReachable: ${networkStatus.isNextJSServerReachable}`);
            setNetworkStatusWithSave(prev => {
                console.log(`[NetworkStatus] 更新后 isNextJSServerReachable: ${isOnline}`);
                return {
                    ...prev,
                    isNextJSServerReachable: isOnline
                };
            });
        }
        };

        // 注册 Service Worker 消息监听
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

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
                navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage)
            }
        }
    }, [])

    useEffect(() => {
        // 初始状态更新 - 只更新客户端网络状态，不影响后端可达性
        updateNetworkStatus(navigator.onLine)

        // 组件挂载时立即触发一次后端检查，避免初始状态为 true 时发起不必要的请求
        // 由于初始状态已设为 false，这里立即检查可以快速更新为正确的状态
        if (navigator.onLine) {
            Promise.all([
                checkNextJSServerConnectivity(),
                checkGraphQLBackendConnectivity()
            ]).then(([nextjsResult, graphQLResult]) => {
                setNetworkStatusWithSave((prev) => ({
                    ...prev,
                    isNextJSServerReachable: nextjsResult,
                    isGraphQLBackendReachable: graphQLResult,
                }))
            }).catch(() => {
                // 检查失败时保持 false 状态（默认状态）
            })
        }

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
            setNetworkStatusWithSave(prev => ({ ...prev, isGraphQLBackendReachable: false }))
        }
        // 定期服务器健康检查（Next.js 前端和 Java 后端统一在主线程检查）
        const serverCheckInterval = print
            ? undefined
            : setInterval(async () => {
                if (navigator.onLine) {
                    // 并行检查 Next.js 前端和 Java 后端
                    const [nextjsResult, graphQLResult] = await Promise.all([
                        checkNextJSServerConnectivity(),
                        checkGraphQLBackendConnectivity()
                    ])

                    // 更新 Next.js 服务器状态
                    const prevNextJSStatus = networkStatus.isNextJSServerReachable
                    setNetworkStatusWithSave((prev) => ({
                        ...prev,
                        isNextJSServerReachable: nextjsResult,
                        isGraphQLBackendReachable: graphQLResult,
                    }))

                    // 通知 Service Worker Next.js 服务器状态变化
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                        if (prevNextJSStatus !== nextjsResult) {
                            console.log(`[NetworkStatus] Next.js 服务器状态变化: ${prevNextJSStatus} -> ${nextjsResult}，通知 SW`)
                            navigator.serviceWorker.controller.postMessage({
                                type: 'NEXTJS_SERVER_STATUS_UPDATE',
                                isOnline: nextjsResult,
                                timestamp: Date.now()
                            })
                        }
                    }
                }
            }, 30000) // 检查间隔为30秒，与原来的 SW 间隔保持一致

        const handleConnectionChange = () => {
            const connectionType = getConnectionInfo()
            setNetworkStatusWithSave((prev) => ({
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
        setNetworkStatusWithSave,
        print,
        networkStatus.isNextJSServerReachable,
    ])

    // 移除了第二个 useEffect，避免状态被多次更新
    // 第一个 useEffect 已经包含了初始状态更新和定期检查

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