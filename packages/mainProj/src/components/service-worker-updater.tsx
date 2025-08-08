"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function ServiceWorkerUpdater() {
    const [needsRefresh, setNeedsRefresh] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!("serviceWorker" in navigator)) return

        let registration: ServiceWorkerRegistration | null = null

        const onControllerChange = () => {
            // A new SW has taken control, reload to get latest assets.
            if (needsRefresh) {
                router.refresh()
                setNeedsRefresh(false)
            }
        }

        const register = async () => {
            try {
                registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })

                if (!registration) return

                // Listen for new worker installing
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration!.installing
                    if (!newWorker) return
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            setNeedsRefresh(true)
                        }
                    })
                })

                navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)
            } catch (e) {
                console.warn("ServiceWorker register failed:", e)
            }
        }

        register()

        return () => {
            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
        }
    }, [needsRefresh, router])

    // Global URQL auth/offline event listeners
    useEffect(() => {
        const onUnauthorized = () => {
            // Redirect to login on a separate microtask to avoid interfering with React transitions
            setTimeout(() => {
                window.location.href = "/login"
            }, 0)
        }
        const onOffline = () => {
            // no-op, you can integrate a toast here if desired
        }

        window.addEventListener("urql:unauthorized" as any, onUnauthorized)
        window.addEventListener("urql:offline" as any, onOffline)

        return () => {
            window.removeEventListener("urql:unauthorized" as any, onUnauthorized)
            window.removeEventListener("urql:offline" as any, onOffline)
        }
    }, [])

    if (!needsRefresh) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-amber-500 text-white px-3 py-2 shadow">
            有新版本可用。正在为你刷新…
        </div>
    )
}
