"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVersionConflictManager, type VersionConflictRequest } from "@/hooks/use-version-conflict-manager"
import { AlertTriangle, CheckCircle, Download, Trash2, EyeOff, Clock } from "lucide-react"
import { format } from "date-fns"

export function VersionConflictManager() {
    const {
        conflictRequests,
        totalConflicts,
        resolvedCount,
        ignoredCount,
        resolveConflict,
        ignoreConflict,
        clearConflicts,
        exportConflictData,
    } = useVersionConflictManager()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "conflict":
                return "bg-red-100 text-red-800 border-red-200"
            case "resolved":
                return "bg-green-100 text-green-800 border-green-200"
            case "ignored":
                return "bg-gray-100 text-gray-800 border-gray-200"
            default:
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "conflict":
                return <AlertTriangle className="w-4 h-4 text-red-500" />
            case "resolved":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "ignored":
                return <EyeOff className="w-4 h-4 text-gray-500" />
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />
        }
    }

    const handleExportData = () => {
        const data = exportConflictData()
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `version-conflicts-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const ConflictRequestCard = ({ conflict }: { conflict: VersionConflictRequest }) => (
        <Card className="mb-3">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(conflict.status)}
                            <h4 className="font-medium">{conflict.operationName}</h4>
                            <Badge className={getStatusColor(conflict.status)}>
                                {conflict.status === "conflict" ? "冲突" : conflict.status === "resolved" ? "已解决" : "已忽略"}
                            </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>发生时间: {format(new Date(conflict.timestamp), "yyyy-MM-dd HH:mm:ss")}</p>
                            <p className="text-red-600">错误信息: {conflict.errorMessage}</p>
                            <p>冲突记录ID: {conflict.invalidId}</p>

                            {Object.keys(conflict.variables).length > 0 && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">查看请求参数</summary>
                                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(conflict.variables, null, 2)}
                  </pre>
                                </details>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                        {conflict.status === "conflict" && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => resolveConflict(conflict.id)}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    已解决
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => ignoreConflict(conflict.id)}
                                    className="text-gray-600 hover:text-gray-700"
                                >
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    忽略
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* 统计概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="text-sm text-gray-600">版本冲突总数</p>
                                <p className="text-2xl font-bold">{totalConflicts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">已解决</p>
                                <p className="text-2xl font-bold">{resolvedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <EyeOff className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">已忽略</p>
                                <p className="text-2xl font-bold">{ignoredCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 冲突控制 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        版本冲突管理
                    </CardTitle>
                    <CardDescription>管理数据版本冲突的请求记录</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={clearConflicts}
                            variant="destructive"
                            disabled={totalConflicts === 0}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            清空冲突记录
                        </Button>

                        <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                            <Download className="w-4 h-4" />
                            导出冲突数据
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 冲突详情 */}
            <Card>
                <CardHeader>
                    <CardTitle>版本冲突列表 ({totalConflicts})</CardTitle>
                    <CardDescription>这些请求因为数据版本冲突而失败，需要手动处理或在获取最新数据后重新操作</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        {conflictRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>暂无版本冲突</p>
                                <p className="text-sm">所有操作都成功执行</p>
                            </div>
                        ) : (
                            conflictRequests.map((conflict) => <ConflictRequestCard key={conflict.id} conflict={conflict} />)
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
