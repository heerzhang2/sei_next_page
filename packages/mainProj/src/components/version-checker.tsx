"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function VersionChecker() {
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

    const handleSSEMessage = (message: any) => {
        console.log(`[SSE] 收到 ${message.type} 类型消息:`, message.data)

        switch (message.type) {
            case 'version':
                handleVersionMessage(message.data)
                break
            case 'system-notification':
                handleSystemNotification(message.data)
                break
            case 'report-completed':
                handleReportCompleted(message.data)
                break
            default:
                console.log(`[SSE] 收到消息: ${message.type}`, message.data)
        }
    }

    const handleVersionMessage = (data: any) => {
        if (data.version) {
            const lastCacheWarmup = localStorage.getItem("last-cache-warmup")

            if (!lastCacheWarmup || data.version !== lastCacheWarmup) {
                console.log('[SSE] 检测到新版本:', data.version)

                // 检查是否需要显示提示
                const offlineReports = localStorage.getItem("offline-reports")
                if (offlineReports && window.location.pathname !== "/pwa") {
                    toast.info("前端版本升级", {
                        description: "建议访问 /pwa 页面重新缓存",
                        duration: 10000,
                        action: {
                            label: "前往",
                            onClick: () => window.location.href = "/pwa",
                        },
                    })
                }
            }
        }
    }

    const handleSystemNotification = (data: any) => {
        toast[data.level === 'error' ? 'error' : 'info'](data.title, {
            description: data.message,
            duration: 8000,
        })
    }

    const handleReportCompleted = (data: any) => {
        toast.success('报表生成完成', {
            description: `报表 "${data.reportName}" 已生成`,
            duration: 6000,
        })
    }

    const connectSSE = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        try {
            const eventSource = new EventSource('/api/sse')
            eventSourceRef.current = eventSource

            eventSource.onopen = () => {
                console.log('[SSE] 连接已建立')
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current)
                }
            }

            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    handleSSEMessage(message)
                } catch (error) {
                    console.error('[SSE] 解析消息失败:', error)
                }
            }

            eventSource.onerror = (error) => {
                console.error('[SSE] 连接错误:', error)
                eventSource.close()

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('[SSE] 尝试重新连接...')
                    connectSSE()
                }, 5000)
            }

        } catch (error) {
            console.error('[SSE] 创建连接失败:', error)
            reconnectTimeoutRef.current = setTimeout(() => {
                connectSSE()
            }, 10000)
        }
    }

    useEffect(() => {
        connectSSE()

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [])

    return null
}