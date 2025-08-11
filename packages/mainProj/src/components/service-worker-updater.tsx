"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useStorageSafe } from "@/report/StorageContext"
import { useNetworkStatus } from "@/hooks/use-network-status"

export function ServiceWorkerUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
    const { offline: isAppOffline } = useStorageSafe()
    const networkStatus = useNetworkStatus()

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

            // 监听 URQL 未授权事件 - 修改逻辑
            const handleUrqlUnauthorized = () => {
                // 检查网络状态，只有在真正在线且非网络错误时才重定向到登录
                if (networkStatus.isOnline && !isAppOffline) {
                    // 再次确认不是网络问题
                    fetch("/api/health", { method: "HEAD", cache: "no-cache" })
                        .then((response) => {
                            if (response.ok) {
                                // 确实是认证问题，不是网络问题
                                toast.error("登录已过期", {
                                    description: "正在跳转到登录页面...",
                                    duration: 3000,
                                })
                                setTimeout(() => {
                                    window.location.href = "/login"
                                }, 2000)
                            } else {
                                // 服务器有问题，不重定向
                                toast.warning("服务器暂时不可用", {
                                    description: "请稍后再试，或继续离线操作。",
                                    duration: 5000,
                                })
                            }
                        })
                        .catch(() => {
                            // 网络请求失败，说明是网络问题，不是认证问题
                            toast.warning("网络连接不稳定", {
                                description: "请检查网络连接，或继续离线操作。",
                                duration: 5000,
                            })
                        })
                } else {
                    // 离线状态下不重定向到登录页
                    toast.warning("离线状态下无法验证登录", {
                        description: "请检查网络连接，或继续离线操作。",
                        duration: 5000,
                    })
                }
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
    }, [isAppOffline, networkStatus.isOnline])

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
            window.location.reload()
        }
    }

    return null // 这个组件不渲染任何 UI，只处理 Service Worker 逻辑
}
