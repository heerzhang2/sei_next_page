"use client"

import { useState, useEffect, useCallback } from "react"

export interface NetworkStatus {
    //客户端网络或浏览器的网络在线判别； 所以isClientOnline是下面两个状态判定的基本前提！
    isClientOnline: boolean
    //前端nextjs服务器是否可以连通的判定
    isOnline: boolean
    //Java后端服务的连通性判定
    isGraphQLBackendReachable: boolean

    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    //仅限于在内部使用的状态，nextjs服务链接可用
    isNextJSServerReachable: boolean
}
/**注意 isOnline 和 isClientOnline 的意思的差别！ 后者isClientOnline才是浏览器在线与否的意思。 isOnline是前端服务器在线可用的意思。
 * v0dev竟然没有修改相关的关联代码输出；
 * */
export function useNetworkStatus(): NetworkStatus {
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

    const checkNextJSServerConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

            const response = await fetch("/api/health", {
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

    const checkGraphQLBackendConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000) // 8秒超时

            const backendUrl = process.env.NEXT_PUBLIC_BACK_END
            if (!backendUrl) return false

            const response = await fetch(`${backendUrl}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: "{ __typename }",
                }),
                cache: "no-cache",
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            return response.ok
        } catch (error) {
            console.warn("GraphQL后端连接检查失败:", error)
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
        async (isClientOnline: boolean, error: Error | null = null) => {
            const isNextJSServerReachable = isClientOnline ? await checkNextJSServerConnectivity() : false
            const isGraphQLBackendReachable = isClientOnline ? await checkGraphQLBackendConnectivity() : false
            const connectionType = getConnectionInfo()

            const isOnline = isClientOnline && isNextJSServerReachable

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
        [checkNextJSServerConnectivity, checkGraphQLBackendConnectivity, getConnectionInfo],
    )

    useEffect(() => {
        updateNetworkStatus(navigator.onLine)

        const handleOnline = () => {
            console.log("Network: 客户端网络在线事件检测到")
            updateNetworkStatus(true)
        }

        const handleOffline = () => {
            console.log("Network: 客户端网络离线事件检测到")
            updateNetworkStatus(false)
        }

        const serverCheckInterval = setInterval(async () => {
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
        }, 60000) // 改为每60秒检查一次，减少网络请求频率

        const handleConnectionChange = () => {
            const connectionType = getConnectionInfo()
            setNetworkStatus((prev) => ({
                ...prev,
                connectionType,
            }))
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

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
    }, [updateNetworkStatus, checkNextJSServerConnectivity, checkGraphQLBackendConnectivity, getConnectionInfo])

    return networkStatus
}

export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
    console.warn("subscribeToNetworkStatus is deprecated, use useNetworkStatus hook instead")
    return () => {} // 返回空的取消订阅函数
}
