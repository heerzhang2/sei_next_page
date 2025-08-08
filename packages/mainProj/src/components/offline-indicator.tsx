"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface NetworkStatus {
    isOnline: boolean
    lastError: Error | null
}

export function OfflineIndicator() {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: navigator?.onLine ?? true,
        lastError: null,
    })
    const [showIndicator, setShowIndicator] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setNetworkStatus({ isOnline: true, lastError: null })
            setShowIndicator(true)
            // 3秒后隐藏"已恢复"提示
            setTimeout(() => setShowIndicator(false), 3000)
        }

        const handleOffline = () => {
            setNetworkStatus({ isOnline: false, lastError: null })
            setShowIndicator(true)
        }

        const handleUrqlOffline = (event: CustomEvent) => {
            setNetworkStatus({
                isOnline: false,
                lastError: new Error(event.detail?.message || "网络连接失败")
            })
            setShowIndicator(true)
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)
        window.addEventListener("urql:offline", handleUrqlOffline as EventListener)

        // 初始状态检查
        if (!navigator.onLine) {
            setShowIndicator(true)
        }

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
            window.removeEventListener("urql:offline", handleUrqlOffline as EventListener)
        }
    }, [])

    if (!showIndicator && networkStatus.isOnline) return null

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300",
                networkStatus.isOnline
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}
        >
            {networkStatus.isOnline ? (
                <>
                    <Wifi className="h-4 w-4" />
                    <span>网络已恢复</span>
                </>
            ) : (
                <>
                    {networkStatus.lastError ? (
                        <AlertCircle className="h-4 w-4" />
                    ) : (
                        <WifiOff className="h-4 w-4" />
                    )}
                    <span>离线模式</span>
                </>
            )}
        </div>
    )
}
