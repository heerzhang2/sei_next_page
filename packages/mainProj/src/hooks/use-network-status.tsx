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

// 检查变更请求离线队列
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
        toast.warning(<div className="bg-white border border-gray-200 shadow-xl rounded-lg p-1 max-w-md w-full mx-1">
                    <h3 className="text-base font-semibold text-red-700 mb-1 text-center">
                        网络已恢复，有待同步的更改
                    </h3>
                    <p className="text-sm text-gray-600 mb-1 text-center">
                        检测到 {queueLength} 个离线操作需要同步。刷新页面立即同步？
                        可暂时不刷新，但是必须尽快手动刷新才能确保报告都保存
                    </p>
                    <div className="flex justify-center gap-x-4">
                        <button
                            onClick={() => {
                                window.location.reload();
                                toast.dismiss();
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-1 rounded-md transition-colors"
                        >
                            立即刷新
                        </button>
                        <button
                            onClick={() => toast.dismiss()}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-1 rounded-md transition-colors"
                        >
                            稍后处理
                        </button>
                    </div>
                </div>,
            {
                duration: 99999000,
                dismissible: false,
                closeButton: true,
                position: 'top-center'
            }
        )
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

    const checkGraphQLBackendConnectivity = useCallback(async (retries = 2) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const backendUrl = process.env.NEXT_PUBLIC_BACK_END;
                if (!backendUrl) return false;

                const response = await fetch(`${backendUrl}/actuator/health`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    mode: "cors", // 明确指定 CORS 模式
                    credentials: "include", // 如果需要发送 cookie/认证信息
                    cache: "no-cache",
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const healthData = await response.json();
                    const dbStatus = healthData.components?.db?.components?.hikariDataSource?.status
                                                || healthData.components?.db?.status;
                    return dbStatus === 'UP';
                }

                if (attempt < retries) {
                    console.log(`健康检查失败，第${attempt + 1}次重试...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }

            } catch (error) {
                console.warn(`健康检查尝试${attempt + 1}失败:`, error);
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }
        return false;
    }, []);

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

    //预防网络短暂保存失败的，然后很快恢复了，出现'urql-metadata'里面存在等待提交的变更，但无法等待isNextJSServerReachable从false变化为true的消息出发检查机制；
    useEffect(() => {
        const checkOfflineQueueInterval = setInterval(async () => {
            if (networkStatus.isGraphQLBackendReachable) {
                const queueStatus = await updateOfflineQueueStatus();
                if (queueStatus.hasPendingMutations && queueStatus.queueLength > 0) {
                    showRefreshPrompt(queueStatus.queueLength);
                }
            }
        }, 30000);
        return () => clearInterval(checkOfflineQueueInterval);
    }, [networkStatus.isGraphQLBackendReachable, updateOfflineQueueStatus, showRefreshPrompt]);

    return networkStatus
}

export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
    console.warn("subscribeToNetworkStatus is deprecated, use useNetworkStatus hook instead")
    return () => {} // 返回空的取消订阅函数
}
