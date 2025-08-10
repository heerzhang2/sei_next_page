"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Wifi,
    WifiOff,
    Smartphone,
    Monitor,
    Apple,
    Chrome,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Settings,
    Info,
} from "lucide-react"
import { toast } from "sonner"

interface PWAStatus {
    isInstalled: boolean
    isOnline: boolean
    serviceWorkerStatus: "active" | "installing" | "waiting" | "none"
    platform: "ios" | "android" | "desktop" | "unknown"
    browser: "safari" | "chrome" | "firefox" | "edge" | "unknown"
    cacheStatus: {
        staticCache: boolean
        dynamicCache: boolean
        totalSize: string
    }
    capabilities: {
        notifications: boolean
        backgroundSync: boolean
        pushMessaging: boolean
    }
}

export function PWAStatusChecker() {
    const [status, setStatus] = useState<PWAStatus | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const detectBrowser = () => {
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes("chrome") && !userAgent.includes("edg")) return "chrome"
        if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "safari"
        if (userAgent.includes("firefox")) return "firefox"
        if (userAgent.includes("edg")) return "edge"
        return "unknown"
    }

    const detectPlatform = () => {
        const userAgent = navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(userAgent)) return "ios"
        if (/android/.test(userAgent)) return "android"
        return "desktop"
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const checkCacheStatus = async () => {
        try {
            const cacheNames = await caches.keys()
            let totalSize = 0
            let hasStaticCache = false
            let hasDynamicCache = false

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName)
                const requests = await cache.keys()

                if (cacheName.includes("static")) hasStaticCache = true
                if (cacheName.includes("dynamic")) hasDynamicCache = true

                for (const request of requests) {
                    try {
                        const response = await cache.match(request)
                        if (response) {
                            const blob = await response.blob()
                            totalSize += blob.size
                        }
                    } catch (error) {
                        console.warn("Error calculating cache size for:", request.url)
                    }
                }
            }

            return {
                staticCache: hasStaticCache,
                dynamicCache: hasDynamicCache,
                totalSize: formatBytes(totalSize),
            }
        } catch (error) {
            console.error("Error checking cache status:", error)
            return {
                staticCache: false,
                dynamicCache: false,
                totalSize: "0 B",
            }
        }
    }

    const checkCapabilities = async () => {
        const capabilities = {
            notifications: "Notification" in window && Notification.permission !== "denied",
            backgroundSync: "serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype,
            pushMessaging: "serviceWorker" in navigator && "PushManager" in window,
        }

        return capabilities
    }

    const updateStatus = async () => {
        setIsLoading(true)

        try {
            const isInstalled =
                window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

            const serviceWorkerStatus = await (async () => {
                if (!("serviceWorker" in navigator)) return "none"

                const registration = await navigator.serviceWorker.getRegistration()
                if (!registration) return "none"

                if (registration.active) return "active"
                if (registration.installing) return "installing"
                if (registration.waiting) return "waiting"
                return "none"
            })()

            const cacheStatus = await checkCacheStatus()
            const capabilities = await checkCapabilities()

            setStatus({
                isInstalled,
                isOnline: navigator.onLine,
                serviceWorkerStatus,
                platform: detectPlatform(),
                browser: detectBrowser(),
                cacheStatus,
                capabilities,
            })
        } catch (error) {
            console.error("Error updating PWA status:", error)
            toast.error("状态检查失败", {
                description: "无法获取 PWA 状态信息",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        updateStatus()

        // 监听网络状态变化
        const handleOnline = () => updateStatus()
        const handleOffline = () => updateStatus()

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // 监听 Service Worker 状态变化
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener("controllerchange", updateStatus)
        }

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.removeEventListener("controllerchange", updateStatus)
            }
        }
    }, [])

    const handleTestOffline = () => {
        toast.info("离线测试", {
            description: "请断开网络连接后尝试浏览已访问的页面",
        })
    }

    const handleClearCache = async () => {
        try {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map((name) => caches.delete(name)))

            toast.success("缓存已清理", {
                description: "所有缓存数据已删除，页面将重新加载",
            })

            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (error) {
            toast.error("清理失败", {
                description: "无法清理缓存数据",
            })
        }
    }

    const getStatusIcon = (isGood: boolean) => {
        return isGood ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
    }

    const getPlatformIcon = () => {
        switch (status?.platform) {
            case "ios":
                return <Apple className="h-4 w-4" />
            case "android":
                return <Smartphone className="h-4 w-4" />
            case "desktop":
                return <Monitor className="h-4 w-4" />
            default:
                return <Settings className="h-4 w-4" />
        }
    }

    const getBrowserIcon = () => {
        switch (status?.browser) {
            case "chrome":
                return <Chrome className="h-4 w-4" />
            case "safari":
                return <Apple className="h-4 w-4" />
            default:
                return <Settings className="h-4 w-4" />
        }
    }

    if (!status) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <Card className="w-64">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">检查 PWA 状态...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-40">
            <Card className={`transition-all duration-300 ${isExpanded ? "w-80" : "w-64"}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getPlatformIcon()}
                            <CardTitle className="text-sm">PWA 状态</CardTitle>
                            {getBrowserIcon()}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
                            <Info className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                    {/* 基本状态 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">安装状态</span>
                            <div className="flex items-center gap-1">
                                {getStatusIcon(status.isInstalled)}
                                <Badge variant={status.isInstalled ? "default" : "secondary"} className="text-xs">
                                    {status.isInstalled ? "已安装" : "未安装"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">网络状态</span>
                            <div className="flex items-center gap-1">
                                {status.isOnline ? (
                                    <Wifi className="h-4 w-4 text-green-500" />
                                ) : (
                                    <WifiOff className="h-4 w-4 text-red-500" />
                                )}
                                <Badge variant={status.isOnline ? "default" : "destructive"} className="text-xs">
                                    {status.isOnline ? "在线" : "离线"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Service Worker</span>
                            <div className="flex items-center gap-1">
                                {getStatusIcon(status.serviceWorkerStatus === "active")}
                                <Badge variant={status.serviceWorkerStatus === "active" ? "default" : "secondary"} className="text-xs">
                                    {status.serviceWorkerStatus === "active"
                                        ? "运行中"
                                        : status.serviceWorkerStatus === "installing"
                                            ? "安装中"
                                            : status.serviceWorkerStatus === "waiting"
                                                ? "等待中"
                                                : "未激活"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* iOS Safari 特殊提示 */}
                    {status.platform === "ios" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-800 dark:text-blue-200 font-medium">iOS 系统说明</p>
                                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                                        PWA 使用 Safari WebKit 引擎运行，这是 Apple 的系统限制
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 展开的详细信息 */}
                    {isExpanded && (
                        <div className="space-y-3 border-t pt-3">
                            <div>
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">缓存状态</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>静态缓存</span>
                                        {getStatusIcon(status.cacheStatus.staticCache)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>动态缓存</span>
                                        {getStatusIcon(status.cacheStatus.dynamicCache)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>缓存大小</span>
                                        <span className="text-gray-600">{status.cacheStatus.totalSize}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">功能支持</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>通知</span>
                                        {getStatusIcon(status.capabilities.notifications)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>后台同步</span>
                                        {getStatusIcon(status.capabilities.backgroundSync)}
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>推送消息</span>
                                        {getStatusIcon(status.capabilities.pushMessaging)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={updateStatus}
                                    disabled={isLoading}
                                    className="flex-1 text-xs bg-transparent"
                                >
                                    {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTestOffline}
                                    className="flex-1 text-xs bg-transparent"
                                >
                                    测试离线
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearCache}
                                    className="flex-1 text-xs bg-transparent"
                                >
                                    清理缓存
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
