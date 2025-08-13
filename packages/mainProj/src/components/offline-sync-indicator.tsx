"use client"

import { useEffect, useState } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"

export function OfflineSyncIndicator() {
    const networkStatus = useNetworkStatus()
    const [pendingChanges, setPendingChanges] = useState(0)
    const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

    useEffect(() => {
        const handleDataChange = () => {
            setPendingChanges((prev) => prev + 1)
        }

        const handleSyncStart = () => {
            setSyncStatus("syncing")
        }

        const handleSyncSuccess = () => {
            setSyncStatus("success")
            setPendingChanges(0)
            setTimeout(() => setSyncStatus("idle"), 3000)
        }

        const handleSyncError = () => {
            setSyncStatus("error")
            setTimeout(() => setSyncStatus("idle"), 5000)
        }

        const handleNetworkRestored = () => {
            if (pendingChanges > 0) {
                setSyncStatus("syncing")
            }
        }

        window.addEventListener("offline-data-change", handleDataChange)
        window.addEventListener("sync-start", handleSyncStart)
        window.addEventListener("sync-success", handleSyncSuccess)
        window.addEventListener("sync-error", handleSyncError)
        window.addEventListener("network-restored", handleNetworkRestored)

        return () => {
            window.removeEventListener("offline-data-change", handleDataChange)
            window.removeEventListener("sync-start", handleSyncStart)
            window.removeEventListener("sync-success", handleSyncSuccess)
            window.removeEventListener("sync-error", handleSyncError)
            window.removeEventListener("network-restored", handleNetworkRestored)
        }
    }, [pendingChanges])

    if (!networkStatus.isOnline && pendingChanges === 0) {
        return (
            <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm z-50">
                📱 离线模式 - 数据将保存在本地
            </div>
        )
    }

    if (pendingChanges > 0) {
        return (
            <div
                className={`fixed top-0 left-0 right-0 text-white text-center py-2 text-sm z-50 ${
                    syncStatus === "syncing"
                        ? "bg-blue-500"
                        : syncStatus === "success"
                            ? "bg-green-500"
                            : syncStatus === "error"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                }`}
            >
                {syncStatus === "syncing" && "🔄 正在同步数据..."}
                {syncStatus === "success" && "✅ 数据同步成功"}
                {syncStatus === "error" && "❌ 数据同步失败，将稍后重试"}
                {syncStatus === "idle" && `📝 有 ${pendingChanges} 项更改待同步`}
            </div>
        )
    }

    return null
}
