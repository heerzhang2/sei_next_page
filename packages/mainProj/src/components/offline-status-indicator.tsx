"use client"

import { useEffect, useState } from "react"
import { WifiOff, Server, Database } from "lucide-react"
import {useNetworkStatusContext} from "@/contexts/network-status-context";

export function OfflineStatusIndicator() {
    const { isClientOnline, isOnline, isGraphQLBackendReachable, offlineQueue } = useNetworkStatusContext()
    const [showOfflineBar, setShowOfflineBar] = useState(false)

    useEffect(() => {
        setShowOfflineBar(!isClientOnline || !isOnline || !isGraphQLBackendReachable)
    }, [isClientOnline, isOnline, isGraphQLBackendReachable])

    if (!showOfflineBar) return null

    const getStatusMessage = () => {
        if (!isClientOnline) {
            return { icon: WifiOff, message: "客户端网络离线 - 正在使用缓存数据" }
        }
        if (!isOnline) {
            return { icon: Server, message: "Next.js服务器无法连接 - 正在使用缓存数据" }
        }
        if (!isGraphQLBackendReachable) {
            return { icon: Database, message: "后端数据库无法连接 - 正在使用缓存数据" }
        }
        return { icon: WifiOff, message: "离线模式 - 正在使用缓存数据" }
    }

    const { icon: Icon, message } = getStatusMessage()

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{message}</span>
            <span>有{offlineQueue.queueLength}个离线操作等待同步</span>
            <button
                onClick={() => window.location.reload()}
                className="ml-4 px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700"
            >
              尝试重试连接
            </button>
        </div>
    )
}
