"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Trash2, Download } from "lucide-react"

// 数据类型定义
interface CacheItem {
    id: string
    name: string
    email: string
    avatar: string
    department: string
    timestamp: number // 缓存时间
}

// 模拟后端API响应
interface ApiResponse {
    success: boolean
    data?: CacheItem
    message?: string
}

// 组件Props
interface ComponentProps {
    userId: string // 外部注入的用户ID
}

// IndexedDB 缓存管理类
class IndexedDBCache {
    private dbName = "appCache"
    private storeName = "pdfMarkPage"
    private version = 1
    private maxItems = 6
    private db: IDBDatabase | null = null

    // 初始化数据库
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                this.db = request.result
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: "id" })
                    store.createIndex("timestamp", "timestamp", { unique: false })
                }
            }
        })
    }

    // 从缓存获取特定ID的数据（读取时更新时间戳）
    async getFromCache(id: string): Promise<CacheItem | null> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readwrite")
            const store = transaction.objectStore(this.storeName)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const item = getRequest.result

                if (item) {
                    // 更新时间戳为当前时间
                    const updatedItem = {
                        ...item,
                        timestamp: Date.now(),
                    }

                    // 将更新后的数据写回缓存
                    const putRequest = store.put(updatedItem)

                    putRequest.onsuccess = () => {
                        console.log(`缓存读取并更新时间戳: ${id}`)
                        resolve(updatedItem)
                    }

                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    resolve(null)
                }
            }

            getRequest.onerror = () => reject(getRequest.error)
            transaction.onerror = () => reject(transaction.error)
        })
    }

    // 模拟后端API请求
    private async fetchFromAPI(id: string): Promise<ApiResponse> {
        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

        // 模拟一些预设的用户数据
        const mockUsers: Record<string, Omit<CacheItem, "timestamp">> = {
            user001: {
                id: "user001",
                name: "张三",
                email: "zhangsan@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "技术部",
            },
            user002: {
                id: "user002",
                name: "李四",
                email: "lisi@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "产品部",
            },
            user003: {
                id: "user003",
                name: "王五",
                email: "wangwu@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "设计部",
            },
            user004: {
                id: "user004",
                name: "赵六",
                email: "zhaoliu@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "运营部",
            },
            user005: {
                id: "user005",
                name: "钱七",
                email: "qianqi@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "市场部",
            },
            user006: {
                id: "user006",
                name: "孙八",
                email: "sunba@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "财务部",
            },
            user007: {
                id: "user007",
                name: "周九",
                email: "zhoujiu@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "人事部",
            },
            admin: {
                id: "admin",
                name: "管理员",
                email: "admin@example.com",
                avatar: "/placeholder.svg?height=40&width=40",
                department: "管理部",
            },
        }

        const userData = mockUsers[id]

        if (userData) {
            return {
                success: true,
                data: { ...userData, timestamp: Date.now() },
            }
        } else {
            return {
                success: false,
                message: `用户 ${id} 不存在`,
            }
        }
    }

    // 从API获取数据并更新缓存（带FIFO机制）
    async fetchAndCache(id: string): Promise<{ data: CacheItem | null; error?: string }> {
        try {
            console.log(`正在从API获取用户: ${id}`)
            const apiResponse = await this.fetchFromAPI(id)

            if (apiResponse.success && apiResponse.data) {
                await this.addItem(apiResponse.data)
                console.log(`数据已缓存: ${id}`)
                return { data: apiResponse.data }
            } else {
                return { data: null, error: apiResponse.message }
            }
        } catch (error) {
            console.error("API请求失败:", error)
            return { data: null, error: "API请求失败" }
        }
    }

    // 添加数据到缓存（FIFO机制）
    private async addItem(item: CacheItem): Promise<void> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readwrite")
            const store = transaction.objectStore(this.storeName)

            // 首先检查是否已存在相同ID的项目
            const getRequest = store.get(item.id)

            getRequest.onsuccess = () => {
                const existingItem = getRequest.result

                if (existingItem) {
                    // 如果存在，更新数据和时间戳
                    const putRequest = store.put(item)
                    putRequest.onsuccess = () => resolve()
                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    // 如果不存在，检查是否超过最大数量
                    const getAllRequest = store.getAll()

                    getAllRequest.onsuccess = () => {
                        const allItems = getAllRequest.result

                        if (allItems.length >= this.maxItems) {
                            // 删除最旧的项目（时间戳最小的）
                            const oldestItem = allItems.sort((a: CacheItem, b: CacheItem) => a.timestamp - b.timestamp)[0]
                            const deleteRequest = store.delete(oldestItem.id)

                            deleteRequest.onsuccess = () => {
                                // 删除成功后添加新项目
                                const addRequest = store.add(item)
                                addRequest.onsuccess = () => resolve()
                                addRequest.onerror = () => reject(addRequest.error)
                            }
                            deleteRequest.onerror = () => reject(deleteRequest.error)
                        } else {
                            // 直接添加新项目
                            const addRequest = store.add(item)
                            addRequest.onsuccess = () => resolve()
                            addRequest.onerror = () => reject(addRequest.error)
                        }
                    }
                    getAllRequest.onerror = () => reject(getAllRequest.error)
                }
            }
            getRequest.onerror = () => reject(getRequest.error)

            transaction.onerror = () => reject(transaction.error)
        })
    }

    // 获取所有缓存数据
    async getAllCached(): Promise<CacheItem[]> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readonly")
            const store = transaction.objectStore(this.storeName)
            const request = store.getAll()

            request.onsuccess = () => {
                const items = request.result.sort((a: CacheItem, b: CacheItem) => b.timestamp - a.timestamp)
                resolve(items)
            }
            request.onerror = () => reject(request.error)
        })
    }

    // 删除特定缓存
    async deleteCache(id: string): Promise<void> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readwrite")
            const store = transaction.objectStore(this.storeName)
            const request = store.delete(id)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    // 清空所有缓存
    async clearAll(): Promise<void> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readwrite")
            const store = transaction.objectStore(this.storeName)
            const request = store.clear()

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
}

// React 组件
export default function Component({ userId }: ComponentProps) {
    const [cache] = useState(() => new IndexedDBCache())
    const [currentUser, setCurrentUser] = useState<CacheItem | null>(null)
    const [cachedUsers, setCachedUsers] = useState<CacheItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [initialized, setInitialized] = useState(false)

    // 初始化数据库并自动加载指定用户数据
    useEffect(() => {
        const initDB = async () => {
            try {
                await cache.init()
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
    }, [userId])

    // 加载指定用户数据（仅从缓存）
    const loadUserData = async () => {
        try {
            console.log(`正在从缓存加载用户: ${userId}`)
            const cachedData = await cache.getFromCache(userId)

            if (cachedData) {
                console.log(`缓存命中: ${userId}`)
                setCurrentUser(cachedData)
                setError("")
            } else {
                console.log(`缓存未命中: ${userId}`)
                setCurrentUser(null)
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
            const cached = await cache.getAllCached()
            setCachedUsers(cached)
        } catch (error) {
            console.error("Failed to refresh cached data:", error)
        }
    }

    // 手动从API获取数据
    const handleFetchFromAPI = async () => {
        setLoading(true)
        setError("")

        try {
            const result = await cache.fetchAndCache(userId)

            if (result.data) {
                setCurrentUser(result.data)
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
            await cache.deleteCache(id)
            await refreshCachedData()
            if (currentUser?.id === id) {
                setCurrentUser(null)
            }
        } catch (error) {
            console.error("Failed to delete cache:", error)
        }
    }

    // 清空所有缓存
    const handleClearAll = async () => {
        if (!confirm("确定要清空所有缓存吗？")) return

        try {
            await cache.clearAll()
            await refreshCachedData()
            setCurrentUser(null)
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

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">IndexedDB 缓存示例</h1>
                <p className="text-muted-foreground mt-2">
                    当前用户ID: <Badge variant="outline">{userId}</Badge>
                </p>
                <p className="text-muted-foreground text-sm">初始化时自动从缓存加载数据，支持手动从API获取更新</p>
            </div>

            {/* 当前用户信息 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>用户信息</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefreshCache} disabled={loading}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                刷新缓存
                            </Button>
                            <Button onClick={handleFetchFromAPI} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                从API获取
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">{error}</div>}

                    {currentUser ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={currentUser.avatar || "/placeholder.svg"}
                                alt={currentUser.name}
                                className="w-16 h-16 rounded-full bg-muted"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                                <p className="text-muted-foreground">ID: {currentUser.id}</p>
                                <p className="text-muted-foreground">邮箱: {currentUser.email}</p>
                                <p className="text-muted-foreground">部门: {currentUser.department}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    缓存时间: {new Date(currentUser.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <Badge variant="secondary">来自缓存</Badge>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-muted-foreground mb-4">
                                用户 <Badge variant="outline">{userId}</Badge> 的数据不在缓存中
                            </div>
                            <Button onClick={handleFetchFromAPI} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                从API获取数据
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 缓存管理 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>缓存管理</CardTitle>
                            <CardDescription>当前缓存 {cachedUsers.length}/6 条数据，超出时自动删除最旧的数据</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={refreshCachedData}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                刷新
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={cachedUsers.length === 0}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                清空缓存
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {cachedUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">暂无缓存数据</div>
                    ) : (
                        <div className="space-y-3">
                            {cachedUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center justify-between p-3 border rounded-lg ${
                                        user.id === userId ? "bg-blue-50 border-blue-200" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">#{index + 1}</span>
                                        <img
                                            src={user.avatar || "/placeholder.svg"}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full bg-muted"
                                        />
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {user.name}
                                                {user.id === userId && (
                                                    <Badge variant="default" size="sm">
                                                        当前
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                ID: {user.id} | {user.department}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                缓存时间: {new Date(user.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCache(user.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>功能说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div>
                        • <strong>自动加载：</strong>组件初始化时自动从IndexedDB加载指定ID的用户数据
                    </div>
                    <div>
                        • <strong>外部注入：</strong>用户ID通过props参数从外部传入
                    </div>
                    <div>
                        • <strong>手动获取：</strong>缓存不存在时，用户可手动点击按钮从API获取数据
                    </div>
                    <div>
                        • <strong>FIFO缓存：</strong>最多缓存6条数据，超出时自动删除最旧的数据
                    </div>
                    <div>
                        • <strong>缓存管理：</strong>支持查看所有缓存、删除单个缓存或清空所有缓存
                    </div>
                    <div>
                        • <strong>预设数据：</strong>可以测试 user001-user007, admin 等预设用户ID
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
