"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Loader2, X, RefreshCw } from "lucide-react"

export function TokenRefreshOverlay() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [showReloadConfirm, setShowReloadConfirm] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // 使用 ref 存储状态，避免闭包问题
    const isRefreshingRef = useRef(isRefreshing)
    const startTimeRef = useRef(startTime)
    
    useEffect(() => {
        isRefreshingRef.current = isRefreshing
        startTimeRef.current = startTime
    }, [isRefreshing, startTime])

    // 清理超时定时器的辅助函数
    const clearTimeoutRef = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    // 处理刷新完成的函数
    const handleRefreshComplete = useCallback(() => {
        console.log("[TokenRefreshOverlay] Token刷新完成，隐藏提示框")
        sessionStorage.removeItem("token_refreshing")
        clearTimeoutRef()
        setIsRefreshing(false)
        setStartTime(null)
        setShowReloadConfirm(false)
    }, [clearTimeoutRef])

    useEffect(() => {
        // 检查是否已经有正在进行的刷新（页面刷新后恢复状态）
        const checkRefreshStatus = () => {
            const refreshing = sessionStorage.getItem("token_refreshing")
            if (refreshing === "true") {
                console.log("[TokenRefreshOverlay] 检测到正在进行的token刷新，恢复显示")
                setIsRefreshing(true)
                setStartTime(Date.now())
            }
        }

        checkRefreshStatus()

        const handleRefreshStart = () => {
            console.log("[TokenRefreshOverlay] Token刷新开始，显示提示框")
            sessionStorage.setItem("token_refreshing", "true")
            clearTimeoutRef()
            setIsRefreshing(true)
            setStartTime(Date.now())
        }

        // 使用捕获阶段监听，确保能收到事件
        window.addEventListener("token:refresh-start", handleRefreshStart, true)
        window.addEventListener("token:refreshed", handleRefreshComplete, true)
        window.addEventListener("token:refresh-failed", handleRefreshComplete, true)

        return () => {
            window.removeEventListener("token:refresh-start", handleRefreshStart, true)
            window.removeEventListener("token:refreshed", handleRefreshComplete, true)
            window.removeEventListener("token:refresh-failed", handleRefreshComplete, true)
            clearTimeoutRef()
        }
    }, [handleRefreshComplete, clearTimeoutRef])

    useEffect(() => {
        if (!isRefreshing || !startTime) return

        // 超时时间从30秒缩短到5秒
        // Token刷新API正常响应时间<1秒，5秒足够完成
        // 如果5秒内未完成，说明确实有问题，让用户尽快知道
        clearTimeoutRef()
        timeoutRef.current = setTimeout(() => {
            console.log("[TokenRefreshOverlay] 5秒超时，token刷新可能卡住")
            // 显示确认对话框，让用户选择是否刷新页面
            console.log("[TokenRefreshOverlay] 显示刷新确认对话框")
            setShowReloadConfirm(true)
        }, 5000)

        return () => clearTimeoutRef()
    }, [isRefreshing, startTime, clearTimeoutRef])

    const handleReloadConfirm = () => {
        console.log("[TokenRefreshOverlay] 用户确认刷新页面")
        window.location.reload()
    }

    const handleReloadCancel = () => {
        console.log("[TokenRefreshOverlay] 用户取消刷新页面")
        setShowReloadConfirm(false)
    }

    const handleManualClose = () => {
        console.log("[TokenRefreshOverlay] 用户手动关闭提示框")
        // 用户手动关闭也触发失败事件，避免操作卡住
        window.dispatchEvent(new CustomEvent("token:refresh-failed"))
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

    // 显示刷新确认对话框
    if (showReloadConfirm) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
                <div className="mx-4 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                            <RefreshCw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            认证刷新超时
                        </h3>
                    </div>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                        Token 刷新过程耗时过长，可能需要刷新页面来恢复认证状态。
                        <br /><br />
                        点击"刷新页面"将重新加载页面，未保存的数据可能会丢失。
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={handleReloadCancel}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 
                                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                                       transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleReloadConfirm}
                            className="px-4 py-2 rounded-md text-sm font-medium text-white 
                                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 
                                       transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            刷新页面
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!isRefreshing) return null

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4 shadow-lg border-2 border-blue-300 dark:border-blue-700 max-w-md">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">正在刷新身份验证</h3>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">正在尝试刷新登录状态...</p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">⏱️ 最多等待5秒</p>
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
