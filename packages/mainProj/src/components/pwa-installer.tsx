"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstallPrompt(true)
        }

        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            setShowInstallPrompt(false)
            console.log("PWA was installed")
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleAppInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === "accepted") {
            console.log("User accepted the install prompt")
        } else {
            console.log("User dismissed the install prompt")
        }

        setDeferredPrompt(null)
        setShowInstallPrompt(false)
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        // 24小时后再次显示
        setTimeout(() => {
            if (deferredPrompt) {
                setShowInstallPrompt(true)
            }
        }, 24 * 60 * 60 * 1000)
    }

    if (!showInstallPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-sm">安装应用</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    将报告系统安装到桌面，支持离线使用
                </p>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDismiss}>
                        稍后
                    </Button>
                    <Button size="sm" onClick={handleInstallClick}>
                        安装
                    </Button>
                </div>
            </div>
        </div>
    )
}
