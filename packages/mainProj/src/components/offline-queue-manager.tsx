"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useOfflineQueueManager, type QueuedRequest, type QueueHistory } from "@/hooks/use-offline-queue-manager"
import {
    Clock,
    RefreshCw,
    X,
    Play,
    Pause,
    Trash2,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calendar,
    Activity,
    Database,
} from "lucide-react"
import { format } from "date-fns"

export function OfflineQueueManager() {
    const {
        queuedRequests,
        queueHistory,
        isProcessing,
        totalRequests,
        successCount,
        failedCount,
        pendingCount,
        retryRequest,
        cancelRequest,
        retryAll,
        clearQueue,
        clearHistory,
        pauseQueue,
        resumeQueue,
        isPaused,
        getHistoryByDate,
        exportQueueData,
    } = useOfflineQueueManager()

    const [selectedDate, setSelectedDate] = useState(new Date())

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "low":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="w-4 h-4 text-blue-500" />
            case "retrying":
                return <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
            case "failed":
                return <XCircle className="w-4 h-4 text-red-500" />
            case "success":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "cancelled":
                return <X className="w-4 h-4 text-gray-500" />
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-500" />
        }
    }

    const handleExportData = () => {
        const data = exportQueueData()
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `offline-queue-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const QueueRequestCard = ({ request }: { request: QueuedRequest }) => (
        <Card className="mb-3">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(request.status)}
                            <h4 className="font-medium">{request.operationName}</h4>
                            <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>创建时间: {format(new Date(request.timestamp), "yyyy-MM-dd HH:mm:ss")}</p>
                            {request.retryCount > 0 && <p>重试次数: {request.retryCount}</p>}
                            {request.lastError && <p className="text-red-600">错误: {request.lastError}</p>}
                            {Object.keys(request.variables).length > 0 && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">查看参数</summary>
                                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(request.variables, null, 2)}
                  </pre>
                                </details>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryRequest(request.id)}
                            disabled={isProcessing || request.status === "retrying"}
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            重试
                        </Button>

                        {request.userCanCancel && (
                            <Button size="sm" variant="outline" onClick={() => cancelRequest(request.id)} disabled={isProcessing}>
                                <X className="w-3 h-3 mr-1" />
                                取消
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const HistoryCard = ({ item }: { item: QueueHistory }) => (
        <Card className="mb-3">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(item.status)}
                            <h4 className="font-medium">{item.operationName}</h4>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>创建时间: {format(new Date(item.timestamp), "yyyy-MM-dd HH:mm:ss")}</p>
                            <p>处理时间: {format(new Date(item.processedAt), "yyyy-MM-dd HH:mm:ss")}</p>
                            {item.error && <p className="text-red-600">错误: {item.error}</p>}
                            {Object.keys(item.variables).length > 0 && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">查看参数</summary>
                                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(item.variables, null, 2)}
                  </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">队列总数</p>
                                <p className="text-2xl font-bold">{totalRequests}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="text-sm text-gray-600">待处理</p>
                                <p className="text-2xl font-bold">{pendingCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">已成功</p>
                                <p className="text-2xl font-bold">{successCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="text-sm text-gray-600">已失败</p>
                                <p className="text-2xl font-bold">{failedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 队列控制 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        队列控制
                    </CardTitle>
                    <CardDescription>管理离线变更队列的处理状态</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={retryAll}
                            disabled={isProcessing || isPaused || pendingCount === 0}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                            重试所有
                        </Button>

                        <Button
                            onClick={isPaused ? resumeQueue : pauseQueue}
                            variant="outline"
                            className="flex items-center gap-2 bg-transparent"
                        >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            {isPaused ? "恢复队列" : "暂停队列"}
                        </Button>

                        <Button
                            onClick={clearQueue}
                            variant="destructive"
                            disabled={isProcessing || totalRequests === 0}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            清空队列
                        </Button>

                        <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                            <Download className="w-4 h-4" />
                            导出数据
                        </Button>
                    </div>

                    {isPaused && (
                        <Alert className="mt-4">
                            <Pause className="h-4 w-4" />
                            <AlertDescription>队列已暂停。新的离线操作将被添加到队列，但不会自动处理。</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* 队列详情 */}
            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="queue">当前队列 ({totalRequests})</TabsTrigger>
                    <TabsTrigger value="history">历史记录 ({queueHistory.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>待处理的离线操作</CardTitle>
                            <CardDescription>这些操作将在网络恢复后自动重试，您也可以手动控制</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                {queuedRequests.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>队列为空</p>
                                        <p className="text-sm">所有离线操作都已处理完成</p>
                                    </div>
                                ) : (
                                    queuedRequests.map((request,index) => <QueueRequestCard key={index} request={request} />)
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                操作历史记录
                            </CardTitle>
                            <CardDescription>查看过去24小时内处理的离线操作记录</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="date"
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="px-3 py-2 border rounded-md"
                                />
                                <Button onClick={clearHistory} variant="outline" size="sm" disabled={queueHistory.length === 0}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    清空历史
                                </Button>
                            </div>

                            <Separator className="mb-4" />

                            <ScrollArea className="h-[400px]">
                                {queueHistory.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>暂无历史记录</p>
                                        <p className="text-sm">处理的操作记录将显示在这里</p>
                                    </div>
                                ) : (
                                    getHistoryByDate(selectedDate).map((item) => (
                                        <HistoryCard key={`${item.id}-${item.processedAt}`} item={item} />
                                    ))
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
