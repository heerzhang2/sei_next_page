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
    HardDrive,
    Server,
} from "lucide-react"
import { toast } from "sonner"

interface PWAStatus {
    isInstalled: boolean
    isOnline: boolean
    serviceWorkerActive: boolean
    cacheApiSupported: boolean
    cacheAvailable: boolean
    localStorageSupported: boolean
    indexedDBSupported: boolean
    platform: string
    browser: string
    installable: boolean
    storageQuota: number
    storageUsed: number
    manifestValid: boolean
}

export function PWAStatusChecker() {
    const [status, setStatus] = useState<PWAStatus>({
        isInstalled: false,
        isOnline: navigator.onLine,
        serviceWorkerActive: false,
        cacheApiSupported: false,
        cacheAvailable: false,
        localStorageSupported: false,
        indexedDBSupported: false,
        platform: "unknown",
        browser: "unknown",
        installable: false,
        storageQuota: 0,
        storageUsed: 0,
        manifestValid: false,
    })
    const [showStatus, setShowStatus] = useState(false)
    const [isChecking, setIsChecking] = useState(false)

    const detectPlatformAndBrowser = () => {
        const userAgent = navigator.userAgent.toLowerCase()

        // 检测平台
        let platform = "desktop"
        if (/iphone|ipad|ipod/.test(userAgent)) platform = "ios"
        else if (/android/.test(userAgent)) platform = "android"
        else if (/windows/.test(userAgent)) platform = "windows"
        else if (/mac/.test(userAgent)) platform = "mac"
        else if (/linux/.test(userAgent)) platform = "linux"

        // 检测浏览器
        let browser = "other"
        if (userAgent.includes("chrome") && !userAgent.includes("edg") && !userAgent.includes("opr")) {
            browser = "chrome"
        } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
            browser = "safari"
        } else if (userAgent.includes("firefox")) {
            browser = "firefox"
        } else if (userAgent.includes("edg")) {
            browser = "edge"
        } else if (userAgent.includes("opr")) {
            browser = "opera"
        }

        return { platform, browser }
    }

    const checkStorageSupport = async () => {
        const results = {
            cacheApiSupported: false,
            cacheAvailable: false,
            localStorageSupported: false,
            indexedDBSupported: false,
            storageQuota: 0,
            storageUsed: 0,
        }

        // 检查 Cache API 支持
        if (typeof window !== "undefined") {
            results.cacheApiSupported = "caches" in window
            console.log("Cache API supported:", results.cacheApiSupported)

            if (results.cacheApiSupported) {
                try {
                    const cacheNames = await caches.keys()
                    results.cacheAvailable = cacheNames.length > 0
                    console.log("Cache names:", cacheNames)
                } catch (error) {
                    console.error("Cache API test failed:", error)
                    results.cacheAvailable = false
                }
            }

            // 检查 localStorage 支持
            try {
                const testKey = "__pwa_test__"
                localStorage.setItem(testKey, "test")
                localStorage.removeItem(testKey)
                results.localStorageSupported = true
            } catch (error) {
                console.error("localStorage test failed:", error)
                results.localStorageSupported = false
            }

            // 检查 IndexedDB 支持
            results.indexedDBSupported = "indexedDB" in window

            if (results.indexedDBSupported) {
                try {
                    // 简单的 IndexedDB 测试
                    const request = indexedDB.open("__pwa_test_db__", 1)
                    await new Promise((resolve, reject) => {
                        request.onsuccess = () => {
                            request.result.close()
                            indexedDB.deleteDatabase("__pwa_test_db__")
                            resolve(true)
                        }
                        request.onerror = () => reject(request.error)
                        request.onupgradeneeded = () => {
                            // 创建测试对象存储
                            const db = request.result
                            if (!db.objectStoreNames.contains("test")) {
                                db.createObjectStore("test")
                            }
                        }
                    })
                } catch (error) {
                    console.error("IndexedDB test failed:", error)
                    results.indexedDBSupported = false
                }
            }

            // 检查存储配额
            if ("storage" in navigator && "estimate" in navigator.storage) {
                try {
                    const estimate = await navigator.storage.estimate()
                    results.storageQuota = estimate.quota || 0
                    results.storageUsed = estimate.usage || 0
                } catch (error) {
                    console.error("Storage estimate failed:", error)
                }
            }
        }

        return results
    }

    const checkPWAStatus = async () => {
        setIsChecking(true)

        try {
            const { platform, browser } = detectPlatformAndBrowser()

            // 检查是否已安装
            const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches
            const isMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches
            const isIOSStandalone = (window.navigator as any).standalone === true
            const isInstalled = isStandalone || isFullscreen || isMinimalUI || isIOSStandalone

            // 检查 Service Worker
            let serviceWorkerActive = false
            if ("serviceWorker" in navigator) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration()
                    serviceWorkerActive = !!(registration && registration.active)
                } catch (error) {
                    console.error("Service Worker check failed:", error)
                }
            }

            // 检查存储支持
            const storageResults = await checkStorageSupport()

            // 检查 manifest
            let manifestValid = false
            try {
                const response = await fetch("/manifest.json")
                if (response.ok) {
                    const manifest = await response.json()
                    manifestValid = !!(manifest.name && manifest.start_url && manifest.icons)
                }
            } catch (error) {
                console.error("Manifest check failed:", error)
            }

            // 检查是否可安装
            const installable =
                !isInstalled &&
                manifestValid &&
                serviceWorkerActive &&
                ((platform === "android" && browser === "chrome") ||
                    (platform === "ios" && browser === "safari") ||
                    (platform === "windows" && (browser === "chrome" || browser === "edge")) ||
                    (platform === "mac" && (browser === "chrome" || browser === "safari")) ||
                    (platform === "linux" && browser === "chrome"))

            setStatus({
                isInstalled,
                isOnline: navigator.onLine,
                serviceWorkerActive,
                platform,
                browser,
                installable,
                manifestValid,
                ...storageResults,
            })
        } catch (error) {
            console.error("PWA status check failed:", error)
            toast.error("状态检查失败", {
                description: "无法获取完整的 PWA 状态信息",
            })
        } finally {
            setIsChecking(false)
        }
    }

    useEffect(() => {
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
            case "windows":
            case "mac":
            case "linux":
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

    const testOfflineCapabilities = async () => {
        const results = []

        // 测试 localStorage
        if (status.localStorageSupported) {
            try {
                const testData = { test: "localStorage works", timestamp: Date.now() }
                localStorage.setItem("pwa_test", JSON.stringify(testData))
                const retrieved = JSON.parse(localStorage.getItem("pwa_test") || "{}")
                if (retrieved.test === testData.test) {
                    results.push("✅ localStorage 可用")
                }
                localStorage.removeItem("pwa_test")
            } catch (error) {
                results.push("❌ localStorage 测试失败")
            }
        }

        // 测试 IndexedDB
        if (status.indexedDBSupported) {
            try {
                const request = indexedDB.open("pwa_test_db", 1)
                await new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        const db = request.result
                        const transaction = db.transaction(["test"], "readwrite")
                        const store = transaction.objectStore("test")
                        store.add({ id: 1, data: "IndexedDB works" })

                        transaction.oncomplete = () => {
                            db.close()
                            indexedDB.deleteDatabase("pwa_test_db")
                            results.push("✅ IndexedDB 可用")
                            resolve(true)
                        }
                        transaction.onerror = () => reject(transaction.error)
                    }
                    request.onerror = () => reject(request.error)
                    request.onupgradeneeded = () => {
                        const db = request.result
                        if (!db.objectStoreNames.contains("test")) {
                            db.createObjectStore("test", { keyPath: "id" })
                        }
                    }
                })
            } catch (error) {
                results.push("❌ IndexedDB 测试失败")
            }
        }

        // 测试 Cache API
        if (status.cacheApiSupported) {
            try {
                const cache = await caches.open("pwa_test_cache")
                const response = new Response("Cache API works")
                await cache.put("/test", response)
                const retrieved = await cache.match("/test")
                if (retrieved) {
                    results.push("✅ Cache API 可用")
                }
                await caches.delete("pwa_test_cache")
            } catch (error) {
                results.push("❌ Cache API 测试失败")
            }
        }

        if (results.length === 0) {
            results.push("⚠️ 没有可用的离线存储方案")
        }

        toast.success("离线功能测试完成", {
            description: results.join("\n"),
            duration: 5000,
        })
    }

    if (!showStatus) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <Button variant="outline" size="sm" onClick={() => setShowStatus(true)} className="shadow-lg">
                    <Database className="w-4 h-4 mr-1" />
                    PWA 状态
                    {status.isNextJSServerReachable ? (
                        <Wifi className="w-4 h-4 ml-1 text-green-500" />
                    ) : (
                        <WifiOff className="w-4 h-4 ml-1 text-red-500" />
                    )}
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
                            {isChecking && <RefreshCw className="w-3 h-3 animate-spin" />}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setShowStatus(false)} className="h-6 w-6 p-0">
                            ×
                        </Button>
                    </div>
                    <CardDescription className="text-xs">
                        {status.platform} | {status.browser}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* PWA 核心功能 */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">PWA 核心功能</h4>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Manifest 文件</span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.manifestValid)}
                                <Badge variant={status.manifestValid ? "default" : "secondary"} className="text-xs">
                                    {status.manifestValid ? "有效" : "无效"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Service Worker</span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.serviceWorkerActive)}
                                <Badge variant={status.serviceWorkerActive ? "default" : "secondary"} className="text-xs">
                                    {status.serviceWorkerActive ? "活跃" : "未激活"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">应用安装</span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.isInstalled)}
                                <Badge variant={status.isInstalled ? "default" : "secondary"} className="text-xs">
                                    {status.isInstalled ? "已安装" : "未安装"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* 离线存储支持 */}
                    <div className="space-y-2 border-t pt-2">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">离线存储支持</h4>

                        <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                localStorage
              </span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.localStorageSupported)}
                                <Badge variant={status.localStorageSupported ? "default" : "secondary"} className="text-xs">
                                    {status.localStorageSupported ? "支持" : "不支持"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <Database className="w-3 h-3" />
                IndexedDB
              </span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.indexedDBSupported)}
                                <Badge variant={status.indexedDBSupported ? "default" : "secondary"} className="text-xs">
                                    {status.indexedDBSupported ? "支持" : "不支持"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <Server className="w-3 h-3" />
                Cache API
              </span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.cacheApiSupported)}
                                <Badge variant={status.cacheApiSupported ? "default" : "secondary"} className="text-xs">
                                    {status.cacheApiSupported ? "支持" : "不支持"}
                                </Badge>
                            </div>
                        </div>

                        {status.cacheApiSupported && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm ml-4">缓存数据</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(status.cacheAvailable)}
                                    <Badge variant={status.cacheAvailable ? "default" : "secondary"} className="text-xs">
                                        {status.cacheAvailable ? "有数据" : "无数据"}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 网络状态 */}
                    <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm">网络连接</span>
                        <div className="flex items-center gap-2">
                            {status.isNextJSServerReachable ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                            <Badge variant={status.isNextJSServerReachable ? "default" : "destructive"} className="text-xs">
                                {status.isNextJSServerReachable ? "在线" : "离线"}
                            </Badge>
                        </div>
                    </div>

                    {/* 存储信息 */}
                    {status.storageQuota > 0 && (
                        <div className="space-y-1 border-t pt-2">
                            <div className="flex items-center justify-between text-xs">
                                <span>存储使用</span>
                                <span>
                  {formatBytes(status.storageUsed)} / {formatBytes(status.storageQuota)}
                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${Math.min((status.storageUsed / status.storageQuota) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={testOfflineCapabilities}
                            className="flex-1 text-xs bg-transparent"
                            disabled={isChecking}
                        >
                            <Database className="w-3 h-3 mr-1" />
                            测试离线
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={checkPWAStatus}
                            className="flex-1 text-xs bg-transparent"
                            disabled={isChecking}
                        >
                            <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`} />
                            刷新
                        </Button>
                    </div>

                    {/* 状态提示 */}
                    {status.installable && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <AlertCircle className="w-3 h-3" />
                                <span>此应用可以安装到您的设备</span>
                            </div>
                        </div>
                    )}

                    {!status.cacheApiSupported && (status.localStorageSupported || status.indexedDBSupported) && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
                                <AlertCircle className="w-3 h-3" />
                                <span>Cache API 不可用，但可使用其他存储方案</span>
                            </div>
                        </div>
                    )}

                    {!status.serviceWorkerActive && (
                        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                                <XCircle className="w-3 h-3" />
                                <span>Service Worker 未激活，PWA 功能受限</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
