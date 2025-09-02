"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import {
    Wifi,
    WifiOff,
    Database,
    HardDrive,
    Server,
    User,
    Clock,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react"

interface OfflineUserData {
    name?: string
    email?: string
    username?: string
    id?: string
    lastSync?: string
}

//离线可能显示的状态页面？
export default function OfflinePage() {
    const { data: session, status } = useSession()
    const [isOnline, setIsOnline] = useState(true)
    const [storageStatus, setStorageStatus] = useState({
        localStorage: false,
        indexedDB: false,
        cacheAPI: false,
    })
    if(session)
        throw new Error("根本就没有使用到的功能？")
    //怪了？离线状态，保存用户输入的数据？  这是根本就没有使用到的功能。 不是URQL离线存储的做法。
    const {
        data: offlineUserData,
        setData: setOfflineUserData,
        storageType,
        isSupported,
        error: storageError,
    } = useOfflineStorage<OfflineUserData>({
        key: "offline_user_data",
        defaultValue: {},
        storage: "auto",
    })

    useEffect(() => {
        // 检查网络状态
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine)
        }

        updateOnlineStatus()
        window.addEventListener("online", updateOnlineStatus)
        window.addEventListener("offline", updateOnlineStatus)

        return () => {
            window.removeEventListener("online", updateOnlineStatus)
            window.removeEventListener("offline", updateOnlineStatus)
        }
    }, [])

    useEffect(() => {
        // 检查各种存储方案的支持情况
        const checkStorageSupport = async () => {
            const status = {
                localStorage: false,
                indexedDB: false,
                cacheAPI: false,
            }

            // 检查 localStorage
            try {
                const testKey = "__offline_test__"
                localStorage.setItem(testKey, "test")
                localStorage.removeItem(testKey)
                status.localStorage = true
            } catch (error) {
                console.error("localStorage not supported:", error)
            }

            // 检查 IndexedDB
            if ("indexedDB" in window) {
                try {
                    const request = indexedDB.open("__test_db__", 1)
                    await new Promise((resolve, reject) => {
                        request.onsuccess = () => {
                            request.result.close()
                            indexedDB.deleteDatabase("__test_db__")
                            status.indexedDB = true
                            resolve(true)
                        }
                        request.onerror = () => reject(request.error)
                        request.onupgradeneeded = () => {
                            const db = request.result
                            if (!db.objectStoreNames.contains("test")) {
                                db.createObjectStore("test")
                            }
                        }
                    })
                } catch (error) {
                    console.error("IndexedDB not supported:", error)
                }
            }

            // 检查 Cache API
            if ("caches" in window) {
                try {
                    const cache = await caches.open("__test_cache__")
                    await caches.delete("__test_cache__")
                    status.cacheAPI = true
                } catch (error) {
                    console.error("Cache API not supported:", error)
                }
            }

            setStorageStatus(status)
        }

        checkStorageSupport()
    }, [])

    useEffect(() => {
        // 当用户在线且已认证时，保存用户数据到离线存储
        if (isOnline && session?.user && isSupported) {
            const userData: OfflineUserData = {
                name: session.user.name || "",
                email: session.user.email || "",
                username: session.user.username || "",
                id: session.user.id || "",
                lastSync: new Date().toISOString(),
            }

            setOfflineUserData(userData).catch((error) => {
                console.error("Failed to save offline user data:", error)
            })
        }
    }, [session, isOnline, isSupported, setOfflineUserData])

    const getStorageIcon = (supported: boolean) => {
        return supported ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
    }

    const displayUserName = offlineUserData?.name || offlineUserData?.username || session?.user?.name || "用户"

    const refreshPage = () => {
        window.location.reload()
    }

    const testOfflineFeatures = async () => {
        const results = []

        if (storageStatus.localStorage) {
            try {
                const testData = { test: "localStorage works", timestamp: Date.now() }
                localStorage.setItem("offline_test", JSON.stringify(testData))
                const retrieved = JSON.parse(localStorage.getItem("offline_test") || "{}")
                if (retrieved.test === testData.test) {
                    results.push("✅ localStorage 功能正常")
                }
                localStorage.removeItem("offline_test")
            } catch (error) {
                results.push("❌ localStorage 测试失败")
            }
        }

        if (storageStatus.indexedDB) {
            try {
                const request = indexedDB.open("offline_test_db", 1)
                await new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        const db = request.result
                        const transaction = db.transaction(["test"], "readwrite")
                        const store = transaction.objectStore("test")
                        store.add({ id: 1, data: "IndexedDB works" })

                        transaction.oncomplete = () => {
                            db.close()
                            indexedDB.deleteDatabase("offline_test_db")
                            results.push("✅ IndexedDB 功能正常")
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

        if (storageStatus.cacheAPI) {
            try {
                const cache = await caches.open("offline_test_cache")
                const response = new Response("Cache API works")
                await cache.put("/test", response)
                const retrieved = await cache.match("/test")
                if (retrieved) {
                    results.push("✅ Cache API 功能正常")
                }
                await caches.delete("offline_test_cache")
            } catch (error) {
                results.push("❌ Cache API 测试失败")
            }
        }

        if (results.length === 0) {
            results.push("⚠️ 没有可用的离线存储功能")
        }

        alert(results.join("\n"))
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="space-y-6">
                {/* 页面标题 */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">离线模式</h1>
                    <p className="text-gray-600 dark:text-gray-400">当前应用的离线功能状态和用户信息</p>
                </div>

                {/* 网络状态卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                            网络状态
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span>当前连接状态</span>
                            <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "在线" : "离线"}</Badge>
                        </div>
                        {!isOnline && (
                            <Alert className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>您当前处于离线状态。应用将使用本地缓存的数据，某些功能可能受限。</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* 用户信息卡片 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            用户信息
                        </CardTitle>
                        <CardDescription>{isOnline ? "当前会话信息" : "离线缓存的用户信息"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {status === "loading" ? (
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>加载用户信息...</span>
                            </div>
                        ) : session?.user || offlineUserData?.name ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">欢迎回来</span>
                                    <span className="font-medium">{displayUserName}</span>
                                </div>
                                {(session?.user?.email || offlineUserData?.email) && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">邮箱</span>
                                        <span className="text-sm">{session?.user?.email || offlineUserData?.email}</span>
                                    </div>
                                )}
                                {offlineUserData?.lastSync && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">最后同步</span>
                                        <span className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                                            {new Date(offlineUserData.lastSync).toLocaleString()}
                    </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {!isOnline ? "离线状态下无法验证登录信息，请连接网络后重试。" : "请先登录以使用完整功能。"}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* 离线存储状态 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            离线存储状态
                        </CardTitle>
                        <CardDescription>
                            当前使用的存储方案：{storageType} {isSupported ? "(支持)" : "(不支持)"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4" />
                                    <span className="text-sm">localStorage</span>
                                </div>
                                {getStorageIcon(storageStatus.localStorage)}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    <span className="text-sm">IndexedDB</span>
                                </div>
                                {getStorageIcon(storageStatus.indexedDB)}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4" />
                                    <span className="text-sm">Cache API</span>
                                </div>
                                {getStorageIcon(storageStatus.cacheAPI)}
                            </div>
                        </div>

                        {storageError && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>存储错误: {storageError}</AlertDescription>
                            </Alert>
                        )}

                        {!storageStatus.localStorage && !storageStatus.indexedDB && !storageStatus.cacheAPI && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    您的浏览器不支持任何离线存储方案。这可能是由于隐私模式或浏览器限制导致的。
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* 操作按钮 */}
                <div className="flex gap-4 justify-center">
                    <Button onClick={refreshPage} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        刷新页面
                    </Button>
                    <Button onClick={testOfflineFeatures} variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        测试离线功能
                    </Button>
                </div>

                {/* 说明信息 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">关于离线功能</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                            <strong>PWA 不依赖 Cache API：</strong> PWA 的核心功能是 Service Worker + Web App Manifest。 Cache API
                            只是用于优化离线体验的工具之一。
                        </p>
                        <p>
                            <strong>多种存储方案：</strong> 应用会自动选择最佳的存储方案（IndexedDB &gt; localStorage &gt;
                            sessionStorage）， 确保在不同环境下都能提供离线功能。
                        </p>
                        <p>
                            <strong>Service Worker 缓存：</strong> 即使 Cache API 不可用，Service Worker 也会使用 IndexedDB
                            作为备用方案来缓存资源和数据。
                        </p>
                        <p>
                            <strong>兼容性说明：</strong> 现代浏览器（Chrome 45+, Safari 11.1+, Firefox 44+）都支持这些功能。
                            如果遇到问题，请检查是否处于隐私/无痕模式。
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
