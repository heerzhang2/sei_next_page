"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"

export function TokenRefreshOverlay() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(null)

    useEffect(() => {
        const checkRefreshStatus = () => {
            const refreshing = sessionStorage.getItem("token_refreshing")
            if (refreshing === "true") {
                setIsRefreshing(true)
                setStartTime(Date.now())
            }
        }

        checkRefreshStatus()

        const handleRefreshStart = () => {
            console.log("[TokenRefreshOverlay] Token刷新开始，显示提示框")
            sessionStorage.setItem("token_refreshing", "true")
            setIsRefreshing(true)
            setStartTime(Date.now())
        }

        const handleRefreshComplete = () => {
            console.log("[TokenRefreshOverlay] Token刷新完成，隐藏提示框")
            sessionStorage.removeItem("token_refreshing")
            setIsRefreshing(false)
            setStartTime(null)
        }

        window.addEventListener("token:refresh-start", handleRefreshStart)
        window.addEventListener("token:refreshed", handleRefreshComplete)
        window.addEventListener("token:refresh-failed", handleRefreshComplete)

        return () => {
            window.removeEventListener("token:refresh-start", handleRefreshStart)
            window.removeEventListener("token:refreshed", handleRefreshComplete)
            window.removeEventListener("token:refresh-failed", handleRefreshComplete)
        }
    }, [])

    useEffect(() => {
        if (!isRefreshing || !startTime) return

        const timeout = setTimeout(() => {
            console.log("[TokenRefreshOverlay] 30秒超时，自动关闭提示框")
            handleManualClose()
        }, 30000)

        return () => clearTimeout(timeout)
    }, [isRefreshing, startTime])

    const handleManualClose = () => {
        console.log("[TokenRefreshOverlay] 用户手动关闭提示框")
        sessionStorage.removeItem("token_refreshing")
        setIsRefreshing(false)
        setStartTime(null)
    }

    useEffect(() => {
        if (!isRefreshing) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = "正在刷新身份验证，请勿关闭或刷新页面！"
            return e.returnValue
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [isRefreshing])

    if (!isRefreshing) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4 shadow-lg border-2 border-blue-300 dark:border-blue-700 max-w-md">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">正在刷新身份验证</h3>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">请勿刷新或关闭页面...</p>
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">⚠️ 刷新页面可能导致认证失败</p>
                </div>
                <button
                    onClick={handleManualClose}
                    className="flex-shrink-0 rounded-md p-1 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    aria-label="关闭"
                >
                    <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
            </div>
        </div>
    )
}
