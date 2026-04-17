"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { withBasePath } from "@/lib/tool"
import { useSearchParams } from "next/navigation"

export function SerwistMessageHandler() {
    const searchParams = useSearchParams()
    const isPrintPage = "1" === searchParams?.get("print")
    
    useEffect(() => {
        let errorHandled = false
        const handleSWactive = (details: any) => {
            if (errorHandled) return
            
            // 检查是否是打印页面，打印页面不显示此提示
            if (isPrintPage) {
                console.log("[Serwist] 打印页面，跳过服务激活提示")
                return
            }
            
            errorHandled = true
            // 显示用户友好的错误信息
            toast.error("离线工作线程激活了，加载中... 请到离线能力预备页面去预缓存", {
                duration: 10000,
                id: "chunk-error-global",
                action: {
                    label: "前往",
                    onClick: () => {
                        window.location.href = withBasePath("/pwa")
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
                            window.location.href = withBasePath("/pwa")
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
            } else if (event.data?.type === 'CACHE_COMPLETE_NOTIFICATION') {
                // 显示批量缓存完成通知
                const { message, successCount, totalPages, totalResources } = event.data.payload;
                toast.success(message, {
                    duration: 120000,
                    id: "cache-complete-notification",
                    description: `成功缓存 ${successCount} 个页面，共 ${totalResources} 个资源`,
                });
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
    }, [isPrintPage])
    return null
}
