"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ServiceWorkerUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // 注册 Service Worker
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    console.log("Service Worker registered:", reg)
                    setRegistration(reg)

                    // 检查更新
                    reg.addEventListener("updatefound", () => {
                        const newWorker = reg.installing
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    setUpdateAvailable(true)
                                    toast.info("应用更新可用", {
                                        description: "点击刷新以获取最新版本",
                                        action: {
                                            label: "刷新",
                                            onClick: () => window.location.reload(),
                                        },
                                        duration: 10000,
                                    })
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error("Service Worker registration failed:", error)
                })

            // 监听离线事件
            const handleOffline = () => {
                toast.warning("网络连接已断开", {
                    description: "您现在处于离线模式，数据将保存在本地",
                    duration: 5000,
                })
            }

            // 监听在线事件
            const handleOnline = () => {
                toast.success("网络连接已恢复", {
                    description: "正在同步离线数据...",
                    duration: 3000,
                })
            }

            // 监听 URQL 离线事件
            const handleUrqlOffline = (event: CustomEvent) => {
                toast.error("服务器连接失败", {
                    description: "正在使用缓存数据，功能可能受限",
                    duration: 5000,
                })
            }

            // 监听 URQL 未授权事件
            const handleUrqlUnauthorized = () => {
                toast.error("登录已过期", {
                    description: "正在跳转到登录页面...",
                    duration: 3000,
                })
                setTimeout(() => {
                    window.location.href = "/login"
                }, 2000)
            }

            window.addEventListener("offline", handleOffline)
            window.addEventListener("online", handleOnline)
            window.addEventListener("urql:offline", handleUrqlOffline as EventListener)
            window.addEventListener("urql:unauthorized", handleUrqlUnauthorized)

            return () => {
                window.removeEventListener("offline", handleOffline)
                window.removeEventListener("online", handleOnline)
                window.removeEventListener("urql:offline", handleUrqlOffline as EventListener)
                window.removeEventListener("urql:unauthorized", handleUrqlUnauthorized)
            }
        }
    }, [])

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
            window.location.reload()
        }
    }

    return null // 这个组件不渲染任何 UI，只处理 Service Worker 逻辑
}
