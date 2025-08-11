"use client"

import { useNetworkStatus } from "@/hooks/use-network-status"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
    const { isOnline, lastError } = useNetworkStatus()

    if (isOnline) {
        return (
            <div className="flex items-center gap-2 text-green-600 text-sm">
                <Wifi className="h-4 w-4" />
                <span>在线</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-red-600 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>离线模式</span>
            {lastError && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <AlertCircle className="h-3 w-3" />
                    <span title={lastError.message}>连接错误</span>
                </div>
            )}
        </div>
    )
}
