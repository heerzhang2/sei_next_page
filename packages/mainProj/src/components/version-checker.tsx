"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function VersionChecker() {
    useEffect(() => {
        const checkVersion = async () => {
            try {
                // 检查是否有离线报告数据
                const offlineReports = localStorage.getItem("offline-reports")
                if (!offlineReports) return

                // 检查当前页面是否是 /pwa
                if (window.location.pathname === "/pwa") return

                const response = await fetch("/api/version", {
                    cache: "no-store",
                })

                if (response.ok) {
                    const data = await response.json()
                    const serverVersion = data.version

                    const lastCacheWarmup = localStorage.getItem("last-cache-warmup")

                    if (!lastCacheWarmup || (lastCacheWarmup && serverVersion !== lastCacheWarmup)) {
                        console.log("[Version] 检测到新构建版本:", serverVersion, "上次缓存版本:", lastCacheWarmup)

                        toast.info("前端版本升级", {
                            description: "建议访问 /pwa 页面重新缓存，以确保离线报告编制功能",
                            duration: 10000,
                            action: {
                                label: "前往",
                                onClick: () => {
                                    window.location.href = "/pwa"
                                },
                            },
                        })
                    }
                }
            } catch (error) {
                // 忽略错误（可能是离线状态）
                console.log("[Version] 无法检查版本:", error)
            }
        }

        // 首次检查
        checkVersion()

        const interval = setInterval(checkVersion, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                // 检查是否有离线报告数据
                const offlineReports = localStorage.getItem("offline-reports")
                if (!offlineReports) return

                // 检查当前页面是否是 /pwa
                if (window.location.pathname === "/pwa") return

                console.log("[SW] Service Worker 已更新")

                toast.info("应用已更新", {
                    description: "建议访问 /pwa 页面重新做预缓存",
                    duration: 10000,
                    action: {
                        label: "前往",
                        onClick: () => {
                            window.location.href = "/pwa"
                        },
                    },
                })
            })
        }
    }, [])

    return null
}