"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function SerwistMessageHandler() {
    useEffect(() => {
        let errorHandled = false
        const handleSWactive = (details: any) => {
            if (errorHandled) return
            errorHandled = true
            // 显示用户友好的错误信息
            toast.error("服务激活加载中...请前往离线能力预备页面去更新", {
                duration: 10000,
                id: "chunk-error-global",
                action: {
                    label: "前往",
                    onClick: () => {
                        window.location.href = "/pwa"
                    },
                },
                cancel: {
                    label: "立即刷新",
                    onClick: () => forceHardRefresh()
                }
            })
        }
        const forceHardRefresh = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    // 硬刷新，绕过所有缓存
                    window.location.href = window.location.origin + window.location.pathname + '?forceRefresh=' + Date.now()
                })
            } else {
                toast.error("请前往离线能力预备页面去更新", {
                    duration: 10000,
                    id: "chunk-error-global",
                    action: {
                        label: "前往",
                        onClick: () => {
                            window.location.href = "/pwa"
                        },
                    }
                })
            }
        }
        // 处理来自 Service Worker 的消息
        const handleSWmessage = (event: MessageEvent) => {
            if (event.data?.type === 'SW_UPDATED') {
                handleSWactive({
                    type: "SW_active",
                    message: event.data.error
                })
            }
        }
        // 注册所有事件监听器
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWmessage)
        }
        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWmessage)
            }
            // 组件卸载时关闭相关的 toast
            toast.dismiss("chunk-error-global");
        }
    }, [])
    return null
}
