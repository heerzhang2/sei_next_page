"use client"

import { useEffect, useState } from "react"
import { WifiOff, Database, CloudOff, Clock, AlertTriangle, Activity, Send } from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useOfflineQueueManager } from "@/hooks/use-offline-queue-manager"

export function OfflineStatusIndicator() {
    const { isClientOnline, isOnline, isGraphQLBackendReachable, offlineQueue } = useNetworkStatusContext()
    const { totalRequests, pendingCount, isPaused } = useOfflineQueueManager()
    const [showOfflineBar, setShowOfflineBar] = useState(false)

    const [showEmptyArrayReminder, setShowEmptyArrayReminder] = useState(false)
    const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false)

    useEffect(() => {
        const checkEmptyArrayReminderStatus = () => {
            const reminderElement = document.querySelector("[data-empty-array-reminder]")
            const processingElement = document.querySelector("[data-processing-queue]")

            if (reminderElement) {
                const reminderStatus = reminderElement.getAttribute("data-empty-array-reminder") === "true"
                const processingStatus = processingElement?.getAttribute("data-processing-queue") === "true"

                setShowEmptyArrayReminder(reminderStatus)
                setIsProcessingOfflineQueue(processingStatus)
            }
        }

        // 初始检查
        checkEmptyArrayReminderStatus()

        // 定期检查状态变化
        const interval = setInterval(checkEmptyArrayReminderStatus, 500)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        setShowOfflineBar(
            !isClientOnline || !isOnline || !isGraphQLBackendReachable || totalRequests > 0 || showEmptyArrayReminder,
        )
    }, [isClientOnline, isOnline, isGraphQLBackendReachable, totalRequests, showEmptyArrayReminder])

    if (!showOfflineBar) return null

    const getStatusMessage = () => {
        if (showEmptyArrayReminder && isProcessingOfflineQueue) {
            return {
                icon: Send,
                message: "请勿重新加载页面，正在发送离线请求...",
                color: "bg-blue-200 border-blue-400 text-blue-900 animate-pulse",
            }
        }

        if (totalRequests > 0) {
            if (isPaused) {
                return {
                    icon: Activity,
                    message: `队列已暂停 (${totalRequests}个待处理)`,
                    color: "bg-orange-100 border-orange-300 text-orange-900",
                }
            }
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
        if (showEmptyArrayReminder && isProcessingOfflineQueue) {
            // 可以添加一个toast提示用户等待
            return
        }

        if (typeof window !== "undefined") {
            window.location.href = "/offline"
        }
    }

    return (
        <div
            className={`print:hidden fixed top-0 left-1/2 transform -translate-x-1/2 z-50 ${color} px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-b-md shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            style={{ pointerEvents: "auto" }}
            onClick={handleClick}
            title={showEmptyArrayReminder ? "正在发送离线请求，请勿重新加载页面" : "点击查看详细的离线队列管理"}
        >
            <Icon className="h-4 w-4" />
            <span>{message}</span>
            {totalRequests > 0 && !showEmptyArrayReminder && (
                <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">点击管理</span>
            )}
            {showEmptyArrayReminder && isProcessingOfflineQueue && (
                <div className="ml-2 flex space-x-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
            )}
        </div>
    )
}
