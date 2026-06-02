"use client";

import { useEffect, useState, useMemo } from "react";
import { useTrackedProcesses, TrackedProcess } from "@/hooks/use-tracked-processes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";
import { withBasePath } from "@/lib/tool"

export default function TrackedProcessesPage() {
  const {
    processes,
    isLoaded,
    removeProcess,
    clearAll,
    cleanupOldProcesses,
    batchUpdateProcesses,
    runningCount,
    completedCount,
    failedCount,
  } = useTrackedProcesses();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    message: string;
    stats?: { total: number; running: number; completed: number; failed: number; unknown: number };
  } | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // 计算分页数据
  const totalPages = Math.ceil(processes.length / PAGE_SIZE);
  const paginatedProcesses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return processes.slice(start, end);
  }, [processes, currentPage]);

  // 当流程列表变化时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [processes.length]);

  // 页面加载时清理旧记录
  useEffect(() => {
    if (isLoaded) {
      cleanupOldProcesses();
    }
  }, [isLoaded, cleanupOldProcesses]);

  // 刷新状态（从 Camunda 同步流程实例状态）- 只同步当前页
  const handleRefresh = async () => {
    if (paginatedProcesses.length === 0) {
      setSyncResult({ message: "当前页面没有需要同步的流程实例" });
      return;
    }

    setIsRefreshing(true);
    setSyncResult(null);

    try {
      // 只同步当前页的流程实例
      const processInstanceKeys = paginatedProcesses.map(p => p.processInstanceKey);

      const response = await fetch(withBasePath('/api/camunda/batch-sync'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processInstanceKeys }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 批量更新本地状态
        const updates = result.data.map((item: any) => ({
          processInstanceKey: item.processInstanceKey,
          status: item.status as TrackedProcess["status"],
          error: item.error,
        }));
        batchUpdateProcesses(updates);

        setSyncResult({
          message: `${result.message}（第 ${currentPage}/${totalPages} 页）`,
          stats: result.stats,
        });
      } else {
        setSyncResult({
          message: result.message || result.error || "同步失败",
        });
      }
    } catch (error: any) {
      console.error("同步流程状态失败:", error);
      setSyncResult({
        message: `同步失败: ${error.message}`,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 切换页面
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSyncResult(null); // 切换页面时清除同步结果
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            运行中
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            已完成
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            失败
          </Badge>
        );
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    try {
      return formatDistanceToNow(new Date(timeStr), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return timeStr;
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">流程跟踪</h1>
          <p className="text-muted-foreground mt-1">
            查看您跟踪的所有流程状态
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={`同步第 ${currentPage}/${totalPages} 页的 ${paginatedProcesses.length} 个流程实例`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            同步当前页 ({currentPage}/{totalPages})
          </Button>
        </div>
      </div>

      {/* 同步结果提示 */}
      {syncResult && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          syncResult.stats 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
        }`}>
          <p className="font-medium">{syncResult.message}</p>
          {syncResult.stats && (
            <p className="mt-1 text-xs">
              总计: {syncResult.stats.total} | 
              运行中: {syncResult.stats.running} | 
              已完成: {syncResult.stats.completed} | 
              失败: {syncResult.stats.failed} | 
              未知: {syncResult.stats.unknown}
            </p>
          )}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">运行中</p>
                <p className="text-2xl font-bold text-blue-600">{runningCount}</p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">失败</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 流程列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>流程列表</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              共 {processes.length} 个流程实例
              {totalPages > 1 && `，第 ${currentPage}/${totalPages} 页`}
            </p>
          </div>
          {processes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              清空全部
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {processes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">暂无跟踪的流程</p>
              <Link href="/">
                <Button variant="outline" className="mt-4">
                  回首页
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedProcesses.map((process) => (
                  <div
                    key={process.processInstanceKey}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(process.status)}
                        <span className="font-medium truncate">
                          {process.title}
                        </span>
                        {getStatusBadge(process.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>流程实例: {process.processInstanceKey}</p>
                        <p>创建时间: {formatTime(process.createdAt)}</p>
                        <p>最后更新: {formatTime(process.lastUpdated)}</p>
                        {process.result && (
                          <p className="text-green-600">
                            成功: {process.result.results?.success || 0} 个, 
                            失败: {process.result.results?.failed || 0} 个
                          </p>
                        )}
                        {process.error && (
                          <p className="text-red-600">错误: {process.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/camunda/process/${process.processInstanceKey}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProcess(process.processInstanceKey)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    显示 {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, processes.length)} / {processes.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
      </CardContent>
      </Card>
    </div>
  );
}
