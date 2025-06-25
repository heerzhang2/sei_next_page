"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import {usePageMarkinfo, usePageMarkLocal} from "@/hooks/usePrintPdf"
import { createPdfJob } from "@/report/footer/job"
import { PdfOutlineCacheManager, type PdfOutlineCacheItem } from "@/lib/indexeddb-cache"
import {toast} from "sonner";

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
}

export default function PdfOutlineAnalyzer({ rep,slug }: PdfOutlineAnalyzerProps) {
    const dbkvId = rep?.id+"-"+slug;        //唯一性保证
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

    //服务端提取的回调函数
    const handleCacheSuccess = async (outlineData: OutlineData) => {
        try {
            await cacheManager.addOutlineData(dbkvId, outlineData.outline, outlineData.totalPages)
            console.log("书签数据已缓存:", dbkvId)
            await refreshCachedData()
        } catch (error) {
            console.error("缓存书签数据失败:", error)
        }
    }
    //服务端提取的hook
    const [isGetMarking, handleSubmit] = usePageMarkinfo(pdf_job, handleCacheSuccess)
    const [localGetMarking, handleSubmitLocal] = usePageMarkLocal(pdf_job, handleCacheSuccess)
    const handleMarkGeneration = async () => {
        if(!handleSubmitLocal)
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
    if(!initialized)   return <span>在初始化indexDB...</span>
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
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <Card>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                    <strong>总页数:</strong> {currentOutline.totalPages || ""}
                                </div>
                            </div>
                            { (currentOutline?.outline?.length! > 0) &&
                                <div className="space-y-0 max-h-96 overflow-y-auto">{renderOutlineTree(currentOutline.outline)}</div>
                            }
                        </CardContent>
                    </Card>
                </div>
                ) :
                <div className="text-center">还没有数据!</div>
            }
            <div className="text-center">
                <Button onClick={handleMarkGeneration} disabled={isGetMarking || localGetMarking} className="mb-6">
                    {isGetMarking ? "本地目录生成..." : "🎯 本机提取书签"}
                </Button>
                <Button onClick={handleSubmit} disabled={isGetMarking || localGetMarking} className="ml-4 mb-6">
                    {isGetMarking ? "分析中..." : "服务端提取书签"}
                </Button>
            </div>
        </>
    )
}
