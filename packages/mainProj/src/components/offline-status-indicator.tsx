"use client"

import { useEffect, useState } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { WifiOff } from "lucide-react"

export function OfflineStatusIndicator() {
    const { isOnline } = useNetworkStatus()
    const [showOfflineBar, setShowOfflineBar] = useState(false)

    useEffect(() => {
        setShowOfflineBar(!isOnline)
    }, [isOnline])

    if (!showOfflineBar) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>离线模式 - 正在使用缓存数据</span>
            <button
                onClick={() => window.location.reload()}
                className="ml-4 px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700"
            >
                重试连接
            </button>
        </div>
    )
}
