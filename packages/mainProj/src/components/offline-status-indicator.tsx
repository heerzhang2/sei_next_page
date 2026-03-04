"use client"

import { useEffect, useState } from "react"
import { WifiOff, Database, CloudOff, AlertTriangle } from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { withBasePath } from "@/lib/tool"

export function OfflineStatusIndicator() {
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatusContext()
    const [showOfflineBar, setShowOfflineBar] = useState(false)
    const [isInitialCheck, setIsInitialCheck] = useState(true)

    const [showEmptyArrayReminder, setShowEmptyArrayReminder] = useState(false)
    const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false)

    useEffect(() => {
        const handleEmptyArrayReminder = (event: CustomEvent) => {
            const { show } = event.detail
            console.log("[OfflineStatusIndicator] 收到空数组提醒事件:", show)
            setShowEmptyArrayReminder(show)
        }

        const handleProcessingQueue = (event: CustomEvent) => {
            const { processing, total } = event.detail
            console.log("[OfflineStatusIndicator] 收到队列处理事件:", processing, "总数:", total)
            setIsProcessingOfflineQueue(processing)
            if (!processing) {
                setShowEmptyArrayReminder(false)
            }
        }

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

        // 监听自定义事件
        window.addEventListener("graphql-empty-array-reminder", handleEmptyArrayReminder as EventListener)
        window.addEventListener("graphql-processing-queue", handleProcessingQueue as EventListener)

        // 保留原有的轮询检查作为备用
        checkEmptyArrayReminderStatus()
        const interval = setInterval(checkEmptyArrayReminderStatus, 2000)

        return () => {
            window.removeEventListener("graphql-empty-array-reminder", handleEmptyArrayReminder as EventListener)
            window.removeEventListener("graphql-processing-queue", handleProcessingQueue as EventListener)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        setShowOfflineBar(
            !isClientOnline || !isOnline || !isGraphQLBackendReachable || showEmptyArrayReminder,
        )
        
        // 如果所有状态都已初始化（不再是 undefined），则标记初始检查完成
        if (isClientOnline !== undefined && isOnline !== undefined && isGraphQLBackendReachable !== undefined) {
            setIsInitialCheck(false)
        }
    }, [isClientOnline, isOnline, isGraphQLBackendReachable, showEmptyArrayReminder])

    if (!showOfflineBar) return null

    const getStatusMessage = () => {
        // 如果是初始检查阶段，显示"状态核实中"
        if (isInitialCheck) {
            return {
                icon: AlertTriangle,
                message: "核实中",
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
            window.location.href = withBasePath("/offline")
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
        </div>
    )
}
