"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// 从 build 时生成的版本号（可以从环境变量或 package.json 读取）
const CURRENT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || Date.now().toString()

export function VersionChecker() {
    const [newVersionAvailable, setNewVersionAvailable] = useState(false)

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // 从服务器获取当前版本号
                const response = await fetch("/api/version", {
                    cache: "no-store",
                })

                if (response.ok) {
                    const data = await response.json()
                    const serverVersion = data.version

                    // 比较版本号
                    if (serverVersion !== CURRENT_VERSION) {
                        console.log("[Version] 检测到新版本:", serverVersion, "当前版本:", CURRENT_VERSION)
                        setNewVersionAvailable(true)

                        // 显示提示
                        toast.info("发现新版本", {
                            description: "建议刷新页面以获取最新功能",
                            duration: Number.POSITIVE_INFINITY,
                            action: {
                                label: "立即刷新",
                                onClick: () => {
                                    location.reload()
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

        // 每 5 分钟检查一次
        const interval = setInterval(checkVersion, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    // 监听 Service Worker 更新
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                console.log("[SW] Service Worker 已更新")
                setNewVersionAvailable(true)

                toast.info("应用已更新", {
                    description: "请刷新页面以使用最新版本",
                    duration: Number.POSITIVE_INFINITY,
                    action: {
                        label: "立即刷新",
                        onClick: () => {
                            window.location.reload()
                        },
                    },
                })
            })
        }
    }, [])

    if (!newVersionAvailable) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <p className="font-semibold mb-2">发现新版本</p>
            <p className="text-sm mb-3">建议刷新页面以获取最新功能</p>
            <Button onClick={() => window.location.reload()} variant="secondary" size="sm" className="w-full">
                立即刷新
            </Button>
        </div>
    )
}
