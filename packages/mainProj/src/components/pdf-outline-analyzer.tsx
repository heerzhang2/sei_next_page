"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { usePageMarkinfo, usePageMarkLocal } from "@/hooks/usePrintPdf"
import { createPdfJob } from "@/report/footer/job"
import { PdfOutlineCacheManager, type PdfOutlineCacheItem } from "@/lib/indexeddb-cache"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OutlineItem {
    title: string
    page: number
    level: number
}

export interface OutlineData {
    outline: OutlineItem[]
    totalPages: number
    // title: string
}

interface PdfOutlineAnalyzerProps {
    rep?: any
    //报告或原始记录区分的标记
    slug: string
    inline?: boolean
    // 新增：用于向父组件报告加载状态的回调
    onLoadingChange?: (isLoading: boolean) => void
}

/**提取web转换成的 pdf书签；
 * 仅仅适合单一个URL的生成Pdf情况：
 * */
export default function PdfOutlineAnalyzer({ rep, slug, inline, onLoadingChange }: PdfOutlineAnalyzerProps) {
    const dbkvId = rep?.id + "-" + slug //唯一性保证
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
    const [error, setError] = useState("")
    const [initialized, setInitialized] = useState(false)

    //服务端提取的回调函数
    const handleCacheSuccess = async (outlineData: OutlineData) => {
        try {
            await cacheManager.addOutlineData(dbkvId, outlineData.outline, outlineData.totalPages)
            // console.log("书签数据已缓存:", dbkvId)
            await refreshCachedData()
            await loadCurrentData()
        } catch (error) {
            console.error("缓存书签数据失败:", error)
        }
    }
    //请nextjs服务端 提取的
    const [isGetMarking, handleSubmit] = usePageMarkinfo(pdf_job, handleCacheSuccess)
    //本机浏览器客户端 提取办法的
    const [localGetMarking, handleSubmitLocal] = usePageMarkLocal(pdf_job, handleCacheSuccess)

    // 计算总的加载状态
    const isLoading = isGetMarking || localGetMarking

    // 当加载状态改变时通知父组件
    useEffect(() => {
        onLoadingChange?.(isLoading)
    }, [isLoading, onLoadingChange])

    const handleMarkGeneration = async () => {
        if (!handleSubmitLocal)
            toast.error("操作失败", {
                description: "请确认文书打印转换器在运行" + error,
            })
        else {
            await handleSubmitLocal()
        }
    }
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
            const cachedData = await cacheManager.getOutlineData(dbkvId)
            if (cachedData) {
                setCurrentOutline(cachedData)
                setError("")
            } else {
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
    if (!initialized) return <span>在初始化indexDB...</span>
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
            {currentOutline ? (
                <div className={cn("grid grid-cols-1 gap-0 mb-2", inline && "max-h-60 overflow-y-auto")}>
                    <Card className="py-0.5">
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 text-sm mb-0">
                                <div>
                                    <strong>总页数:</strong> {currentOutline.totalPages || ""}
                                </div>
                            </div>
                            {currentOutline?.outline?.length! > 0 && (
                                <div className="space-y-0">{renderOutlineTree(currentOutline.outline)}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="w-full max-w-[35rem] min-w-screen">还没有数据!</div>
            )}
            {!inline && (
                <div className="text-center">
                    <Button onClick={handleMarkGeneration} disabled={isLoading} className="mb-6">
                        {localGetMarking ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                本地目录生成...
                            </>
                        ) : (
                            "🎯 本机提取书签"
                        )}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="ml-4 mb-6">
                        {isGetMarking ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                分析中...
                            </>
                        ) : (
                            "服务端提取书签"
                        )}
                    </Button>
                </div>
            )}
        </>
    )
}
