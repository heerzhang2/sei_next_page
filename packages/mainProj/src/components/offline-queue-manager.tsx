"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    Shield,
    History,
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
                            onClick={() => retryRequest(request.enhancedId)}
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
                            disabled={isProcessing  || pendingCount === 0}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                            重试所有
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
                </CardContent>
            </Card>
            {/* 队列详情 */}
            <Card>
                <CardHeader>
                    <CardTitle>待处理的离线操作，当前队列 ({totalRequests})</CardTitle>
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
                            queuedRequests.map((request, index) => <QueueRequestCard key={index} request={request} />)
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
