"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

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
    }

    if (!showInstallPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">安装应用</h3>
                    <p className="text-xs text-gray-600 mt-1">将此应用安装到您的设备以获得更好的体验</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex gap-2 mt-3">
                <Button onClick={handleInstallClick} size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    安装
                </Button>
                <Button variant="outline" onClick={handleDismiss} size="sm">
                    稍后
                </Button>
            </div>
        </div>
    )
}
