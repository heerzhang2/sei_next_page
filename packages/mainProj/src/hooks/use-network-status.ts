"use client"

import { useState, useEffect, useCallback } from "react"

export interface NetworkStatus {
    isOnline: boolean
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    isServerReachable: boolean
}

export function useNetworkStatus(): NetworkStatus {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        lastError: null,
        lastOnlineTime: null,
        lastOfflineTime: null,
        connectionType: null,
        isServerReachable: true,
    })

    const checkServerConnectivity = useCallback(async () => {
        try {
            const response = await fetch("/api/health", {
                method: "HEAD",
                cache: "no-cache",
                signal: AbortSignal.timeout(5000), // 5秒超时
            })
            return response.ok
        } catch (error) {
            console.warn("Server connectivity check failed:", error)
            return false
        }
    }, [])

    const getConnectionInfo = useCallback(() => {
        if (typeof navigator !== "undefined" && "connection" in navigator) {
            const connection = (navigator as any).connection
            return connection?.effectiveType || connection?.type || null
        }
        return null
    }, [])

    const updateNetworkStatus = useCallback(
        async (isOnline: boolean, error: Error | null = null) => {
            const isServerReachable = isOnline ? await checkServerConnectivity() : false
            const connectionType = getConnectionInfo()

            setNetworkStatus((prev) => ({
                ...prev,
                isOnline,
                lastError: error,
                lastOnlineTime: isOnline ? new Date() : prev.lastOnlineTime,
                lastOfflineTime: !isOnline ? new Date() : prev.lastOfflineTime,
                connectionType,
                isServerReachable,
            }))
        },
        [checkServerConnectivity, getConnectionInfo],
    )

    useEffect(() => {
        updateNetworkStatus(navigator.onLine)

        const handleOnline = () => {
            console.log("Network: Online event detected")
            updateNetworkStatus(true)
        }

        const handleOffline = () => {
            console.log("Network: Offline event detected")
            updateNetworkStatus(false)
        }

        const serverCheckInterval = setInterval(async () => {
            if (navigator.onLine) {
                const isServerReachable = await checkServerConnectivity()
                setNetworkStatus((prev) => ({
                    ...prev,
                    isServerReachable,
                }))
            }
        }, 30000) // 每30秒检查一次

        const handleConnectionChange = () => {
            const connectionType = getConnectionInfo()
            setNetworkStatus((prev) => ({
                ...prev,
                connectionType,
            }))
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // 监听连接类型变化
        if (typeof navigator !== "undefined" && "connection" in navigator) {
            const connection = (navigator as any).connection
            connection?.addEventListener("change", handleConnectionChange)
        }

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
            clearInterval(serverCheckInterval)

            if (typeof navigator !== "undefined" && "connection" in navigator) {
                const connection = (navigator as any).connection
                connection?.removeEventListener("change", handleConnectionChange)
            }
        }
    }, [updateNetworkStatus, checkServerConnectivity, getConnectionInfo])

    return networkStatus
}

export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
    // 这是一个兼容性函数，用于替代原来的 graphql-component 导入
    console.warn("subscribeToNetworkStatus is deprecated, use useNetworkStatus hook instead")
    return () => {} // 返回空的取消订阅函数
}

export const getNetworkStatus = (): NetworkStatus => {
    // 这是一个兼容性函数，用于替代原来的 graphql-component 导入
    console.warn("getNetworkStatus is deprecated, use useNetworkStatus hook instead")
    return {
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        lastError: null,
        lastOnlineTime: null,
        lastOfflineTime: null,
        connectionType: null,
        isServerReachable: true,
    }
}
