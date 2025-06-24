"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, RefreshCw } from "lucide-react"

// 数据类型定义
interface CacheItem {
  id: string
  name: string
  email: string
  timestamp: number // 用于FIFO排序
}

// IndexedDB 缓存管理类
class IndexedDBCache {
  private dbName = "CacheDB"
  private storeName = "items"
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

        // 创建对象存储，使用 id 作为主键
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          // 创建时间戳索引用于FIFO排序
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  // 添加或更新数据
  async addItem(item: Omit<CacheItem, "timestamp">): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      // 添加时间戳
      const itemWithTimestamp: CacheItem = {
        ...item,
        timestamp: Date.now(),
      }

      // 首先检查是否已存在相同ID的项目
      const getRequest = store.get(item.id)

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result

        if (existingItem) {
          // 如果存在，更新时间戳
          const putRequest = store.put(itemWithTimestamp)
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
                const addRequest = store.add(itemWithTimestamp)
                addRequest.onsuccess = () => resolve()
                addRequest.onerror = () => reject(addRequest.error)
              }
              deleteRequest.onerror = () => reject(deleteRequest.error)
            } else {
              // 直接添加新项目
              const addRequest = store.add(itemWithTimestamp)
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

  // 获取单个数据
  async getItem(id: string): Promise<CacheItem | null> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([this.storeName], "readonly")
    const store = transaction.objectStore(this.storeName)
    const request = store.get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // 获取所有数据
  async getAllItems(): Promise<CacheItem[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([this.storeName], "readonly")
    const store = transaction.objectStore(this.storeName)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // 按时间戳排序，最新的在前
        const items = request.result.sort((a: CacheItem, b: CacheItem) => b.timestamp - a.timestamp)
        resolve(items)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 删除数据
  async deleteItem(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)
    const request = store.delete(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 清空所有数据
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)
    const request = store.clear()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // 获取缓存统计信息
  async getStats(): Promise<{ count: number; maxItems: number }> {
    const items = await this.getAllItems()
    return {
      count: items.length,
      maxItems: this.maxItems,
    }
  }
}

// React 组件
export default function Component() {
  const [cache] = useState(() => new IndexedDBCache())
  const [items, setItems] = useState<CacheItem[]>([])
  const [stats, setStats] = useState({ count: 0, maxItems: 6 })
  const [formData, setFormData] = useState({ id: "", name: "", email: "" })
  const [loading, setLoading] = useState(false)

  // 初始化数据库
  useEffect(() => {
    const initDB = async () => {
      try {
        await cache.init()
        await refreshData()
      } catch (error) {
        console.error("Failed to initialize database:", error)
      }
    }
    initDB()
  }, [])

  // 刷新数据
  const refreshData = async () => {
    try {
      const [allItems, cacheStats] = await Promise.all([cache.getAllItems(), cache.getStats()])
      setItems(allItems)
      setStats(cacheStats)
    } catch (error) {
      console.error("Failed to refresh data:", error)
    }
  }
  //获取某一条缓存
  const findData = async () => {
    if (!formData.id) {
      alert("请填写id")
      return
    }
    try {
      const [allItems] = await Promise.all([cache.getItem(formData.id)])
      setItems(allItems? [allItems,] :[])
    } catch (error) {
      console.error("Failed to refresh data:", error)
    }
  }

  // 添加数据
  const handleAdd = async () => {
    if (!formData.id || !formData.name || !formData.email) {
      alert("请填写所有字段")
      return
    }

    setLoading(true)
    try {
      await cache.addItem({
        id: formData.id,
        name: formData.name,
        email: formData.email,
      })
      setFormData({ id: "", name: "", email: "" })
      await refreshData()
    } catch (error) {
      console.error("Failed to add item:", error)
      alert("添加失败")
    } finally {
      setLoading(false)
    }
  }

  // 删除数据
  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await cache.deleteItem(id)
      await refreshData()
    } catch (error) {
      console.error("Failed to delete item:", error)
      alert("删除失败")
    } finally {
      setLoading(false)
    }
  }

  // 清空所有数据
  const handleClearAll = async () => {
    if (!confirm("确定要清空所有缓存数据吗？")) return

    setLoading(true)
    try {
      await cache.clearAll()
      await refreshData()
    } catch (error) {
      console.error("Failed to clear all items:", error)
      alert("清空失败")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">IndexedDB FIFO 缓存示例</h1>
          <p className="text-muted-foreground mt-2">
            最多缓存 {stats.maxItems} 条数据，当前已缓存 {stats.count} 条
          </p>
        </div>

        {/* 添加数据表单 */}
        <Card>
          <CardHeader>
            <CardTitle>添加数据</CardTitle>
            <CardDescription>
              添加新数据到缓存中。如果ID已存在会更新数据，如果超过6条会自动删除最旧的数据。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="id">ID (唯一标识)</Label>
                <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="例如: user001"
                />
              </div>
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="例如: 张三"
                />
              </div>
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="例如: zhangsan@example.com"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                添加数据
              </Button>
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" onClick={findData} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                读取到其一条的
              </Button>

              <Button variant="destructive" onClick={handleClearAll} disabled={loading || stats.count === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                清空所有
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 缓存数据列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              缓存数据 ({stats.count}/{stats.maxItems})
            </CardTitle>
            <CardDescription>按添加时间倒序排列，最新添加的在最前面</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无缓存数据</div>
            ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">#{index + 1}</span>
                            <div>
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {item.id} | Email: {item.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                添加时间: {new Date(item.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} disabled={loading}>
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
              • <strong>唯一ID：</strong>每个数据项通过ID唯一标识，相同ID会更新而不是新增
            </div>
            <div>
              • <strong>最大容量：</strong>最多缓存6条数据
            </div>
            <div>
              • <strong>FIFO策略：</strong>当超过最大容量时，自动删除最旧的数据
            </div>
            <div>
              • <strong>持久化：</strong>数据存储在浏览器的IndexedDB中，刷新页面不会丢失
            </div>
            <div>
              • <strong>时间戳：</strong>每条数据都有时间戳，用于排序和FIFO删除
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
