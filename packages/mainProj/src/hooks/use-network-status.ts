"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

// 添加离线队列状态接口
export interface OfflineQueueStatus {
    hasPendingMutations: boolean
    queueLength: number
    lastUpdated: Date | null
}

export interface NetworkStatus {
    //客户端网络或浏览器的网络在线判别； 所以isClientOnline是下面两个状态判定的基本前提！
    isClientOnline: boolean
    //前端nextjs服务器是否可以连通的判定
    isOnline: boolean
    isGraphQLBackendReachable: boolean
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    //仅限于在内部使用的状态，nextjs服务链接可用
    isNextJSServerReachable: boolean
    // 新增离线队列状态
    offlineQueue: OfflineQueueStatus
}

// 检查离线队列的函数
const checkOfflineQueue = async (): Promise<OfflineQueueStatus> => {
    try {
        if (typeof window === "undefined") {
            return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
        }

        // 从 localStorage 或 indexedDB 读取离线队列元数据
        const metadata = localStorage.getItem('urql-metadata')
        if (!metadata) {
            return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
        }

        const requests = JSON.parse(metadata)
        return {
            hasPendingMutations: requests.length > 0,
            queueLength: requests.length,
            lastUpdated: new Date()
        }
    } catch (error) {
        console.warn('检查离线队列失败:', error)
        return { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
    }
}

/**注意 isOnline 和 isClientOnline 的意思的差别！ 后者isClientOnline才是浏览器在线与否的意思。 isOnline是前端服务器在线可用的意思。 */
export function useNetworkStatus(): NetworkStatus {
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
        offlineQueue: { hasPendingMutations: false, queueLength: 0, lastUpdated: null }
    })

    // 添加检查离线队列的函数
    const updateOfflineQueueStatus = useCallback(async () => {
        const queueStatus = await checkOfflineQueue()
        setNetworkStatus(prev => ({
            ...prev,
            offlineQueue: queueStatus
        }))
        return queueStatus
    }, [])

    // 添加显示刷新提示的函数
    const showRefreshPrompt = useCallback((queueLength: number) => {
        toast.info('网络已恢复，有待同步的更改', {
            description: `检测到 ${queueLength} 个离线操作需要同步。刷新页面立即同步？可暂时不刷新，但是必须尽快手动刷新才能确保报告都保存`,
            duration: 99999000,
            dismissible: false,
            action: {
                label: '刷新',
                onClick: () => {
                    window.location.reload()
                }
            },
            actionButtonStyle: {
                backgroundColor: '#10b981',
                color: 'white'
            }
        })
    }, [])

    const checkNextJSServerConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

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
            const timeoutId = setTimeout(() => controller.abort(), 20000)

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

            // 如果后端从离线恢复在线，检查离线队列
            if (wasBackendOffline && isBackendNowOnline && isClientOnline) {
                const queueStatus = await updateOfflineQueueStatus()
                if (queueStatus.hasPendingMutations && queueStatus.queueLength > 0) {
                    showRefreshPrompt(queueStatus.queueLength)
                }
            }
        },
        [checkNextJSServerConnectivity, checkGraphQLBackendConnectivity, getConnectionInfo, updateOfflineQueueStatus, showRefreshPrompt, networkStatus.isGraphQLBackendReachable]
    )

    useEffect(() => {
        updateNetworkStatus(navigator.onLine)
        // 初始检查离线队列
        updateOfflineQueueStatus()

        const handleOnline = () => {
            console.log("Network: 客户端网络在线事件检测到")
            updateNetworkStatus(true)
        }

        const handleOffline = () => {
            console.log("Network: 客户端网络离线事件检测到")
            updateNetworkStatus(false)
        }
        //确保执行时间短于定时器时间间隔： 60秒一次的。
        const serverCheckInterval = print ? undefined : setInterval(async () => {
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

                // 如果后端从离线恢复在线，提示用户
                if (wasBackendOffline && isBackendNowOnline) {
                    const queueStatus = await checkOfflineQueue()
                    if (queueStatus.hasPendingMutations && queueStatus.queueLength > 0) {
                        showRefreshPrompt(queueStatus.queueLength)
                    }
                }
            }
        }, 60000)

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
            if (serverCheckInterval) clearInterval(serverCheckInterval)

            if (typeof navigator !== "undefined" && "connection" in navigator) {
                const connection = (navigator as any).connection
                connection?.removeEventListener("change", handleConnectionChange)
            }
        }
    }, [updateNetworkStatus, checkNextJSServerConnectivity, checkGraphQLBackendConnectivity, getConnectionInfo, print, updateOfflineQueueStatus, showRefreshPrompt])

    return networkStatus
}

export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
    console.warn("subscribeToNetworkStatus is deprecated, use useNetworkStatus hook instead")
    return () => {} // 返回空的取消订阅函数
}
