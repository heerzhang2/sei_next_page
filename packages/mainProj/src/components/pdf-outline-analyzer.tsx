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
const MAX_CACHE_SIZE = 6;       //最多缓存几个对象的。

export default function PdfOutlineAnalyzer({rep}: PdfOutlineAnalyzerProps) {
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [items, setItems] = useState<CacheItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const pdf_job = createPdfJob(rep, true);
    const [pdfInfo, setPdfInfo] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    // const [pdfFile, setPdfFile] = useState<File | null>(null)

    // 初始化数据库连接（修正版）
    useEffect(() => {
        const initDB = async () => {
            try {
                const request = indexedDB.open('nextjs_cache_db', 1);

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains('items')) {
                        db.createObjectStore('items', { keyPath: 'id' });
                    }
                };

                request.onsuccess = () => {
                    const dbInstance = (request.result as IDBDatabase);
                    setDb(dbInstance);
                    // 直接使用数据库实例，避免状态延迟
                    loadInitialData(dbInstance);
                };

                request.onerror = (event) => {
                    setError(`数据库初始化失败: ${(event.target as IDBOpenDBRequest).errorCode}`);
                };
            } catch (err) {
                setError(`初始化异常: ${err instanceof Error ? err.message : '未知错误'}`);
            }
        };

        initDB();
    }, []);
    // 加载初始数据（修正版）
    const loadInitialData = useCallback((db: IDBDatabase) => {
        const transaction = db.transaction('items', 'readonly');
        const store = transaction.objectStore('items');
        // 使用 Promise 封装异步操作
        const getData = () => {
            return new Promise<IDBRequest>((resolve) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request);
                request.onerror = (e) => console.error('数据加载失败:', e);
            });
        };
        getData().then((request) => {
            const allItems = (request.result as CacheItem[]) || [];
            setItems(allItems); // 正确类型转换
        });
    }, []);
    //cache容量控制
    const getItemCount = async (): Promise<number> => {
        return new Promise((resolve, reject) => {
            const transaction = db!.transaction('items', 'readonly');
            const store = transaction.objectStore('items');
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target!.errorCode);
        });
    };
    // 添加缓存项（带FIFO策略）
    const addItem = useCallback(async (id:string,data: any) => {
        if (!db) return;
        const transaction = db.transaction('items', 'readwrite');
        const store = transaction.objectStore('items');
        try {
            // 检查是否存在相同ID
            const existing = await store.get(id); // 实际场景应使用业务ID
            if (existing) {
                await store.delete(id);
                setItems(prev => prev.filter(item => item.id !== id));
            }
            // 插入新数据
            await store.add({
                id: id,
                data,
                createdAt: Date.now()
            } );
            setItems(prev => [{
                id: id,
                data,
                createdAt: Date.now()
            } , ...prev]);  // 立即更新UI状态
            // 容量控制
            const count = await getItemCount();
            if (count > MAX_CACHE_SIZE) {
                const oldest = await store.index('createdAt').openCursor(null, 'next');
                oldest.onsuccess = async () => {
                    await store.delete((oldest.result as IDBCursorWithValue).key);
                    setItems(prev => prev.filter(item => item.id !== oldest.result?.key));
                };
            }
        } catch (err) {
            setError(`添加失败: ${err instanceof Error ? err.message : '未知错误'}`);
        }
    }, [db]);
    // 获取缓存项（更新访问时间）
    const getItem = useCallback(async (id: string) => {
        if (!db) return null;

        const transaction = db.transaction('items', 'readwrite');
        const store = transaction.objectStore('items');

        try {
            const item = await store.get(id);
            if (!item) return null;
            // 更新访问时间
            await store.put({ ...item, createdAt: Date.now() });
            // @ts-ignore
            return item.data;
        } catch (err) {
            setError(`获取失败: ${err instanceof Error ? err.message : '未知错误'}`);
            return null;
        }
    }, [db]);
    // 自动重新加载数据（页面聚焦时）
    // useEffect(() => {
    //     const handleVisibilityChange = () => {
    //         if (document.visibilityState === 'visible') {
    //             loadInitialData();
    //         }
    //     };
    //     document.addEventListener('visibilitychange', handleVisibilityChange);
    //     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // }, [loadInitialData]);

    // 测试数据初始化
    // useEffect(() => {
    //     const demoData = Array.from({ length: 3 }, (_, i) => ({
    //         id: `demo-${i}`,
    //         data: { title: `示例数据 ${i + 1}`, content: '这是测试内容' }
    //     }));
    //
    //     demoData.forEach(item => addItem(item.id, item.data));
    // }, [addItem]);



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

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generate">报告的书签</TabsTrigger>
                    <TabsTrigger value="analyze">原始记录的书签</TabsTrigger>
                </TabsList>
                <TabsContent value="generate" className="space-y-4">
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
                </TabsContent>
                <TabsContent value="analyze" className="space-y-4">
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
                    <Button onClick={handleSubmit} disabled={isGetMarking}
                            className="w-full">
                        {isGetMarking ? "分析中..." : "📄 提取书签信息"}
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    )
}
