"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, Trash2, Download, CheckCircle, XCircle, Clock } from "lucide-react"
import { useMutationCompensation } from "@/hooks/use-mutation-compensation"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

export function MutationCompensationPanel() {
  const {
    compensationMutations,
    isInitialized,
    statistics,
    refreshCompensationList,
    retryCompensationMutation,
    retryAllCompensation,
    clearCompensation,
    exportCompensationData,
  } = useMutationCompensation()

  const handleExport = () => {
    const data = exportCompensationData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mutation-compensation-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            正在加载补偿机制...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Mutation补偿机制
            </CardTitle>
            <CardDescription>独立备份队列，防止mutation丢失</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshCompensationList}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground">总备份数</div>
          </div>
          <div className="rounded-lg border p-3 bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <div className="text-xs text-muted-foreground">待处理</div>
          </div>
          <div className="rounded-lg border p-3 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{statistics.retrying}</div>
            <div className="text-xs text-muted-foreground">重试中</div>
          </div>
          <div className="rounded-lg border p-3 bg-red-50">
            <div className="text-2xl font-bold text-red-600">{statistics.failed}</div>
            <div className="text-xs text-muted-foreground">失败</div>
          </div>
        </div>

        {/* 批量操作 */}
        {statistics.pending > 0 && (
          <div className="flex gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-sm">发现 {statistics.pending} 个待补偿的mutation</div>
              <div className="text-xs text-muted-foreground mt-1">
                这些mutation可能因为网络中断或页面刷新而未能成功发送
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={retryAllCompensation}>
                <RefreshCw className="mr-2 h-4 w-4" />
                全部重试
              </Button>
              <Button size="sm" variant="destructive" onClick={clearCompensation}>
                <Trash2 className="mr-2 h-4 w-4" />
                清空
              </Button>
            </div>
          </div>
        )}

        {/* Mutation列表 */}
        <div className="space-y-2">
          {compensationMutations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-2 text-green-500" />
              <div>没有待补偿的mutation</div>
              <div className="text-xs mt-1">所有操作都已成功同步</div>
            </div>
          ) : (
            compensationMutations.map((mutation) => (
              <div
                key={mutation.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{mutation.operationName}</span>
                    <Badge
                      variant={
                        mutation.status === "pending"
                          ? "secondary"
                          : mutation.status === "retrying"
                            ? "default"
                            : mutation.status === "failed"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {mutation.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                      {mutation.status === "retrying" && <RefreshCw className="mr-1 h-3 w-3" />}
                      {mutation.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                      {mutation.status === "success" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {mutation.status}
                    </Badge>
                    {mutation.retryCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        重试 {mutation.retryCount} 次
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    备份时间:{" "}
                    {formatDistanceToNow(new Date(mutation.backupTimestamp), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </div>
                  {mutation.variables?.id && (
                    <div className="text-xs text-muted-foreground">ID: {mutation.variables.id}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {(mutation.status === "pending" || mutation.status === "failed") && (
                    <Button size="sm" variant="outline" onClick={() => retryCompensationMutation(mutation.id)}>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      重试
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
