"use client"

import { useEffect, useRef, useState } from "react"

export function ServiceWorkerUpdater() {
    const [updateReady, setUpdateReady] = useState(false)
    const waitingSW = useRef<ServiceWorker | null>(null)

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return
        let mounted = true

        const register = async () => {
            try {
                const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })

                // 已有 waiting 的新 SW
                if (reg.waiting) {
                    waitingSW.current = reg.waiting
                    if (mounted) setUpdateReady(true)
                }

                // 新版本发现
                reg.addEventListener("updatefound", () => {
                    const sw = reg.installing
                    if (!sw) return
                    sw.addEventListener("statechange", () => {
                        if (sw.state === "installed" && navigator.serviceWorker.controller) {
                            waitingSW.current = reg.waiting
                            if (mounted) setUpdateReady(true)
                        }
                    })
                })

                // 当 skipWaiting 发生接管后刷新页面
                navigator.serviceWorker.addEventListener("controllerchange", () => {
                    window.location.reload()
                })
            } catch (err) {
                // 静默失败
                console.warn("SW register failed:", err)
            }
        }

        register()
        return () => {
            mounted = false
        }
    }, [])

    // 监听来自 URQL 的离线事件，显示轻量提示（可按需改为 toast）
    useEffect(() => {
        const onOffline = () => {
            // 这里可以集成你项目里的 toast / 信息条
            console.info("离线模式下运行：GraphQL 请求由本地缓存提供")
        }
        window.addEventListener("urql:offline", onOffline as EventListener)
        return () => window.removeEventListener("urql:offline", onOffline as EventListener)
    }, [])

    const applyUpdate = () => {
        waitingSW.current?.postMessage({ type: "SKIP_WAITING" })
    }

    if (!updateReady) return null

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black text-white px-4 py-2 shadow-lg flex items-center gap-3"
        >
            <span>有新的离线更新可用</span>
            <button
                onClick={applyUpdate}
                className="bg-white text-black rounded-full px-3 py-1 text-sm font-medium"
                aria-label="应用更新并刷新"
            >
                立即更新
            </button>
        </div>
    )
}
