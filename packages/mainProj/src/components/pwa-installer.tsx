"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor, Apple, Chrome, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface PWAInstallationGuide {
    platform: "ios" | "android" | "desktop" | "unknown"
    browser: "safari" | "chrome" | "firefox" | "edge" | "unknown"
    canInstall: boolean
    isInstalled: boolean
    instructions: string[]
    limitations?: string[]
}

export function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [showManualGuide, setShowManualGuide] = useState(false)
    const [installGuide, setInstallGuide] = useState<PWAInstallationGuide | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [showIOSChromeWarning, setShowIOSChromeWarning] = useState(false)

    // 检测浏览器类型
    const detectBrowser = () => {
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes("chrome") && !userAgent.includes("edg")) return "chrome"
        if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "safari"
        if (userAgent.includes("firefox")) return "firefox"
        if (userAgent.includes("edg")) return "edge"
        return "unknown"
    }

    // 检测平台和安装状态
    useEffect(() => {
        const detectPlatformAndInstallStatus = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const isIOS = /iphone|ipad|ipod/.test(userAgent)
            const isAndroid = /android/.test(userAgent)
            const isDesktop = !isIOS && !isAndroid
            const browser = detectBrowser()

            // 检测是否已安装为 PWA
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            const isInWebAppiOS = (window.navigator as any).standalone === true
            const isInstalled = isStandalone || isInWebAppiOS

            setIsInstalled(isInstalled)

            if (isInstalled) {
                // 已安装，显示成功提示
                toast.success("PWA 已安装", {
                    description: "应用已成功安装为 PWA，享受原生应用体验！",
                    duration: 3000,
                })
                return
            }

            let platform: PWAInstallationGuide["platform"] = "unknown"
            let instructions: string[] = []
            let limitations: string[] = []

            if (isIOS) {
                platform = "ios"

                if (browser === "chrome") {
                    // iOS Chrome 用户需要切换到 Safari
                    setShowIOSChromeWarning(true)
                    instructions = [
                        "⚠️ iOS 系统限制：PWA 只能通过 Safari 安装",
                        "1. 复制当前网址",
                        "2. 打开 Safari 浏览器",
                        "3. 粘贴网址并访问",
                        "4. 点击底部分享按钮 📤",
                        "5. 选择「添加到主屏幕」",
                        "6. 确认添加",
                    ]
                    limitations = [
                        "iOS 系统强制所有 PWA 使用 Safari WebKit 引擎",
                        "即使从 Chrome 安装，PWA 也会使用 Safari 内核运行",
                        "这是 Apple 的系统限制，无法更改",
                    ]
                } else {
                    instructions = [
                        "1. 点击浏览器底部的分享按钮 📤",
                        "2. 向下滚动找到「添加到主屏幕」选项",
                        "3. 点击「添加到主屏幕」",
                        "4. 自定义应用名称（可选）",
                        "5. 点击「添加」确认",
                        "6. 应用图标将出现在主屏幕上",
                    ]
                    limitations = ["PWA 将使用 Safari WebKit 引擎运行", "这是 iOS 系统的标准行为"]
                }
            } else if (isAndroid) {
                platform = "android"
                if (browser === "chrome") {
                    instructions = [
                        "1. 点击浏览器右上角菜单按钮 ⋮",
                        "2. 选择「安装应用」或「添加到主屏幕」",
                        "3. 确认安装，应用将添加到主屏幕",
                        "4. 也可以通过地址栏右侧的安装图标直接安装",
                    ]
                } else {
                    instructions = [
                        "1. 建议使用 Chrome 浏览器获得最佳 PWA 体验",
                        "2. 在 Chrome 中访问此页面",
                        "3. 点击地址栏的安装图标进行安装",
                    ]
                }
            } else if (isDesktop) {
                platform = "desktop"
                instructions = [
                    "1. 查看地址栏右侧是否有安装图标 ⬇️",
                    "2. 点击安装图标或使用浏览器菜单",
                    "3. 选择「安装报告系统」",
                    "4. 确认安装，应用将添加到桌面或应用列表",
                ]
            }

            setInstallGuide({
                platform,
                browser,
                canInstall: !!deferredPrompt || (isIOS && browser === "safari"),
                isInstalled,
                instructions,
                limitations,
            })
        }

        detectPlatformAndInstallStatus()

        // 监听显示模式变化
        const mediaQuery = window.matchMedia("(display-mode: standalone)")
        const handleDisplayModeChange = () => {
            detectPlatformAndInstallStatus()
        }

        mediaQuery.addListener(handleDisplayModeChange)
        return () => mediaQuery.removeListener(handleDisplayModeChange)
    }, [deferredPrompt])

    // 监听安装提示事件
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstallPrompt(true)

            toast.info("可以安装应用", {
                description: "点击安装按钮将此应用添加到您的设备",
                duration: 5000,
            })
        }

        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            setShowInstallPrompt(false)
            setIsInstalled(true)

            toast.success("应用安装成功！", {
                description: "PWA 已成功安装，您现在可以像使用原生应用一样使用它",
                duration: 5000,
            })

            console.log("PWA was installed successfully")
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleAppInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            setShowManualGuide(true)
            return
        }

        try {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === "accepted") {
                console.log("User accepted the install prompt")
                toast.success("正在安装应用...", {
                    description: "请稍候，应用正在安装到您的设备",
                    duration: 3000,
                })
            } else {
                console.log("User dismissed the install prompt")
                toast.info("安装已取消", {
                    description: "您可以随时通过浏览器菜单安装此应用",
                    duration: 3000,
                })
            }

            setDeferredPrompt(null)
            setShowInstallPrompt(false)
        } catch (error) {
            console.error("Installation failed:", error)
            toast.error("安装失败", {
                description: "请尝试通过浏览器菜单手动安装",
                duration: 5000,
            })
            setShowManualGuide(true)
        }
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        setShowManualGuide(false)
        setShowIOSChromeWarning(false)
    }

    const handleOpenInSafari = () => {
        const currentUrl = window.location.href
        // 尝试在 Safari 中打开
        window.location.href = `x-web-search://?${currentUrl}`

        // 备用方案：显示复制链接提示
        navigator.clipboard
            ?.writeText(currentUrl)
            .then(() => {
                toast.success("链接已复制", {
                    description: "请在 Safari 中粘贴此链接以安装 PWA",
                    duration: 5000,
                })
            })
            .catch(() => {
                toast.info("请手动复制链接", {
                    description: "复制当前网址并在 Safari 中打开以安装 PWA",
                    duration: 5000,
                })
            })
    }

    const getPlatformIcon = () => {
        if (installGuide?.platform === "ios" && installGuide?.browser === "chrome") {
            return <AlertTriangle className="h-5 w-5 text-orange-500" />
        }

        switch (installGuide?.platform) {
            case "ios":
                return <Apple className="h-5 w-5" />
            case "android":
                return <Smartphone className="h-5 w-5" />
            case "desktop":
                return <Monitor className="h-5 w-5" />
            default:
                return <Download className="h-5 w-5" />
        }
    }

    const getBrowserIcon = () => {
        switch (installGuide?.browser) {
            case "chrome":
                return <Chrome className="h-4 w-4" />
            case "safari":
                return <Apple className="h-4 w-4" />
            default:
                return null
        }
    }

    const getPlatformName = () => {
        const browserName =
            installGuide?.browser === "chrome" ? "Chrome" : installGuide?.browser === "safari" ? "Safari" : "浏览器"

        switch (installGuide?.platform) {
            case "ios":
                return `iOS ${browserName}`
            case "android":
                return `Android ${browserName}`
            case "desktop":
                return `桌面${browserName}`
            default:
                return "当前设备"
        }
    }

    // 如果已安装，不显示安装提示
    if (isInstalled) {
        return null
    }

    // iOS Chrome 警告
    if (showIOSChromeWarning && installGuide?.platform === "ios" && installGuide?.browser === "chrome") {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <CardTitle className="text-lg">iOS 系统限制</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleDismiss}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>iOS 系统只允许通过 Safari 安装 PWA 应用</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                <strong>重要说明：</strong>即使您使用 Chrome 浏览，安装后的 PWA 仍会使用 Safari WebKit 引擎运行。这是
                                Apple 的系统限制，无法更改。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">安装步骤：</h4>
                            {installGuide.instructions.map((instruction, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                                    <span>{instruction.replace(/^\d+\.\s*/, "")}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleOpenInSafari} className="flex-1">
                                <Apple className="h-4 w-4 mr-2" />在 Safari 中打开
                            </Button>
                            <Button onClick={handleDismiss} variant="outline">
                                取消
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 显示手动安装指南
    if (showManualGuide && installGuide) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getPlatformIcon()}
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        安装到 {getPlatformName()}
                                        {getBrowserIcon()}
                                    </CardTitle>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleDismiss}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>按照以下步骤将应用安装到您的设备</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {installGuide.instructions.map((instruction, index) => (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 font-medium">
                    {index + 1}
                  </span>
                                    <span>{instruction.replace(/^\d+\.\s*/, "").replace(/^⚠️\s*/, "")}</span>
                                </div>
                            ))}
                        </div>

                        {installGuide.limitations && installGuide.limitations.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">系统限制说明：</h4>
                                {installGuide.limitations.map((limitation, index) => (
                                    <p key={index} className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                                        • {limitation}
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={handleDismiss} variant="outline" className="flex-1 bg-transparent">
                                我知道了
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 显示自动安装提示
    if (showInstallPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {getPlatformIcon()}
                            <h3 className="font-semibold text-sm">安装应用</h3>
                            {getBrowserIcon()}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">将此应用安装到您的设备以获得更好的体验</p>
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

    return null
}
