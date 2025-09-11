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
            return { icon: WifiOff, message: "网络离线" }
        }
        if (!isOnline) {
            return { icon: Server, message: "Next服务器无法连接" }
        }
        if (!isGraphQLBackendReachable) {
            if(offlineQueue.queueLength>0)
                return { icon: Database, message: "等待同步" }
            return { icon: Database, message: "后端数据库无法连接" }
        }
        return { icon: WifiOff, message: "离线模式" }
    }

    const { icon: Icon, message } = getStatusMessage()

    return (
        <div className="print:hidden fixed top-0 left-0 right-0 z-50 text-amber-900 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2"
             style={{ pointerEvents: 'none' }}
        >
            <Icon className="h-4 w-4" />
            <span>{message}</span>
        </div>
    )
}
