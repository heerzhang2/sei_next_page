"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Wifi,
    WifiOff,
    Smartphone,
    Monitor,
    Apple,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Database,
    Globe,
} from "lucide-react"
import { toast } from "sonner"

interface PWAStatus {
    isInstalled: boolean
    isOnline: boolean
    serviceWorkerActive: boolean
    cacheAvailable: boolean
    platform: string
    browser: string
    installable: boolean
    storageQuota: number
    storageUsed: number
}

export function PWAStatusChecker() {
    const [status, setStatus] = useState<PWAStatus>({
        isInstalled: false,
        isOnline: navigator.onLine,
        serviceWorkerActive: false,
        cacheAvailable: false,
        platform: "unknown",
        browser: "unknown",
        installable: false,
        storageQuota: 0,
        storageUsed: 0,
    })
    const [showStatus, setShowStatus] = useState(false)

    useEffect(() => {
        const checkPWAStatus = async () => {
            // 检测平台
            const userAgent = navigator.userAgent.toLowerCase()
            let platform = "desktop"
            if (/iphone|ipad|ipod/.test(userAgent)) platform = "ios"
            else if (/android/.test(userAgent)) platform = "android"

            // 检测浏览器
            let browser = "other"
            if (userAgent.includes("chrome") && !userAgent.includes("edg")) browser = "chrome"
            else if (userAgent.includes("safari") && !userAgent.includes("chrome")) browser = "safari"
            else if (userAgent.includes("firefox")) browser = "firefox"
            else if (userAgent.includes("edg")) browser = "edge"

            // 检查是否已安装
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches
            const isMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches
            const isIOSStandalone = (window.navigator as any).standalone === true
            const isInstalled = isStandalone || isFullscreen || isMinimalUI || isIOSStandalone

            // 检查 Service Worker
            const serviceWorkerActive = "serviceWorker" in navigator && navigator.serviceWorker.controller !== null

            // 检查缓存
            let cacheAvailable = false
            if ("caches" in window) {
                try {
                    const cacheNames = await caches.keys()
                    cacheAvailable = cacheNames.length > 0
                } catch (error) {
                    console.error("Cache check failed:", error)
                }
            }

            // 检查存储配额
            let storageQuota = 0
            let storageUsed = 0
            if ("storage" in navigator && "estimate" in navigator.storage) {
                try {
                    const estimate = await navigator.storage.estimate()
                    storageQuota = estimate.quota || 0
                    storageUsed = estimate.usage || 0
                } catch (error) {
                    console.error("Storage estimate failed:", error)
                }
            }

            // 检查是否可安装
            const installable =
                !isInstalled &&
                ((platform === "android" && browser === "chrome") ||
                    (platform === "ios" && browser === "safari") ||
                    platform === "desktop")

            setStatus({
                isInstalled,
                isOnline: navigator.onLine,
                serviceWorkerActive,
                cacheAvailable,
                platform,
                browser,
                installable,
                storageQuota,
                storageUsed,
            })
        }

        checkPWAStatus()

        // 监听网络状态变化
        const handleOnline = () => setStatus((prev) => ({ ...prev, isOnline: true }))
        const handleOffline = () => setStatus((prev) => ({ ...prev, isOnline: false }))

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const getStatusIcon = (condition: boolean) => {
        return condition ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
    }

    const getPlatformIcon = () => {
        switch (status.platform) {
            case "ios":
                return <Apple className="w-4 h-4" />
            case "android":
                return <Smartphone className="w-4 h-4" />
            case "desktop":
                return <Monitor className="w-4 h-4" />
            default:
                return <Globe className="w-4 h-4" />
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const testOfflineCapability = async () => {
        try {
            // 尝试访问缓存
            if ("caches" in window) {
                const cache = await caches.open("test-cache")
                toast.success("离线缓存功能正常")
            } else {
                toast.error("浏览器不支持缓存 API")
            }
        } catch (error) {
            toast.error("离线功能测试失败")
        }
    }

    const refreshStatus = () => {
        window.location.reload()
    }

    if (!showStatus) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <Button variant="outline" size="sm" onClick={() => setShowStatus(true)} className="shadow-lg">
                    <Database className="w-4 h-4 mr-1" />
                    PWA 状态
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm">
            <Card className="shadow-lg border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            {getPlatformIcon()}
                            PWA 状态检查
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setShowStatus(false)} className="h-6 w-6 p-0">
                            ×
                        </Button>
                    </div>
                    <CardDescription className="text-xs">
                        平台: {status.platform} | 浏览器: {status.browser}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* 安装状态 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">应用安装</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(status.isInstalled)}
                            <Badge variant={status.isInstalled ? "default" : "secondary"} className="text-xs">
                                {status.isInstalled ? "已安装" : "未安装"}
                            </Badge>
                        </div>
                    </div>

                    {/* 网络状态 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">网络连接</span>
                        <div className="flex items-center gap-2">
                            {status.isOnline ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <Badge variant={status.isOnline ? "default" : "destructive"} className="text-xs">
                                {status.isOnline ? "在线" : "离线"}
                            </Badge>
                        </div>
                    </div>

                    {/* Service Worker 状态 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Service Worker</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(status.serviceWorkerActive)}
                            <Badge variant={status.serviceWorkerActive ? "default" : "secondary"} className="text-xs">
                                {status.serviceWorkerActive ? "活跃" : "未激活"}
                            </Badge>
                        </div>
                    </div>

                    {/* 缓存状态 */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm">离线缓存</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(status.cacheAvailable)}
                            <Badge variant={status.cacheAvailable ? "default" : "secondary"} className="text-xs">
                                {status.cacheAvailable ? "可用" : "不可用"}
                            </Badge>
                        </div>
                    </div>

                    {/* 存储信息 */}
                    {status.storageQuota > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span>存储使用</span>
                                <span>
                  {formatBytes(status.storageUsed)} / {formatBytes(status.storageQuota)}
                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${(status.storageUsed / status.storageQuota) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={testOfflineCapability}
                            className="flex-1 text-xs bg-transparent"
                        >
                            <Database className="w-3 h-3 mr-1" />
                            测试离线
                        </Button>
                        <Button variant="outline" size="sm" onClick={refreshStatus} className="flex-1 text-xs bg-transparent">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            刷新状态
                        </Button>
                    </div>

                    {/* 安装提示 */}
                    {status.installable && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <AlertCircle className="w-3 h-3" />
                                <span>此应用可以安装到您的设备</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
