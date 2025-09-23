"use client"

import { useEffect, useState } from "react"
import {WifiOff, Database, CloudOff, Clock, AlertTriangle, CloudLightning} from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

export function OfflineStatusIndicator() {
    const { isClientOnline, isOnline, isGraphQLBackendReachable, offlineQueue } = useNetworkStatusContext()
    const [showOfflineBar, setShowOfflineBar] = useState(false)

    useEffect(() => {
        setShowOfflineBar(!isClientOnline || !isOnline || !isGraphQLBackendReachable)
    }, [isClientOnline, isOnline, isGraphQLBackendReachable])

    if (!showOfflineBar) return null

    const getStatusMessage = () => {
        if (!isClientOnline) {
            return { icon: WifiOff, message: "网络离线" }
        }
        if (!isGraphQLBackendReachable && !isOnline) {
            if (offlineQueue.queueLength > 0) return { icon: CloudLightning, message: "等待同步,无Next服务Java后端都宕机" }
            return { icon: AlertTriangle, message: "无Next服务Java后端都宕机" }
        }
        if (!isGraphQLBackendReachable) {
            if (offlineQueue.queueLength > 0) return { icon: Clock, message: "等待同步,Java后端宕机" }
            return { icon: Database, message: "Java后端宕机" }
        }
        return { icon: CloudOff, message: "无Next服务器" }
    }

    const { icon: Icon, message } = getStatusMessage()

    return (
        <div
            className="print:hidden fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-amber-100 border border-amber-300 text-amber-900 px-1 py-0 text-sm font-medium flex items-center justify-center gap-2 rounded-b-md shadow-sm"
            style={{ pointerEvents: "none" }}
        >
            <Icon className="h-4 w-4" />
        </div>
    )
}
