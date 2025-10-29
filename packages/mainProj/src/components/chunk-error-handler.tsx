"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function ChunkErrorHandler() {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            const error = event.error

            // 检测是否是 ChunkLoadError
            if (
                error?.name === "ChunkLoadError" ||
                error?.message?.includes("Loading chunk") ||
                error?.message?.includes("Failed to fetch dynamically imported module")
            ) {
                console.error("[ChunkError] 检测到 chunk 加载失败:", error)

                // 显示提示并自动刷新
                toast.error("检测到新版本，正在刷新页面...", {
                    duration: 2000,
                })

                // 2秒后硬刷新页面
                setTimeout(() => {
                    window.location.reload()
                }, 2000)

                // 阻止错误继续传播
                event.preventDefault()
            }
        }

        // 监听未捕获的错误
        window.addEventListener("error", handleError)

        // 监听未处理的 Promise 拒绝
        const handleRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason

            if (
                error?.name === "ChunkLoadError" ||
                error?.message?.includes("Loading chunk") ||
                error?.message?.includes("Failed to fetch dynamically imported module")
            ) {
                console.error("[ChunkError] 检测到 chunk 加载失败 (Promise):", error)

                toast.error("检测到新版本，正在刷新页面...", {
                    duration: 2000,
                })

                setTimeout(() => {
                    window.location.reload()
                }, 2000)

                event.preventDefault()
            }
        }

        window.addEventListener("unhandledrejection", handleRejection)

        return () => {
            window.removeEventListener("error", handleError)
            window.removeEventListener("unhandledrejection", handleRejection)
        }
    }, [])

    return null
}
