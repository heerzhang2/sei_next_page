"use client"

import { useOfflineFileOperations } from "@/hooks/useOfflineFileOperations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

export function FileOperationsManager() {
    const { pendingOperations, isProcessing, processQueue, clearQueue } = useOfflineFileOperations()

    const getOperationIcon = (type: string) => {
        switch (type) {
            case "upload":
                return <Upload className="w-4 h-4" />
            case "delete":
                return <Trash2 className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="secondary">等待中</Badge>
            case "processing":
                return <Badge variant="default">处理中</Badge>
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已完成
                    </Badge>
                )
            case "failed":
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        失败
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        共有 <span className="font-semibold text-gray-900">{pendingOperations.length}</span> 个待处理操作
                    </p>
                    {isProcessing && (
                        <p className="text-sm text-blue-600 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            正在处理队列...
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={processQueue} disabled={isProcessing || pendingOperations.length === 0} size="sm">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? "animate-spin" : ""}`} />
                        {isProcessing ? "处理中..." : "立即处理"}
                    </Button>
                    <Button onClick={clearQueue} disabled={pendingOperations.length === 0} variant="outline" size="sm">
                        清空队列
                    </Button>
                </div>
            </div>

            {/* Operations List */}
            {pendingOperations.length === 0 ? (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>暂无待处理的文件操作</AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-3">
                    {pendingOperations.map((operation) => (
                        <Card key={operation.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {getOperationIcon(operation.type)}
                                        <CardTitle className="text-base">{operation.type === "upload" ? "上传文件" : "删除文件"}</CardTitle>
                                    </div>
                                    {getStatusBadge(operation.status)}
                                </div>
                                <CardDescription className="text-xs">
                                    {formatDistanceToNow(operation.timestamp, { addSuffix: true, locale: zhCN })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">文件名:</span>
                                        <p className="font-medium truncate">{operation.fileName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">大小:</span>
                                        <p className="font-medium">{(operation.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">报告ID:</span>
                                        <p className="font-mono text-xs truncate">{operation.repId}</p>
                                    </div>
                                    {operation.subRepId && (
                                        <div>
                                            <span className="text-gray-600">子报告ID:</span>
                                            <p className="font-mono text-xs truncate">{operation.subRepId}</p>
                                        </div>
                                    )}
                                </div>
                                {operation.error && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">{operation.error}</AlertDescription>
                                    </Alert>
                                )}
                                {operation.retryCount > 0 && <p className="text-xs text-gray-500">重试次数: {operation.retryCount}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
