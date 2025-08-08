"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WifiOff, RefreshCw, ShieldAlert } from 'lucide-react'

// Registers /sw.js and surfaces update/offline/unauthorized banners.
// Next.js PWAs place the service worker in public/sw.js and register it at "/sw.js" [^3].

type SWState = {
    supported: boolean
    registration?: ServiceWorkerRegistration | null
    waiting?: ServiceWorker | null
    installing?: ServiceWorker | null
    updateAvailable: boolean
}

export function ServiceWorkerUpdater() {
    const [state, setState] = useState<SWState>({ supported: typeof window !== "undefined" && "serviceWorker" in navigator, registration: null, waiting: null, installing: null, updateAvailable: false })
    const [offline, setOffline] = useState<boolean>(typeof navigator !== "undefined" ? !navigator.onLine : false)
    const [unauthorized, setUnauthorized] = useState<string | null>(null)
    const reloadingRef = useRef(false)

    // Register SW
    useEffect(() => {
        if (!state.supported) return
        let isMounted = true
        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
                if (!isMounted) return
                const waiting = reg.waiting || null
                const installing = reg.installing || null
                setState((s) => ({ ...s, registration: reg, waiting, installing, updateAvailable: !!waiting }))

                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing
                    setState((s) => ({ ...s, installing: newWorker || null }))
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                setState((s) => ({ ...s, waiting: newWorker, updateAvailable: true }))
                            }
                        })
                    }
                })
            })
            .catch((err) => {
                console.warn("SW register failed", err)
            })
        return () => {
            isMounted = false
        }
    }, [state.supported])

    // Controller change -> reload once
    useEffect(() => {
        const onControllerChange = () => {
            if (reloadingRef.current) return
            reloadingRef.current = true
            window.location.reload()
        }
        navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange)
        return () => navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
    }, [])

    // Online/offline
    useEffect(() => {
        const onOnline = () => setOffline(false)
        const onOffline = () => setOffline(true)
        window.addEventListener("online", onOnline)
        window.addEventListener("offline", onOffline)
        return () => {
            window.removeEventListener("online", onOnline)
            window.removeEventListener("offline", onOffline)
        }
    }, [])

    // Listen to URQL offline/unauthorized events
    useEffect(() => {
        const onUrqlOffline = (e: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detail = (e as CustomEvent<any>).detail
            console.warn("URQL offline event", detail)
            setOffline(true)
        }
        const onUrqlUnauthorized = (e: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detail = (e as CustomEvent<any>).detail
            setUnauthorized(detail?.message || "登录状态已过期")
        }
        window.addEventListener("urql:offline", onUrqlOffline as EventListener)
        window.addEventListener("urql:unauthorized", onUrqlUnauthorized as EventListener)
        return () => {
            window.removeEventListener("urql:offline", onUrqlOffline as EventListener)
            window.removeEventListener("urql:unauthorized", onUrqlUnauthorized as EventListener)
        }
    }, [])

    const applyUpdate = () => {
        const worker = state.waiting || state.installing
        if (worker) {
            worker.postMessage({ type: "SKIP_WAITING" })
        } else {
            state.registration?.update()
        }
    }

    return (
        <div aria-live="polite" className="fixed bottom-4 right-4 space-y-2 z-50 w-[min(92vw,420px)]">
            {state.updateAvailable && (
                <Alert className="border border-amber-300 bg-amber-50">
                    <AlertTitle>{'有新版本可用'}</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-2">
                        <span>{'点击刷新应用以加载最新版本。'}</span>
                        <Button size="sm" onClick={applyUpdate} className="gap-1">
                            <RefreshCw className="h-4 w-4" />
                            {'刷新'}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {offline && (
                <Alert className="border border-gray-300 bg-gray-50">
                    <AlertTitle className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4" />
                        {'离线模式'}
                    </AlertTitle>
                    <AlertDescription>{'当前网络不可用，已切换为离线编辑。网络恢复后会自动同步。'}</AlertDescription>
                </Alert>
            )}

            {unauthorized && (
                <Alert className="border border-red-300 bg-red-50">
                    <AlertTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        {'登录已过期'}
                    </AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-2">
                        <span>{unauthorized}</span>
                        <Button size="sm" variant="destructive" onClick={() => (window.location.href = "/login")}>
                            {'重新登录'}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
