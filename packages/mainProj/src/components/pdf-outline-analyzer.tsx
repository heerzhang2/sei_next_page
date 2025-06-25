"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import { usePageMarkinfo } from "@/hooks/usePrintPdf"
import { createPdfJob } from "@/report/footer/job"
import { PdfOutlineCacheManager, type PdfOutlineCacheItem } from "@/lib/indexeddb-cache"

interface OutlineItem {
    title: string
    page: number
    level: number
}

export interface OutlineData {
    outline: OutlineItem[]
    totalPages: number
    title: string
}

interface PdfOutlineAnalyzerProps {
    rep?: any
}

export default function PdfOutlineAnalyzer({ rep }: PdfOutlineAnalyzerProps) {
    const dbkvId = "current-pdf-job"
    const pdf_job = createPdfJob(rep, true)

    // 初始化缓存管理器
    const [cacheManager] = useState(
        () =>
            new PdfOutlineCacheManager(
                {
                    dbName: "appCache",
                    storeName: "pdfMarkPage",
                    version: 1,
                },
                10,
            ),
    )

    const [currentOutline, setCurrentOutline] = useState<PdfOutlineCacheItem | null>(null)
    const [cachedOutlines, setCachedOutlines] = useState<PdfOutlineCacheItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [initialized, setInitialized] = useState(false)

    // 缓存成功回调函数
    const handleCacheSuccess = async (outlineData: OutlineData, jobId: string) => {
        try {
            await cacheManager.addOutlineData(jobId, outlineData, outlineData.title, outlineData.totalPages)
            console.log("书签数据已缓存:", jobId)
            await refreshCachedData()
        } catch (error) {
            console.error("缓存书签数据失败:", error)
        }
    }

    // 使用带缓存回调的 hook
    const [isGetMarking, handleSubmit, outlineData] = usePageMarkinfo(pdf_job, handleCacheSuccess)

    // 初始化数据库并自动加载数据
    useEffect(() => {
        const initDB = async () => {
            try {
                await cacheManager.init()
                await loadCurrentData()
                await refreshCachedData()
                setInitialized(true)
            } catch (error) {
                console.error("Failed to initialize database:", error)
                setError("数据库初始化失败")
                setInitialized(true)
            }
        }
        initDB()
    }, [dbkvId])

    // 加载当前数据（仅从缓存）
    const loadCurrentData = async () => {
        try {
            console.log(`正在从缓存加载数据: ${dbkvId}`)
            const cachedData = await cacheManager.getOutlineData(dbkvId)

            if (cachedData) {
                console.log(`缓存命中: ${dbkvId}`)
                setCurrentOutline(cachedData)
                setError("")
            } else {
                console.log(`缓存未命中: ${dbkvId}`)
                setCurrentOutline(null)
                setError("")
            }
        } catch (error) {
            console.error("Failed to load data:", error)
            setError("加载数据失败")
        }
    }

    // 刷新缓存数据列表
    const refreshCachedData = async () => {
        try {
            const cached = await cacheManager.getAllOutlineData()
            setCachedOutlines(cached)
        } catch (error) {
            console.error("Failed to refresh cached data:", error)
        }
    }

    // 删除缓存
    const handleDeleteCache = async (id: string) => {
        try {
            await cacheManager.deleteCache(id)
            await refreshCachedData()
            if (currentOutline?.id === id) {
                setCurrentOutline(null)
            }
        } catch (error) {
            console.error("Failed to delete cache:", error)
        }
    }

    // 清空所有缓存
    const handleClearAll = async () => {
        if (!confirm("确定要清空所有缓存吗？")) return

        try {
            await cacheManager.clearAll()
            await refreshCachedData()
            setCurrentOutline(null)
        } catch (error) {
            console.error("Failed to clear all cache:", error)
        }
    }

    if (!initialized) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mr-3" />
                    <span>正在初始化...</span>
                </div>
            </div>
        )
    }

    // 渲染大纲树结构
    const renderOutlineTree = (items: OutlineItem[]) => {
        return items.map((item, index) => (
            <div key={index} className={`ml-${(item.level - 1) * 4}`}>
                <div className="flex items-center gap-0">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                        第<span className="text-sm">{item.page}</span>页
                    </Badge>
                </div>
            </div>
        ))
    }

    return (
        <>
            {error && (
                <div className="bg-red-100 p-3 rounded mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* 当前书签数据显示 */}
            {(outlineData?.outline?.length! > 0 || currentOutline?.outlineData?.outline?.length > 0) && (
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>书签视图</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {outlineData ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                            <strong>总页数:</strong> {outlineData.totalPages || ""}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>标题:</strong> {outlineData.title}
                                        </div>
                                        <Badge variant="default">最新数据</Badge>
                                    </div>
                                    <div className="space-y-0 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData.outline)}</div>
                                </>
                            ) : currentOutline ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                        <div>
                                            <strong>总页数:</strong> {currentOutline.totalPages || ""}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>标题:</strong> {currentOutline.title}
                                        </div>
                                        <Badge variant="secondary">来自缓存</Badge>
                                    </div>
                                    <div className="space-y-0 max-h-96 overflow-y-auto">
                                        {renderOutlineTree(currentOutline.outlineData.outline)}
                                    </div>
                                </>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 操作按钮 */}
            <Button onClick={handleSubmit} disabled={isGetMarking} className="w-full mb-6">
                {isGetMarking ? "分析中..." : "🎯 提取书签信息"}
            </Button>

            {/* 缓存管理 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>缓存管理</CardTitle>
                            <p className="text-sm text-muted-foreground">当前缓存 {cachedOutlines.length}/10 条书签数据</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={refreshCachedData}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                刷新
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={cachedOutlines.length === 0}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                清空缓存
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {cachedOutlines.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">暂无缓存数据</div>
                    ) : (
                        <div className="space-y-3">
                            {cachedOutlines.map((item, index) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            ID: {item.id} | 总页数: {item.totalPages}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            缓存时间: {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCache(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
