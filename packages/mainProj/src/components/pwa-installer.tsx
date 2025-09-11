"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Download, Smartphone, Monitor, Apple, Rabbit } from "lucide-react"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown")
    const [browser, setBrowser] = useState<"chrome" | "safari" | "firefox" | "edge" | "other">("other")

    useEffect(() => {
        // 检测平台和浏览器
        const detectPlatform = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const isIOS = /iphone|ipad|ipod/.test(userAgent)
            const isAndroid = /android/.test(userAgent)
            const isDesktop = !isIOS && !isAndroid

            if (isIOS) setPlatform("ios")
            else if (isAndroid) setPlatform("android")
            else if (isDesktop) setPlatform("desktop")

            // 检测浏览器
            if (userAgent.includes("chrome") && !userAgent.includes("edg")) setBrowser("chrome")
            else if (userAgent.includes("safari") && !userAgent.includes("chrome")) setBrowser("safari")
            else if (userAgent.includes("firefox")) setBrowser("firefox")
            else if (userAgent.includes("edg")) setBrowser("edge")
        }

        detectPlatform()

        // 检查是否已安装
        const checkIfInstalled = () => {
            // 检查是否在 PWA 模式下运行
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches
            const isMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches

            // iOS Safari 检查
            const isIOSStandalone = (window.navigator as any).standalone === true

            setIsInstalled(isStandalone || isFullscreen || isMinimalUI || isIOSStandalone)
        }

        checkIfInstalled()

        // 监听 beforeinstallprompt 事件
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // 只在桌面和 Android Chrome 上显示安装提示
            if ((platform === "desktop" || platform === "android") && browser === "chrome") {
                setShowInstallPrompt(true)
            }
        }

        // 监听应用安装事件
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            toast.success("应用安装成功！", {
                description: "您现在可以从主屏幕或应用列表中访问应用",
            })
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleAppInstalled)

        // iOS 特殊处理
        if (platform === "ios" && browser === "safari" && !isInstalled) {
            // 延迟显示 iOS 安装提示
            const timer = setTimeout(() => {
                setShowInstallPrompt(true)
            }, 3000)
            return () => clearTimeout(timer)
        }

        // Android Chrome 特殊处理
        if (platform === "android" && browser === "chrome" && !isInstalled && !deferredPrompt) {
            const timer = setTimeout(() => {
                setShowInstallPrompt(true)
            }, 5000)
            return () => clearTimeout(timer)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [platform, browser, isInstalled, deferredPrompt])

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Chrome/Edge 自动安装
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === "accepted") {
                toast.success("开始安装应用...")
            } else {
                toast.info("安装已取消")
            }

            setDeferredPrompt(null)
            setShowInstallPrompt(false)
        }
    }

    const handleManualInstall = () => {
        // 复制当前 URL 到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success("链接已复制到剪贴板")
        })
    }

    const openInSafari = () => {
        // 尝试在 Safari 中打开
        const safariUrl = `x-web-search://?${encodeURIComponent(window.location.href)}`
        window.location.href = safariUrl

        // 备用方案：复制链接
        setTimeout(() => {
            handleManualInstall()
            toast.info("请在 Safari 中打开此链接以安装 PWA")
        }, 1000)
    }

    if (isInstalled) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <Download className="w-3 h-3 mr-1" />
                    已安装 PWA
                </Badge>
            </div>
        )
    }

    if (!showInstallPrompt) return null

    const getPlatformIcon = () => {
        switch (platform) {
            case "ios":
                return <Apple className="w-5 h-5" />
            case "android":
                return <Smartphone className="w-5 h-5" />
            case "desktop":
                return <Monitor className="w-5 h-5" />
            default:
                return <Download className="w-5 h-5" />
        }
    }

    const getInstallInstructions = () => {
        if (platform === "ios") {
            if (browser === "chrome") {
                return {
                    title: "需要使用 Safari 安装",
                    description: "iOS 系统要求使用 Safari 浏览器安装 PWA 应用",
                    action: "在 Safari 中打开",
                    handler: openInSafari,
                }
            }
            return {
                title: "添加到主屏幕",
                description: "点击分享按钮 → 添加到主屏幕",
                action: "了解详情",
                handler: () => toast.info("请点击浏览器底部的分享按钮，然后选择'添加到主屏幕'"),
            }
        }

        if (platform === "android" && browser === "chrome") {
            return {
                title: "安装应用",
                description: "将此网站安装为应用，获得更好的体验",
                action: "立即安装",
                handler: handleInstall,
            }
        }

        if (platform === "desktop") {
            return {
                title: "安装桌面应用",
                description: "安装后可从桌面快速访问",
                action: deferredPrompt ? "立即安装" : "复制链接",
                handler: deferredPrompt ? handleInstall : handleManualInstall,
            }
        }

        return {
            title: "安装应用",
            description: "获得更好的离线体验",
            action: "复制链接",
            handler: handleManualInstall,
        }
    }

    const instructions = getInstallInstructions()

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm">
            <Card className="shadow-lg border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getPlatformIcon()}
                            <CardTitle className="text-sm">安装应用</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setShowInstallPrompt(false)} className="h-6 w-6 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardDescription className="text-xs">{instructions.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex gap-2">
                        <Button onClick={instructions.handler} size="sm" className="flex-1 text-xs">
                            {browser === "chrome" && <Rabbit className="w-3 h-3 mr-1" />}
                            {instructions.action}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowInstallPrompt(false)} className="text-xs">
                            稍后
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
