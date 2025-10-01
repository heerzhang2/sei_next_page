"use client"

import { useEffect, useState } from "react"
import { WifiOff, Database, CloudOff, Clock, AlertTriangle, Send } from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useOfflineQueueManager } from "@/hooks/use-offline-queue-manager"

export function OfflineStatusIndicator() {
    const { isClientOnline, isOnline, isGraphQLBackendReachable, offlineQueue } = useNetworkStatusContext()
    const { totalRequests, pendingCount } = useOfflineQueueManager()
    const [showOfflineBar, setShowOfflineBar] = useState(false)

    useEffect(() => {
        setShowOfflineBar(
            !isClientOnline || !isOnline || !isGraphQLBackendReachable || totalRequests > 0,
        )
    }, [isClientOnline, isOnline, isGraphQLBackendReachable, totalRequests])

    if (!showOfflineBar) return null

    const getStatusMessage = () => {
        if (totalRequests > 0) {
            return {
                icon: Clock,
                message: `离线队列: ${pendingCount}个待处理`,
                color: "bg-blue-100 border-blue-300 text-blue-900",
            }
        }
        if (!isClientOnline) {
            return {
                icon: WifiOff,
                message: "网络离线",
                color: "bg-red-100 border-red-300 text-red-900",
            }
        }
        if (!isGraphQLBackendReachable && !isOnline) {
            return {
                icon: AlertTriangle,
                message: "服务器全部离线",
                color: "bg-red-100 border-red-300 text-red-900",
            }
        }
        if (!isGraphQLBackendReachable) {
            return {
                icon: Database,
                message: "后端服务离线",
                color: "bg-amber-100 border-amber-300 text-amber-900",
            }
        }
        return {
            icon: CloudOff,
            message: "前端服务离线",
            color: "bg-amber-100 border-amber-300 text-amber-900",
        }
    }

    const { icon: Icon, message, color } = getStatusMessage()

    const handleClick = () => {
        if (typeof window !== "undefined") {
            window.location.href = "/offline"
        }
    }

    return (
        <div
            className={`print:hidden fixed top-0 left-1/2 transform -translate-x-1/2 z-50 ${color} px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-b-md shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            style={{ pointerEvents: "auto" }}
            onClick={handleClick}
            title={"离线队列"}
        >
            <Icon className="h-4 w-4" />
            <span>{message}</span>
            {totalRequests > 0 && (
                <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">点击管理</span>
            )}
        </div>
    )
}
