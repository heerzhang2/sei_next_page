"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function ChunkErrorHandler() {
    useEffect(() => {
        let errorHandled = false
        const handleChunkError = (errorDetails: any) => {
            if (errorHandled) return
            errorHandled = true

            console.error("[ChunkError] 处理chunk错误:", errorDetails)

            // 显示用户友好的错误信息
            toast.error("页面加载失败，尝试恢复...请前往离线能力预备页面去更新", {
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
            console.log("[ChunkError] 执行强制刷新")
            // 取消注册所有 Service Worker
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

        // 处理来自 Service Worker 的 chunk 错误消息
        const handleSWChunkError = (event: MessageEvent) => {
            if (event.data?.type === 'CHUNK_LOAD_ERROR') {
                handleChunkError({
                    type: "sw_chunk_error",
                    data: event.data,
                    url: event.data.url,
                    message: event.data.error
                })
            }
        }

        // 注册所有事件监听器
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWChunkError)
        }
        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWChunkError)
            }
            // 组件卸载时关闭相关的 toast
            toast.dismiss("chunk-error-global");
        }
    }, [])
    return null
}
