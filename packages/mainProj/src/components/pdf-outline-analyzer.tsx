"use client"
import {useState, useRef, useEffect, useCallback } from 'react';
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Textarea} from "@/components/ui/textarea"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {usePageMarkinfo, usePrintPdf} from "@/hooks/usePrintPdf";
import {createPdfJob} from "@/report/footer/job";
import { v4 as uuidv4 } from 'uuid';
import { Loader2, RefreshCw, Trash2, Download } from "lucide-react"
import {UserCacheManager} from "@/components/indexeddb-cache";

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
    rep?: any,
}

interface CacheItem {
    //必须有一个唯一性标识串的： 采用对象模型内置id做法的。
    id: string;
    data: any;
    createdAt: number;
}


export default function PdfOutlineAnalyzer({rep}: PdfOutlineAnalyzerProps) {
    const dbkvId="sdfdsf";
    const [items, setItems] = useState<CacheItem[]>([]);
    // const [error, setError] = useState<string | null>(null);
    const pdf_job = createPdfJob(rep, true);
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    // const [pdfFile, setPdfFile] = useState<File | null>(null) 文件上传的管理；
    const [userCache] = useState(
        () =>
            new UserCacheManager(
                {
                    dbName: "appCache",
                    storeName: "pdfMarkPage",
                    version: 1,
                },
                10,
            ),
    )

    const [currentRep, setCurrentRep] = useState<CacheItem | null>(null)
    const [cachedUsers, setCachedUsers] = useState<CacheItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [initialized, setInitialized] = useState(false)
    const [stats, setStats] = useState({ count: 0, maxItems: 6 })

    // 初始化数据库并自动加载指定用户数据
    useEffect(() => {
        const initDB = async () => {
            try {
                await userCache.init()
                await loadUserData()
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

    // 加载指定用户数据（仅从缓存）
    const loadUserData = async () => {
        try {
            console.log(`正在从缓存加载用户: ${dbkvId}`)
            const cachedData = await userCache.getUser(dbkvId)

            if (cachedData) {
                console.log(`缓存命中: ${dbkvId}`)
                setCurrentRep(cachedData)
                setError("")
            } else {
                console.log(`缓存未命中: ${dbkvId}`)
                setCurrentRep(null)
                setError("")
            }
        } catch (error) {
            console.error("Failed to load user data:", error)
            setError("加载用户数据失败")
        }
    }

    // 刷新缓存数据列表
    const refreshCachedData = async () => {
        try {
            const [cached, cacheStats] = await Promise.all([userCache.getAllUsers(), userCache.getStats()])
            setCachedUsers(cached)
            setStats(cacheStats)
        } catch (error) {
            console.error("Failed to refresh cached data:", error)
        }
    }

    // 手动从API获取数据
    const handleFetchFromAPI = async () => {
        setLoading(true)
        setError("")

        try {
            const result = await userCache.fetchAndCache(dbkvId)

            if (result.data) {
                setCurrentRep(result.data)
                await refreshCachedData()
            } else {
                setError(result.error || "获取数据失败")
            }
        } catch (error) {
            console.error("Fetch failed:", error)
            setError("获取数据失败")
        } finally {
            setLoading(false)
        }
    }

    // 刷新当前用户数据（从缓存）
    const handleRefreshCache = async () => {
        await loadUserData()
    }

    // 删除缓存
    const handleDeleteCache = async (id: string) => {
        try {
            await userCache.deleteUser(id)
            await refreshCachedData()
            if (currentRep?.id === id) {
                setCurrentRep(null)
            }
        } catch (error) {
            console.error("Failed to delete cache:", error)
        }
    }

    // 清空所有缓存
    const handleClearAll = async () => {
        if (!confirm("确定要清空所有缓存吗？")) return

        try {
            await userCache.clearAll()
            await refreshCachedData()
            setCurrentRep(null)
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
            <div key={index} className={`ml-${(item.level - 1) * 4} `}>
                <div className="flex items-center gap-0">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs px-1 py-0">
                        第<span className="text-sm">{item.page}</span>页
                    </Badge>
                </div>
            </div>
        ))
    }
    const [isGetMarking, handleSubmit, outlineData] = usePageMarkinfo(pdf_job)

    return (<>
        {error && (
            <div className="bg-red-100 p-3 rounded mb-4">
                <p className="text-red-700">{error}</p>
            </div>
        )}
        <h2 className="text-xl font-semibold mb-2">当前缓存项 ({items.length})</h2>
        {items.map((item) => (
            <div key={item.id} className="mb-2 p-2 border rounded">
                <p>ID: {item.id}</p>
                <p>创建时间: {new Date(item.createdAt).toLocaleString()}</p>
            </div>
        ))}

        {outlineData?.outline?.length! > 0 && (
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>书签视图</CardTitle>
                    </CardHeader>
                    <CardContent>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <strong>总页数:</strong> {outlineData!.totalPages || ""}
                            </div>
                            <div className="col-span-2">
                                <strong>标题:</strong> {outlineData!.title}
                            </div>
                        </div>
                        <div className="space-y-0 max-h-96 overflow-y-auto">{renderOutlineTree(outlineData!.outline)}</div>


                    </CardContent>
                </Card>
            </div>
        )}
        <Button onClick={handleSubmit} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? "分析中..." : "🎯 提取书签信息"}
        </Button>
        {/* 添加测试按钮 */}
        <button
            onClick={() => addItem(`demo-las可kbk8`, { name: `新数据-${Date.now()}` })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            添加测试数据
        </button>
    </>)
}
