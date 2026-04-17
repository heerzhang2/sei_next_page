"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { WifiOff, Database, CloudOff, AlertTriangle, Loader2 } from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { withBasePath } from "@/lib/tool"

export function OfflineStatusIndicator() {
    const params = useParams()
    const action = params?.action as string | undefined
    const { isClientOnline, isNextJSServerReachable, isGraphQLBackendReachable } = useNetworkStatusContext()
    const [showMessage, setShowMessage] = useState(false)
    const [isCheckingStatus, setIsCheckingStatus] = useState(true)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isMediumScreen, setIsMediumScreen] = useState(false)
    const [showEmptyArrayReminder, setShowEmptyArrayReminder] = useState(false)
    const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false)
    const [hasOfflineStatus, setHasOfflineStatus] = useState(false)

    // 用于控制消息显示的定时器
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
    // 用于跟踪上次保存的网络状态
    const lastSavedStatusRef = useRef<string | null>(null)
    // 跟踪是否已经从 sessionStorage 恢复了状态
    const hasRestoredFromSessionStorage = useRef(false)
    // 用于控制检查状态定时器
    const checkStatusTimerRef = useRef<NodeJS.Timeout | null>(null)

    // 检测屏幕尺寸
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            setIsSmallScreen(width < 768 || height < 768)
            // 检测中等屏幕: 1024px <= width < 1280px
            setIsMediumScreen(width >= 1024 && width < 1280)
        }
        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    // 监听网络状态变化，控制消息显示
    useEffect(() => {
        // 清除之前的定时器
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }

        // 计算当前是否有离线状态
        // 注意：undefined 表示"未知"状态，不应该算作离线
        const isNextJSOnline = isNextJSServerReachable === true
        const isGraphQLOnline = isGraphQLBackendReachable === true
        const isClientNetworkOnline = isClientOnline === true

        const offline = (!isClientNetworkOnline || !isNextJSOnline || !isGraphQLOnline || showEmptyArrayReminder)

        setHasOfflineStatus(offline)

        // 检查是否从 sessionStorage 恢复了状态
        const sessionStorageStatus = sessionStorage.getItem('network-status')
        if (sessionStorageStatus && !hasRestoredFromSessionStorage.current) {
            hasRestoredFromSessionStorage.current = true
            // 从 sessionStorage 恢复后，立即开始检查，并保持"检查中"状态
            checkStatusTimerRef.current = setTimeout(() => {
                setIsCheckingStatus(false)
            }, 2000) // 给检查2秒时间完成
        } else if (!hasRestoredFromSessionStorage.current && isNextJSServerReachable !== undefined && isGraphQLBackendReachable !== undefined) {
            // 如果没有从 sessionStorage 恢复，且状态已确定，停止检查
            setIsCheckingStatus(false)
        }

        // 生成当前状态的唯一标识
        const currentStatus = JSON.stringify({
            isClientOnline,
            isNextJSServerReachable,
            isGraphQLBackendReachable,
            showEmptyArrayReminder
        })

        // 从sessionStorage获取上次保存的状态
        const lastStatus = sessionStorage.getItem('last-network-status')
        const messageStartTime = sessionStorage.getItem('message-start-time')

        if (offline) {
            // 只有在状态真正变化时才显示消息
            const statusChanged = lastStatus !== currentStatus

            if (statusChanged) {
                // 保存当前状态到sessionStorage
                sessionStorage.setItem('last-network-status', currentStatus)
                lastSavedStatusRef.current = currentStatus

                // 记录消息开始显示的时间
                const now = Date.now()
                sessionStorage.setItem('message-start-time', now.toString())

                // 显示消息
                setShowMessage(true)
                // 30秒后隐藏消息文字
                hideTimerRef.current = setTimeout(() => {
                    setShowMessage(false)
                    sessionStorage.removeItem('message-start-time')
                }, 30000)
            } else if (messageStartTime) {
                // 状态未变化，但检查是否需要继续显示消息
                const startTime = parseInt(messageStartTime, 10)
                const elapsed = Date.now() - startTime
                const remainingTime = 30000 - elapsed

                if (remainingTime > 0) {
                    // 还有剩余时间，继续显示消息
                    setShowMessage(true)
                    // 设置剩余时间的定时器
                    hideTimerRef.current = setTimeout(() => {
                        setShowMessage(false)
                        sessionStorage.removeItem('message-start-time')
                    }, remainingTime)
                } else {
                    // 已经过去30秒，隐藏消息并清除时间记录
                    setShowMessage(false)
                    sessionStorage.removeItem('message-start-time')
                }
            }
        } else {
            // 没有离线状态时，隐藏消息
            setShowMessage(false)
            // 清除保存的状态和时间
            sessionStorage.removeItem('last-network-status')
            sessionStorage.removeItem('message-start-time')
            lastSavedStatusRef.current = null
        }
    }, [isClientOnline, isNextJSServerReachable, isGraphQLBackendReachable, showEmptyArrayReminder])

    // 清理定时器
    useEffect(() => {
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current)
            }
            if (checkStatusTimerRef.current) {
                clearTimeout(checkStatusTimerRef.current)
            }
        }
    }, [])

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

        window.addEventListener("graphql-empty-array-reminder", handleEmptyArrayReminder as EventListener)
        window.addEventListener("graphql-processing-queue", handleProcessingQueue as EventListener)

        checkEmptyArrayReminderStatus()
        const interval = setInterval(checkEmptyArrayReminderStatus, 2000)

        return () => {
            window.removeEventListener("graphql-empty-array-reminder", handleEmptyArrayReminder as EventListener)
            window.removeEventListener("graphql-processing-queue", handleProcessingQueue as EventListener)
            clearInterval(interval)
        }
    }, [])

    // 计算状态消息
    const getStatusInfo = () => {
        // 如果状态还在检查中，显示"检查中"
        if (isCheckingStatus) {
            return {
                icon: Loader2,
                message: "检查中",
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
        if (!isGraphQLBackendReachable && !isNextJSServerReachable) {
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

    const { icon: Icon, message, color } = getStatusInfo()

    // 动态设置透明度样式
    const getOpacityStyle = () => {
        if (isSmallScreen) {
            return {
                opacity: 0.6,
                backgroundColor: undefined,
            }
        }
        return { opacity: undefined }
    }

    const handleClick = () => {
        if (showEmptyArrayReminder && isProcessingOfflineQueue) {
            return
        }

        if (typeof window !== "undefined") {
            window.location.href = withBasePath("/offline")
        }
    }

    // 如果没有任何离线状态，不显示指示器
    if (!hasOfflineStatus && !isCheckingStatus) return null

    // 判断是否需要贴紧中间线布局
    const shouldUseSidebarLayout = isMediumScreen && action

    return (
        <div
            className={`print:hidden fixed top-0 z-50 ${color} ${shouldUseSidebarLayout ? 'left-[calc(50%+192px)]' : 'left-1/2'} ${shouldUseSidebarLayout ? '' : 'transform -translate-x-1/2'} ${shouldUseSidebarLayout ? 'rounded-bl-md rounded-br-md' : 'rounded-b-md'} text-sm font-medium flex items-center gap-1.5 cursor-pointer hover:shadow-md transition-shadow`}
            style={{ 
                pointerEvents: "auto", 
                padding: shouldUseSidebarLayout ? '6px 10px' : '4px 8px',
                ...getOpacityStyle() 
            }}
            onClick={handleClick}
            title={"离线队列"}
        >
            {isCheckingStatus ? (
                <Icon className="h-4 w-4 flex-shrink-0 animate-spin" />
            ) : (
                <Icon className="h-4 w-4 flex-shrink-0" />
            )}
            {showMessage && (
                <span className="animate-fade-in">{message}</span>
            )}
        </div>
    )
}
