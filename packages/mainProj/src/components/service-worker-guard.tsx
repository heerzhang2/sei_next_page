"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ServiceWorkerGuardProps {
    children: React.ReactNode
    showAlert?: boolean
}

export function ServiceWorkerGuard({ children, showAlert = true }: ServiceWorkerGuardProps) {
    const [swStatus, setSwStatus] = useState<"checking" | "ready" | "not-ready" | "not-supported">("checking")
    const [isRegistering, setIsRegistering] = useState(false)

    const checkServiceWorkerStatus = () => {
        if (!("serviceWorker" in navigator)) {
            setSwStatus("not-supported")
            return
        }

        if (navigator.serviceWorker.controller) {
            setSwStatus("ready")
        } else {
            setSwStatus("not-ready")
        }
    }

    const registerServiceWorker = async () => {
        if (!("serviceWorker" in navigator)) return

        setIsRegistering(true)
        try {
            const registration = await navigator.serviceWorker.register("/sw.js")

            // 等待Service Worker激活
            if (registration.installing) {
                await new Promise((resolve) => {
                    registration.installing!.addEventListener("statechange", (e) => {
                        if ((e.target as ServiceWorker).state === "activated") {
                            resolve(void 0)
                        }
                    })
                })
            }

            // 重新检查状态
            setTimeout(checkServiceWorkerStatus, 100)
        } catch (error) {
            console.error("Service Worker registration failed:", error)
        } finally {
            setIsRegistering(false)
        }
    }

    useEffect(() => {
        checkServiceWorkerStatus()

        // 监听Service Worker状态变化
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", checkServiceWorkerStatus)

            return () => {
                navigator.serviceWorker.removeEventListener("controllerchange", checkServiceWorkerStatus)
            }
        }
    }, [])

    // 如果不显示警告，直接返回children
    if (!showAlert) {
        return <>{children}</>
    }

    // Service Worker未就绪时显示警告
    if (swStatus === "not-ready" || swStatus === "not-supported") {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
            <span>
              {swStatus === "not-supported"
                  ? "您的浏览器不支持Service Worker，离线功能将无法使用"
                  : "Service Worker未就绪，离线功能和缓存管理将无法正常工作"}
            </span>
                        {swStatus === "not-ready" && (
                            <Button onClick={registerServiceWorker} disabled={isRegistering} size="lg" variant="outline">
                                <RefreshCw className={`h-6 w-6 mr-8 z-[1010] ${isRegistering ? "animate-spin" : ""}`} />
                                {isRegistering ? "注册中..." : "重新注册"}
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>

                {/* 在Service Worker未就绪时仍然显示内容，但功能受限 */}
                <div className="opacity-75 pointer-events-none">{children}</div>
            </div>
        )
    }

    // Service Worker就绪时正常显示
    return <>{children}</>
}

// Hook for checking Service Worker status
export function useServiceWorkerStatus() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const checkStatus = () => {
            setIsReady("serviceWorker" in navigator && !!navigator.serviceWorker.controller)
        }

        checkStatus()

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", checkStatus)
            return () => {
                navigator.serviceWorker.removeEventListener("controllerchange", checkStatus)
            }
        }
    }, [])

    return isReady
}
