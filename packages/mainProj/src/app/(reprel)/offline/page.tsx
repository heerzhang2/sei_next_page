"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OfflineQueueManager } from "@/components/offline-queue-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Wifi, WifiOff, Database, User, RefreshCw, XCircle, AlertTriangle, Activity, Settings, Shield, Download, Home, CheckCircle,} from "lucide-react"
import { mutationCompensationStorage } from "@/lib/mutation-compensation-storage"
import { toast } from "sonner"
import { VersionConflictManager } from "@/components/version-conflict-manager"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useQuery } from "@urql/next"
import { AuthCompQuery } from "@/component/header-wrapper"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"
import Link from "next/link"

export default function OfflinePage() {
    const { data: session } = useSession()
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatusContext()
    const [result] = useQuery({
        query: AuthCompQuery,
        variables: {},
        requestPolicy: "cache-first",
    })
    const { authUser } = result?.data || {}
    const displayUserName = authUser?.username || "用户"
    const { deviceFingerprint } = useDeviceFingerprint()
    const [compensationCount, setCompensationCount] = useState(0)
    const [compensationBackups, setCompensationBackups] = useState<any[]>([])
    const [isLoadingCompensation, setIsLoadingCompensation] = useState(false)

    useEffect(() => {
        loadCompensationData()
    }, [])

    const loadCompensationData = async () => {
        try {
            await mutationCompensationStorage.init()
            // 使用 getAllCached（推荐）或 getAllBackups（如果添加了）
            const backups = await mutationCompensationStorage.getAllCached()
            setCompensationBackups(backups)
            setCompensationCount(backups.length)
        } catch (error) {
            console.error("Failed to load compensation data:", error)
        }
    }

    const handleRestoreCompensation = async () => {
        setIsLoadingCompensation(true)
        try {
            console.log("[Debug] 开始恢复补偿存储...")

            // 先检查当前状态
            const statusBefore = await mutationCompensationStorage.getMetadataStatus()
            console.log("[Debug] 恢复前状态:", statusBefore)

            // 设置恢复标记
            localStorage.setItem("isManualRestore", "true")

            const restored = await mutationCompensationStorage.restoreToMetadata()
            console.log("[Debug] 恢复结果:", restored)

            if (restored > 0) {
                toast.success(`成功恢复 ${restored} 个mutation到离线队列`, {
                    description: "请点击'重试所有'按钮来执行这些操作",
                    duration: 5000,
                })

                // 不立即触发处理，等待用户手动操作
                console.log("[Debug] 恢复完成，等待用户手动重试")

            } else {
                toast.info("没有需要恢复的mutation，队列中已存在相同的操作")
            }

            await loadCompensationData()

            // 清除标记
            setTimeout(() => {
                localStorage.removeItem("isManualRestore")
            }, 2000)

        } catch (error) {
            console.error("[Debug] 恢复补偿存储失败:", error)
            localStorage.removeItem("isManualRestore")
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
    const refreshPage = () => {
        window.location.reload()
    }
    const handleForceRefreshUrqlCache = async () => {
        try {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('urql:refresh-cache'))
            }
            toast.success("URQL 缓存已刷新")
        } catch (error) {
            console.error("强制刷新缓存失败:", error)
            toast.error("刷新缓存失败")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl relative">
            <Button asChild variant="outline" size="sm" className="absolute top-4 right-4 bg-transparent">
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                </Link>
            </Button>
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">离线问题排查</h1>
                    <p className="text-gray-600 dark:text-gray-400">管理离线状态、报告的离线变更队列、变更保存冲突</p>
                </div>
                <Tabs defaultValue="status" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="status">系统状态</TabsTrigger>
                        <TabsTrigger value="queue">队列管理</TabsTrigger>
                        <TabsTrigger value="compensation">补偿存储</TabsTrigger>
                        <TabsTrigger value="conflict">版本冲突</TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="space-y-6">
                        <div className="m-auto max-w-[40rem]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isGraphQLBackendReachable ? (
                                        <Wifi className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-5 h-5 text-red-500" />
                                    )}
                                    网络状态
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isClientOnline ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span>客户端</span>
                                        </div>
                                        <Badge variant={isClientOnline ? "default" : "destructive"}>
                                            {isClientOnline ? "在线" : "离线"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isOnline ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span>前端服务器</span>
                                        </div>
                                        <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "可用" : "不可用"}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isGraphQLBackendReachable ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span>后端服务器</span>
                                        </div>
                                        <Badge variant={isGraphQLBackendReachable ? "default" : "destructive"}>
                                            {isGraphQLBackendReachable ? "可用" : "不可用"}
                                        </Badge>
                                    </div>
                                </div>

                                {!isGraphQLBackendReachable && (
                                    <Alert className="mt-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>您当前处于离线状态。应用将使用本地缓存的数据,某些功能可能受限。</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
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
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    用户信息
                                </CardTitle>
                                <CardDescription>{isOnline ? "当前会话信息" : "离线缓存的用户信息"}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {session?.user ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">欢迎回来</span>
                                            <span className="font-medium">{displayUserName}</span>
                                        </div>
                                        {session?.user?.email && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">邮箱</span>
                                                <span className="text-sm">{session?.user?.email}</span>
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
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">客户端ID</span>
                                        <span className="font-medium">{deviceFingerprint}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
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
                                <CardDescription>补偿存储是离线变更队列的备份机制，防止在小概率事件下离线变更队列被意外清空丢失数据后无法恢复，正常情况下是工作的，无需人工干预！</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">备份的离线变更个数</p>
                                        <p className="text-2xl font-bold">{compensationCount}</p>
                                    </div>
                                    <Database className="w-8 h-8 text-muted-foreground" />
                                </div>

                                {compensationCount > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            检测到 {compensationCount} 个变更在后端还未正常处理。 如果离线队列为空，您可以从补偿存储中恢复这些变更。
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
                                    <Button onClick={loadCompensationData} variant="ghost">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        刷新
                                    </Button>
                                    <Button onClick={handleForceRefreshUrqlCache} variant="outline">
                                        <Database className="w-4 h-4 mr-2" />
                                        重置客户端
                                    </Button>
                                    <Button onClick={handleClearCompensation} disabled={compensationCount === 0} variant="destructive">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        清空备份
                                    </Button>
                                </div>
                                {compensationBackups.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">备份详情</h4>
                                        <div className="max-h-96 overflow-y-auto space-y-2">
                                            {compensationBackups.map((backup, index) => (
                                                <div key={backup.id} className="p-3 border rounded-lg text-sm space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">变更 #{index + 1}</span>
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
                                    <strong>自动备份：</strong> 每当变更被加入离线变更队列时，系统会自动在补偿存储中创建备份。
                                </p>
                                <p>
                                    <strong>手动恢复：</strong> 您可以随时查看补偿存储的内容，并手动将备份恢复到变更队列中。
                                </p>
                                <p>
                                    <strong>数据导出：</strong> 支持将补偿数据导出为JSON文件，便于用其他方式做数据恢复。
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="conflict" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    版本冲突管理
                                </CardTitle>
                                <CardDescription>版本冲突的GraphQL变更请求队列，下载离线的请求</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <VersionConflictManager />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
