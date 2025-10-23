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
import { useMutation } from "@urql/next"
import { OriginalDataMutation } from "@/report/common/base"

interface PendingReport {
    repId: string
    subrid?: string
    storage: any
    metadata: {
        modified: boolean
        parrepfs?: any
        timestamp?: number
        lastError?: string
    }
}

const getDeviceId = (): string => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("clientId") || ""
}

const cleanEmptyFields = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj
            .map((item) => cleanEmptyFields(item))
            .filter((item) => {
                if (typeof item === "object" && item !== null) {
                    const keys = Object.keys(item)
                    return (
                        keys.length > 0 && keys.some((key) => item[key] !== "" && item[key] !== null && item[key] !== undefined)
                    )
                }
                return item !== "" && item !== null && item !== undefined
            })
    } else if (typeof obj === "object" && obj !== null) {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
            if (value !== "" && value !== null && value !== undefined) {
                const cleanedValue = cleanEmptyFields(value)
                if (cleanedValue !== "" && cleanedValue !== null && cleanedValue !== undefined) {
                    if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                        continue
                    }
                    if (
                        typeof cleanedValue === "object" &&
                        !Array.isArray(cleanedValue) &&
                        Object.keys(cleanedValue).length === 0
                    ) {
                        continue
                    }
                    cleaned[key] = cleanedValue
                }
            }
        }
        return cleaned
    }
    return obj
}

export function PendingReportsManager() {
    const [pendingReports, setPendingReports] = useState<PendingReport[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [sendingReports, setSendingReports] = useState<Set<string>>(new Set())
    const { isGraphQLBackendReachable } = useNetworkStatusContext()
    const [, updateOriginal] = useMutation(OriginalDataMutation)

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

    const handleSendReport = async (report: PendingReport) => {
        if (!isGraphQLBackendReachable) {
            toast.error("后端服务器不可达，无法发送报告")
            return
        }

        const deviceId = getDeviceId()
        if (!deviceId) {
            toast.error("无法获取设备信息，请刷新页面重试")
            return
        }

        const reportKey = `${report.repId}${report.subrid ? `:${report.subrid}` : ""}`
        setSendingReports((prev) => new Set(prev).add(reportKey))

        try {
            const { _version, "": _omit, ...RepData } = report.storage
            const cleanedRepData = cleanEmptyFields(RepData)

            const result = await updateOriginal({
                id: report.subrid ?? report.repId,
                client: deviceId,
                version: _version,
                data: JSON.stringify(cleanedRepData),
            })

            if (result.error) {
                const errorMsg = result.error.message || "保存失败"
                await indexedDBStorage.saveError(report.repId, errorMsg, report.subrid)
                toast.error(`发送失败: ${errorMsg}`)
                await loadPendingReports()
            } else {
                await indexedDBStorage.markAsSaved(report.repId, report.subrid)
                toast.success("报告已成功发送到服务器")
                await loadPendingReports()
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "未知错误"
            await indexedDBStorage.saveError(report.repId, errorMsg, report.subrid)
            toast.error(`发送失败: ${errorMsg}`)
            await loadPendingReports()
        } finally {
            setSendingReports((prev) => {
                const newSet = new Set(prev)
                newSet.delete(reportKey)
                return newSet
            })
        }
    }

    const handleSendAll = async () => {
        if (!isGraphQLBackendReachable) {
            toast.error("后端服务器不可达，无法发送报告")
            return
        }

        if (pendingReports.length === 0) {
            toast.info("没有待发送的报告")
            return
        }

        toast.info(`开始发送 ${pendingReports.length} 个报告...`)

        let successCount = 0
        let failCount = 0

        for (const report of pendingReports) {
            try {
                await handleSendReport(report)
                successCount++
            } catch (error) {
                failCount++
            }
        }

        if (failCount === 0) {
            toast.success(`全部发送成功！共 ${successCount} 个报告`)
        } else {
            toast.warning(`发送完成：成功 ${successCount} 个，失败 ${failCount} 个`)
        }

        await loadPendingReports()
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
                            发送全部未提交的报告
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {pendingReports.map((report, index) => {
                            const reportKey = `${report.repId}${report.subrid ? `:${report.subrid}` : ""}`
                            const isSending = sendingReports.has(reportKey)

                            return (
                                <div key={reportKey} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1 flex-1">
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
                                            {report.metadata.lastError && (
                                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                                                    <strong>上次发送失败:</strong> {report.metadata.lastError}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleSendReport(report)}
                                                variant="default"
                                                size="sm"
                                                disabled={!isGraphQLBackendReachable || isSending}
                                            >
                                                <Send className="w-4 h-4" />
                                                {isSending ? "发送中..." : "发送"}
                                            </Button>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={getReportUrl(report.repId, report.subrid)}>
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button onClick={() => handleDelete(report.repId, report.subrid)} variant="destructive" size="sm">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
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
                        <strong>发送全部：</strong> 点击"发送全部未提交的报告"按钮将所有待发送的报告一次性发送到服务器。
                    </p>
                    <p>
                        <strong>单独发送：</strong> 点击每个报告旁边的"发送"按钮可以单独发送该报告。
                    </p>
                    <p>
                        <strong>删除报告：</strong> 删除待发送报告将清除本地修改，无法恢复。
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
