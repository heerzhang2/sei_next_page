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

// IndexedDB缓存配置接口
interface IndexedDBCacheConfig {
    dbName: string
    storeName: string
    version: number
}

/**
 * 通用的IndexedDB缓存管理类
 * 支持FIFO + LRU混合缓存策略
 * 对比Cookie导致每次请求的头过大影响网络网页加载；而LocalStorage太小：总容量5MB，用于持久化用户偏好设置。
 */
class IndexedDBCache<T extends { id: string; timestamp: number }> {
    private dbName: string
    private storeName: string
    private version: number
    private db: IDBDatabase | null = null

    constructor(config: IndexedDBCacheConfig) {
        this.dbName = config.dbName
        this.storeName = config.storeName
        this.version = config.version
    }

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
    async getFromCache(id: string): Promise<T | null> {
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

    // 添加数据到缓存（FIFO机制，支持自定义maxItems）
    async addItem(item: T, maxItems = 10): Promise<void> {
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
                    putRequest.onsuccess = () => {
                        console.log(`缓存已更新: ${item.id}, maxItems: ${maxItems}`)
                        resolve()
                    }
                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    // 如果不存在，检查是否超过最大数量
                    const getAllRequest = store.getAll()

                    getAllRequest.onsuccess = () => {
                        const allItems = getAllRequest.result

                        if (allItems.length >= maxItems) {
                            // 删除最旧的项目（时间戳最小的）
                            const oldestItem = allItems.sort((a: T, b: T) => a.timestamp - b.timestamp)[0]
                            const deleteRequest = store.delete(oldestItem.id)

                            deleteRequest.onsuccess = () => {
                                // 删除成功后添加新项目
                                const addRequest = store.add(item)
                                addRequest.onsuccess = () => {
                                    console.log(`缓存已添加（删除旧项目）: ${item.id}, maxItems: ${maxItems}`)
                                    resolve()
                                }
                                addRequest.onerror = () => reject(addRequest.error)
                            }
                            deleteRequest.onerror = () => reject(deleteRequest.error)
                        } else {
                            // 直接添加新项目
                            const addRequest = store.add(item)
                            addRequest.onsuccess = () => {
                                console.log(`缓存已添加: ${item.id}, maxItems: ${maxItems}`)
                                resolve()
                            }
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
    async getAllCached(): Promise<T[]> {
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], "readonly")
            const store = transaction.objectStore(this.storeName)
            const request = store.getAll()

            request.onsuccess = () => {
                const items = request.result.sort((a: T, b: T) => b.timestamp - a.timestamp)
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

    // 获取缓存统计信息
    async getStats(maxItems = 10): Promise<{ count: number; maxItems: number }> {
        const items = await this.getAllCached()
        return {
            count: items.length,
            maxItems: maxItems,
        }
    }
}

// 用户缓存管理类（继承通用缓存类）
class UserCacheManager {
    private cache: IndexedDBCache<CacheItem>
    private maxItems: number

    constructor(config: IndexedDBCacheConfig, maxItems = 10) {
        this.cache = new IndexedDBCache<CacheItem>(config)
        this.maxItems = maxItems
    }

    async init(): Promise<void> {
        return this.cache.init()
    }

    async getUser(id: string): Promise<CacheItem | null> {
        return this.cache.getFromCache(id)
    }

    async getAllUsers(): Promise<CacheItem[]> {
        return this.cache.getAllCached()
    }

    async deleteUser(id: string): Promise<void> {
        return this.cache.deleteCache(id)
    }

    async clearAll(): Promise<void> {
        return this.cache.clearAll()
    }

    async getStats(): Promise<{ count: number; maxItems: number }> {
        return this.cache.getStats(this.maxItems)
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

    // 从API获取数据并更新缓存
    async fetchAndCache(id: string): Promise<{ data: CacheItem | null; error?: string }> {
        try {
            console.log(`正在从API获取用户: ${id}`)
            const apiResponse = await this.fetchFromAPI(id)

            if (apiResponse.success && apiResponse.data) {
                await this.cache.addItem(apiResponse.data, this.maxItems)
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
}

// React 组件
export default function Component({ userId }: ComponentProps) {
    // 使用通用缓存类，传入配置参数
    const [userCache] = useState(
        () =>
            new UserCacheManager(
                {
                    dbName: "appCache",
                    storeName: "pdfMarkPage",
                    version: 1,
                },
                6, // maxItems
            ),
    )

    const [currentUser, setCurrentUser] = useState<CacheItem | null>(null)
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
    }, [userId])

    // 加载指定用户数据（仅从缓存）
    const loadUserData = async () => {
        try {
            console.log(`正在从缓存加载用户: ${userId}`)
            const cachedData = await userCache.getUser(userId)

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
            const result = await userCache.fetchAndCache(userId)

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
            await userCache.deleteUser(id)
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
            await userCache.clearAll()
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
                <h1 className="text-3xl font-bold">通用 IndexedDB 缓存示例</h1>
                <p className="text-muted-foreground mt-2">
                    当前用户ID: <Badge variant="outline">{userId}</Badge>
                </p>
                <p className="text-muted-foreground text-sm">
                    数据库: appCache | 存储: pdfMarkPage | 版本: 1 | 最大缓存: {stats.maxItems} 条
                </p>
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
                            <CardDescription>
                                当前缓存 {stats.count}/{stats.maxItems} 条数据，超出时自动删除最旧的数据
                            </CardDescription>
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
                    <CardTitle>通用缓存类特性</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div>
                        • <strong>可配置参数：</strong>支持自定义 dbName、storeName、version 和 maxItems
                    </div>
                    <div>
                        • <strong>泛型支持：</strong>IndexedDBCache{"<T>"} 支持任意数据类型，只需包含 id 和 timestamp 字段
                    </div>
                    <div>
                        • <strong>FIFO + LRU：</strong>读取时更新时间戳，结合容量限制实现智能缓存
                    </div>
                    <div>
                        • <strong>类型安全：</strong>完整的 TypeScript 类型支持
                    </div>
                    <div>
                        • <strong>易于扩展：</strong>可以继承基础类实现特定业务逻辑
                    </div>
                    <div>
                        • <strong>使用示例：</strong>
                        <code className="block mt-2 p-2 bg-muted rounded text-xs">
                            {`new UserCacheManager({
  dbName: "appCache",
  storeName: "pdfMarkPage", 
  version: 1
}, 6)`}
                        </code>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
