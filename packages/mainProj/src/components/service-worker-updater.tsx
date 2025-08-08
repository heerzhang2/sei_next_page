"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ServiceWorkerUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // 注册 Service Worker
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    setRegistration(reg)
                    console.log("Service Worker registered:", reg)

                    // 检查更新
                    reg.addEventListener("updatefound", () => {
                        const newWorker = reg.installing
                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                    setUpdateAvailable(true)
                                    toast.info("应用有新版本可用", {
                                        description: "点击刷新按钮更新到最新版本",
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
            const handleOffline = (event: CustomEvent) => {
                toast.warning("网络连接失败", {
                    description: "正在使用离线模式，数据将在网络恢复后同步",
                    duration: 5000,
                })
            }

            // 监听未授权事件
            const handleUnauthorized = () => {
                toast.error("登录已过期", {
                    description: "正在跳转到登录页面...",
                    duration: 3000,
                })
                setTimeout(() => {
                    router.push("/login")
                }, 1000)
            }

            // 监听网络恢复事件
            const handleOnline = () => {
                toast.success("网络已恢复", {
                    description: "离线数据正在同步...",
                    duration: 3000,
                })
            }

            window.addEventListener("urql:offline", handleOffline as EventListener)
            window.addEventListener("urql:unauthorized", handleUnauthorized)
            window.addEventListener("online", handleOnline)

            return () => {
                window.removeEventListener("urql:offline", handleOffline as EventListener)
                window.removeEventListener("urql:unauthorized", handleUnauthorized)
                window.removeEventListener("online", handleOnline)
            }
        }
    }, [router])

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
            registration.waiting.addEventListener("statechange", (e) => {
                const target = e.target as ServiceWorker
                if (target.state === "activated") {
                    window.location.reload()
                }
            })
        }
    }

    if (!updateAvailable) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
                <h3 className="font-semibold mb-2">应用更新可用</h3>
                <p className="text-sm mb-3">发现新版本，点击更新获得最新功能</p>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setUpdateAvailable(false)}>
                        稍后
                    </Button>
                    <Button size="sm" onClick={handleUpdate}>
                        立即更新
                    </Button>
                </div>
            </div>
        </div>
    )
}
