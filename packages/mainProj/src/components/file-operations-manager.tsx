// components/file-operations-manager.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, FolderOpen, FileText, Hash } from "lucide-react"
import Link from "next/link"
import { useGroupedUppyStates } from "@/hooks/useGroupedUppyStates"

export function FileOperationsManager() {
    const { groups, loading } = useGroupedUppyStates()
    
    // 获取 basePath，用于处理链接
    const basePath = "/report";
    
    // 处理链接，移除重复的 basePath 前缀
    const normalizeUrl = (url: string) => {
        if (!url) return url;
        // 如果 URL 已经以 basePath 开头，则移除它
        if (url.startsWith(basePath)) {
            return url.slice(basePath.length);
        }
        return url;
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        离线上传状态分组 ({groups.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Alert>
                            <AlertDescription>加载中...</AlertDescription>
                        </Alert>
                    ) : groups.length === 0 ? (
                        <Alert>
                            <AlertDescription>暂无离线保存的上传状态</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-3">
                            {groups.map((group, index) => (
                                <Card key={`${group.repId}-${group.subrid || 'root'}-${index}`} className="border">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>报告 ID:</span>
                                                    <code className="bg-gray-100 px-2 py-0.5 rounded">{group.repId}</code>
                                                </div>
                                                {group.subrid ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Hash className="w-3.5 h-3.5" />
                                                        <span>子报告 ID:</span>
                                                        <code className="bg-gray-100 px-2 py-0.5 rounded">{group.subrid}</code>
                                                    </div>
                                                ) : null}
                                                <p className="text-xs text-gray-500">
                                                    待处理操作数: <span className="font-semibold">{group.count}</span>
                                                </p>
                                            </div>

                                            {group.originalPageUrl ? (
                                                <Button asChild size="sm" className="text-white bg-blue-300 hover:bg-blue-500">
                                                    <Link href={normalizeUrl(group.originalPageUrl)}>
                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                        跳转编辑
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button disabled size="sm">
                                                    无跳转链接
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}