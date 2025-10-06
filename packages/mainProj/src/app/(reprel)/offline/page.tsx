"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useOfflineStorage } from "@/hooks/use-offline-storage"
import { OfflineQueueManager } from "@/components/offline-queue-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Wifi,
    WifiOff,
    Database,
    User,
    Clock,
    RefreshCw,
    XCircle,
    AlertTriangle,
    Activity,
    Settings,
    Shield,
    Download,
} from "lucide-react"
import { mutationCompensationStorage } from "@/lib/mutation-compensation-storage"
import { toast } from "sonner"

interface OfflineUserData {
    name?: string
    email?: string
    username?: string
    id?: string
    lastSync?: string
}

export default function OfflinePage() {
    const { data: session, status } = useSession()
    const [isOnline, setIsOnline] = useState(true)
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

    const [compensationCount, setCompensationCount] = useState(0)
    const [compensationBackups, setCompensationBackups] = useState<any[]>([])
    const [isLoadingCompensation, setIsLoadingCompensation] = useState(false)

    useEffect(() => {
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
        if (isOnline && session?.user) {
            const userData: OfflineUserData = {
                name: session.user.name || "",
                email: session.user.email || "",
                username: session.user.username || "",
                id: session.user.id || "",
                lastSync: new Date().toISOString(),
            }

            // setOfflineUserData(userData).catch((error) => {
            //     console.error("Failed to save offline user data:", error)
            // })
        }
    }, [session, isOnline])

    useEffect(() => {
        loadCompensationData()
    }, [])

    const loadCompensationData = async () => {
        try {
            await mutationCompensationStorage.init()
            const backups = await mutationCompensationStorage.getAllBackups()
            setCompensationBackups(backups)
            setCompensationCount(backups.length)
        } catch (error) {
            console.error("Failed to load compensation data:", error)
        }
    }

    const handleRestoreCompensation = async () => {
        setIsLoadingCompensation(true)
        try {
            const restored = await mutationCompensationStorage.restoreToMetadata()
            toast.success(`成功恢复 ${restored} 个mutation到离线队列`, {
                description: "这些操作将在网络恢复后自动重试",
                duration: 5000,
            })
            await loadCompensationData()
        } catch (error) {
            console.error("Failed to restore compensation:", error)
            toast.error("恢复补偿存储失败", {
                description: error instanceof Error ? error.message : "未知错误",
            })
        } finally {
            setIsLoadingCompensation(false)
        }
    }

    const handleClearCompensation = async () => {
        if (!confirm("确定要清空补偿存储吗？这将删除所有备份的mutation。")) {
            return
        }
        try {
            await mutationCompensationStorage.clearAll()
            toast.success("补偿存储已清空")
            await loadCompensationData()
        } catch (error) {
            console.error("Failed to clear compensation:", error)
            toast.error("清空补偿存储失败")
        }
    }

    const handleDownloadCompensation = () => {
        const dataStr = JSON.stringify(compensationBackups, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `compensation-backups-${new Date().toISOString()}.json`
        link.click()
        URL.revokeObjectURL(url)
        toast.success("补偿数据已下载")
    }

    const displayUserName = offlineUserData?.name || offlineUserData?.username || session?.user?.name || "用户"
    const refreshPage = () => {
        window.location.reload()
    }
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">离线模式管理</h1>
                    <p className="text-gray-600 dark:text-gray-400">管理离线功能状态、用户信息和变更队列</p>
                </div>

                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="status">系统状态</TabsTrigger>
                        <TabsTrigger value="queue">队列管理</TabsTrigger>
                        <TabsTrigger value="compensation">补偿存储</TabsTrigger>
                        <TabsTrigger value="settings">设置</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isOnline ? (
                                        <Wifi className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-5 h-5 text-red-500" />
                                    )}
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
                                        <AlertDescription>
                                            您当前处于离线状态。应用将使用本地缓存的数据，某些功能可能受限。
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
                                {storageError && (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertDescription>存储错误: {storageError}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="queue" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    离线变更队列管理
                                </CardTitle>
                                <CardDescription>管理和监控失败的GraphQL变更请求队列，下载离线的请求</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OfflineQueueManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compensation" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    补偿存储管理
                                </CardTitle>
                                <CardDescription>补偿存储是metadata队列的备份机制，防止队列被意外清空时丢失数据</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">备份的Mutation数量</p>
                                        <p className="text-2xl font-bold">{compensationCount}</p>
                                    </div>
                                    <Database className="w-8 h-8 text-muted-foreground" />
                                </div>

                                {compensationCount > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            检测到 {compensationCount} 个备份的mutation。 如果metadata队列为空，您可以从补偿存储恢复这些操作。
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        onClick={handleRestoreCompensation}
                                        disabled={compensationCount === 0 || isLoadingCompensation}
                                        variant="default"
                                    >
                                        {isLoadingCompensation ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        恢复到队列
                                    </Button>
                                    <Button onClick={handleDownloadCompensation} disabled={compensationCount === 0} variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        下载备份
                                    </Button>
                                    <Button onClick={handleClearCompensation} disabled={compensationCount === 0} variant="destructive">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        清空备份
                                    </Button>
                                    <Button onClick={loadCompensationData} variant="ghost">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        刷新
                                    </Button>
                                </div>

                                {compensationBackups.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">备份详情</h4>
                                        <div className="max-h-96 overflow-y-auto space-y-2">
                                            {compensationBackups.map((backup, index) => (
                                                <div key={backup.id} className="p-3 border rounded-lg text-sm space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">Backup #{index + 1}</span>
                                                        <Badge variant="outline">{new Date(backup.timestamp).toLocaleString()}</Badge>
                                                    </div>
                                                    {backup.variables?.id && (
                                                        <p className="text-muted-foreground">记录ID: {backup.variables.id}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground truncate">{backup.query.substring(0, 100)}...</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">补偿存储工作原理</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                    <strong>自动备份：</strong> 每当mutation被加入metadata队列时，系统会自动在补偿存储中创建备份。
                                </p>
                                <p>
                                    <strong>防止数据丢失：</strong> 如果metadata队列因为某些原因被清空（如用户误操作、浏览器问题等），
                                    补偿存储可以作为最后的防线恢复这些操作。
                                </p>
                                <p>
                                    <strong>自动清理：</strong> 当mutation成功执行后，对应的补偿备份会被自动删除，避免重复执行。
                                </p>
                                <p>
                                    <strong>手动恢复：</strong> 您可以随时查看补偿存储的内容，并手动将备份恢复到metadata队列中。
                                </p>
                                <p>
                                    <strong>数据导出：</strong> 支持将补偿数据导出为JSON文件，便于调试和数据分析。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    系统操作
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={refreshPage} variant="outline">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        刷新页面
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">关于离线功能</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <p>
                                    <strong>智能队列管理：</strong> 系统会自动管理失败的变更请求，支持优先级排序、去重和智能重试机制。
                                </p>
                                <p>
                                    <strong>用户控制：</strong> 您可以手动重试、取消或暂停队列处理，完全掌控离线操作的执行时机。
                                </p>
                                <p>
                                    <strong>历史追踪：</strong> 所有操作都有完整的历史记录，支持导出和分析，保留1天的详细日志。
                                </p>
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
