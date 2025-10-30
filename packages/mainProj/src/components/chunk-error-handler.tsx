"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function ChunkErrorHandler() {
    useEffect(() => {
        // 全局错误状态
        let errorHandled = false

        const handleChunkError = (errorDetails: any) => {
            if (errorHandled) return
            errorHandled = true

            console.error("[ChunkError] 处理chunk错误:", errorDetails)

            toast.error("页面资源加载失败，正在刷新...", {
                duration: 5000,
                id: "chunk-error-global",
                action: {
                    label: "立即刷新",
                    onClick: () => forceHardRefresh()
                }
            })

            // 5秒后自动刷新
            setTimeout(() => {
                forceHardRefresh()
            }, 5000)
        }

        const forceHardRefresh = () => {
            console.log("[ChunkError] 执行强制刷新")
            // 取消注册所有 Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        console.log("[ChunkError] 取消注册 Service Worker")
                        registration.unregister()
                    })
                    // 硬刷新，绕过所有缓存
                    window.location.href = window.location.origin + window.location.pathname + '?forceRefresh=' + Date.now()
                })
            } else {
                window.location.reload()
            }
        }

        // 方法1: 监听 error 事件
        const handleError = (event: ErrorEvent) => {
            const error = event.error
            const filename = event.filename

            // 检测报告页面的 chunk 错误
            const isReportChunkError = (
                (error?.name === "ChunkLoadError" || error?.name === "TypeError") &&
                (filename?.includes("chunk") || filename?.includes("webpack")) &&
                window.location.pathname.startsWith("/rep/")
            )

            if (isReportChunkError) {
                console.error("[ReportChunkError] 报告页面chunk加载失败:", {
                    error,
                    filename,
                    currentPath: window.location.pathname
                })

                // 防止重复处理
                if (window.__REPORT_CHUNK_ERROR_HANDLED) return
                window.__REPORT_CHUNK_ERROR_HANDLED = true

                toast.error("报告页面需要更新，正在刷新...", {
                    duration: 4000,
                    id: "report-chunk-error",
                    action: {
                        label: "立即更新",
                        onClick: () => {
                            // 清理报告页面缓存并刷新
                            clearReportCacheAndReload()
                        }
                    }
                })

                setTimeout(() => {
                    clearReportCacheAndReload()
                }, 4000)

                event.preventDefault()
                event.stopPropagation()
                return true
            }
            return false
        }

        const clearReportCacheAndReload = () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // 通知 Service Worker 清理报告缓存
                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_REPORT_CACHE'
                })

                // 短暂延迟后刷新
                setTimeout(() => {
                    window.location.reload()
                }, 500)
            } else {
                window.location.reload()
            }
        }

        // 方法2: 监听 unhandledrejection
        const handleRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason

            const isChunkError = (
                error?.name === "ChunkLoadError" ||
                error?.name === "TypeError" ||
                error?.message?.includes("Loading chunk") ||
                error?.message?.includes("Failed to fetch dynamically imported module") ||
                error?.message?.includes("Importing a module script failed") ||
                error?.message?.includes("404")
            )

            if (isChunkError) {
                handleChunkError({
                    type: "unhandled_rejection",
                    error,
                    message: error?.message
                })
                event.preventDefault()
            }
        }

        // 方法3: 监听 Service Worker 消息
        const handleSWMessage = (event: MessageEvent) => {
            if (event.data?.type === 'REPORT_PAGE_RELOAD') {
                console.log('[Client] 收到报告页面刷新消息:', event.data)

                // 只在当前是报告页面时刷新
                if (window.location.pathname.startsWith('/rep/')) {
                    toast.info('正在更新报告页面...', { duration: 3000 })
                    setTimeout(() => {
                        window.location.reload()
                    }, 3000)
                }
            }
            if (event.data?.type === 'CHUNK_MISSING_ERROR' ||
                event.data?.type === 'SW_ACTIVATED') {
                console.log('[Client] 收到SW消息:', event.data)

                if (event.data?.type === 'CHUNK_MISSING_ERROR') {
                    handleChunkError({
                        type: "sw_message",
                        data: event.data
                    })
                }
            }
        }

        // 方法4: 监听 beforeunload 检测页面是否卡住
        let navigationStart = Date.now()
        const handleBeforeUnload = () => {
            navigationStart = Date.now()
        }

        const handleLoad = () => {
            const loadTime = Date.now() - navigationStart
            // 如果页面加载时间过长 >15s，可能是chunk加载问题
            if (loadTime > 15000 && !errorHandled) {
                console.warn("[ChunkError] 页面加载超时，可能chunk加载失败")
                handleChunkError({
                    type: "load_timeout",
                    loadTime
                })
            }
        }

        // 方法5: 监听 performance 资源加载失败
        const checkResourceFailures = () => {
            const resources = performance.getEntriesByType('resource')
            const failedResources = resources.filter((resource: any) => {
                return (resource.name.includes('chunk') ||
                        resource.name.includes('_next/static/chunks')) &&
                    (resource.responseStatus === 404 ||
                        resource.responseStatus === 0) // 0 表示网络错误
            })

            if (failedResources.length > 0 && !errorHandled) {
                console.error("[ChunkError] 检测到资源加载失败:", failedResources)
                handleChunkError({
                    type: "resource_failure",
                    resources: failedResources
                })
            }
        }

        // 注册所有事件监听器
        window.addEventListener("error", handleError, true)
        window.addEventListener("unhandledrejection", handleRejection, true)
        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('load', handleLoad)

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSWMessage)
        }

        // 定期检查资源加载状态
        const checkInterval = setInterval(checkResourceFailures, 2000)

        return () => {
            window.removeEventListener("error", handleError, true)
            window.removeEventListener("unhandledrejection", handleRejection, true)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('load', handleLoad)

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage)
            }

            clearInterval(checkInterval)
        }
    }, [])

    return null
}