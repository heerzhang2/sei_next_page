"use client"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Wifi,
    WifiOff,
    User,
    RefreshCw,
    XCircle,
    AlertTriangle,
    Activity,
    Settings,
    Home,
    CheckCircle,
} from "lucide-react"
import { VersionConflictManager } from "@/components/version-conflict-manager"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useVersionConflictManager } from "@/hooks/use-version-conflict-manager"
import { useQuery } from "@urql/next"
import { AuthCompQuery } from "@/component/header-wrapper"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"
import Link from "next/link"
import { PendingReportsManager } from "@/components/pending-reports-manager"
import { FileOperationsManager } from "@/components/file-operations-manager"
import { useGroupedUppyStates } from "@/hooks/useGroupedUppyStates"
import { withBasePath } from '@/lib/tool' 

export default function OfflinePage() {
    const { data: session } = useSession()
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get("tab") || "pending"
    const { totalConflicts } = useVersionConflictManager()
    const { groups: fileOperationGroups, loading: fileOperationsLoading } = useGroupedUppyStates()
    const hasFileOperations = !fileOperationsLoading && fileOperationGroups.length > 0

    const [result] = useQuery({
        query: AuthCompQuery,
        variables: {},
        requestPolicy: "cache-first",
    })
    const { authUser } = result?.data || {}
    const displayUserName = authUser?.username || "用户"
    const { deviceFingerprint } = useDeviceFingerprint()

    const refreshPage = () => {
        window.location.reload()
    }

    const goToHome = () => {
        window.location.href = withBasePath('/')
    }
    // value={activeTab}
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl relative">
            <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-transparent" onClick={goToHome}>
                <Home className="w-4 h-4 mr-2" />
                返回首页
            </Button>
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">离线编制情况</h1>
                    <p className="text-gray-600 dark:text-gray-400">管理离线状态、报告的离线变更队列、变更保存冲突</p>
                </div>
                <Tabs defaultValue={activeTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="status">系统状态</TabsTrigger>
                        <TabsTrigger value="pending">待发送报告</TabsTrigger>
                        <TabsTrigger
                            value="files"
                            className="flex items-center justify-center gap-0 px-1 sm:px-2 whitespace-nowrap"
                        >
                            <span className="truncate">文件队列</span>
                            {hasFileOperations && (
                                <span className="h-3 w-3 flex-shrink-0 bg-red-500 rounded-full border border-background"></span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="conflict"
                            className="flex items-center justify-center gap-0 px-1 sm:px-2 whitespace-nowrap"
                        >
                            <span className="truncate">版本冲突</span>
                            {totalConflicts > 0 && (
                                <span className="h-3 w-3 flex-shrink-0 bg-red-500 rounded-full border border-background"></span>
                            )}
                        </TabsTrigger>
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
                                            <AlertDescription>
                                                您当前处于离线状态。应用将使用本地缓存的数据,某些功能可能受限。
                                            </AlertDescription>
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

                    <TabsContent value="pending" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    待发送报告管理
                                </CardTitle>
                                <CardDescription>管理本地已修改但尚未发送到服务器的报告和子报告</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PendingReportsManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="files" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    文件操作队列管理
                                </CardTitle>
                                <CardDescription>管理待处理的文件上传和删除操作</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileOperationsManager />
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
                                <CardDescription>版本冲突的GraphQL变更请求队列</CardDescription>
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
