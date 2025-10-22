"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { indexedDBStorage } from "@/lib/indexed-db-storage"
import { toast } from "sonner"
import { RefreshCw, Send, Trash2, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface PendingReport {
    repId: string
    subrid?: string
    storage: any
    metadata: {
        modified: boolean
        parrepfs?: any
        timestamp?: number
    }
}

export function PendingReportsManager() {
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { isGraphQLBackendReachable } = useNetworkStatusContext()

    const loadPendingReports = async () => {
        setIsLoading(true)
        try {
            const reports = await indexedDBStorage.getAllModified()
            setPendingReports(reports)
        } catch (error) {
            console.error("Failed to load pending reports:", error)
            toast.error("加载待发送报告失败")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPendingReports()
    }, [])

    const handleDelete = async (repId: string, subrid?: string) => {
        if (!confirm("确定要删除这个待发送的报告吗？本地修改将丢失。")) {
            return
        }

        try {
            await indexedDBStorage.remove(repId, subrid)
            toast.success("已删除待发送报告")
            await loadPendingReports()
        } catch (error) {
            console.error("Failed to delete pending report:", error)
            toast.error("删除失败")
        }
    }

    const handleSendAll = () => {
        if (!isGraphQLBackendReachable) {
            toast.error("后端服务器不可达，无法发送报告")
            return
        }

        toast.info('请打开每个报告页面，点击"保存"按钮发送到服务器', {
            duration: 5000,
        })
    }

    const getReportUrl = (repId: string, subrid?: string) => {
        // Construct the URL based on your routing structure
        if (subrid) {
            return `/rep/${repId}?subrid=${subrid}`
        }
        return `/rep/${repId}`
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium">待发送报告数量</p>
                    <p className="text-2xl font-bold">{pendingReports.length}</p>
                </div>
                <Button onClick={loadPendingReports} variant="outline" disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    刷新
                </Button>
            </div>

            {!isGraphQLBackendReachable && pendingReports.length > 0 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>后端服务器当前不可达。请等待网络恢复后再发送报告。</AlertDescription>
                </Alert>
            )}

            {pendingReports.length > 0 && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Button onClick={handleSendAll} disabled={!isGraphQLBackendReachable} variant="default">
                            <Send className="w-4 h-4 mr-2" />
                            提示如何发送全部
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {pendingReports.map((report, index) => (
                            <div key={`${report.repId}-${report.subrid || "main"}`} className="p-3 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">报告 #{index + 1}</span>
                                            {report.subrid && <Badge variant="outline">子报告</Badge>}
                                            <Badge variant="secondary">{report.metadata.modified ? "已修改" : "未修改"}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            报告ID: {report.repId}
                                            {report.subrid && ` / 子报告ID: ${report.subrid}`}
                                        </p>
                                        {report.metadata.timestamp && (
                                            <p className="text-xs text-muted-foreground">
                                                最后修改: {new Date(report.metadata.timestamp).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={getReportUrl(report.repId, report.subrid)} target="_blank">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button onClick={() => handleDelete(report.repId, report.subrid)} variant="destructive" size="sm">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pendingReports.length === 0 && !isLoading && (
                <Alert>
                    <CheckCircle className="h-4 h-4 text-green-500" />
                    <AlertDescription>没有待发送的报告。所有修改都已同步到服务器。</AlertDescription>
                </Alert>
            )}

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">使用说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        <strong>确认按钮：</strong> 点击"确认"按钮将数据暂存到本地IndexedDB，不会发送到服务器。
                    </p>
                    <p>
                        <strong>保存按钮：</strong> 点击"保存"按钮将当前打开的报告发送到Java后端服务器。
                    </p>
                    <p>
                        <strong>发送全部：</strong> 需要逐个打开报告页面，点击"保存"按钮来发送每个报告。
                    </p>
                    <p>
                        <strong>删除报告：</strong> 删除待发送报告将清除本地修改，无法恢复。
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
