// 通用 IndexedDB 缓存配置接口
export interface IndexedDBCacheConfig {
    dbName: string
    storeName: string
    version: number
}

// 缓存项必须包含的基础字段
export interface BaseCacheItem {
    id: string
    timestamp: number
}

// 通用 IndexedDB 缓存类
export class IndexedDBCache<T extends BaseCacheItem> {
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

    // 添加数据到缓存（FIFO机制）
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
                    putRequest.onsuccess = () => resolve()
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
    async getStats(): Promise<{ count: number; maxItems: number }> {
        const items = await this.getAllCached()
        return {
            count: items.length,
            maxItems: 10, // 这里可以根据需要调整
        }
    }
}

//PDF 书签专门用的，缓存项
export interface PdfOutlineCacheItem extends BaseCacheItem {
    id: string
    outline: any // 根据你的 OutlineData 接口调整
    totalPages: number
    timestamp: number
}

//PDF 书签缓存专门用 管理器
export class PdfOutlineCacheManager extends IndexedDBCache<PdfOutlineCacheItem> {
    private maxItems: number

    constructor(config: IndexedDBCacheConfig, maxItems = 10) {
        super(config)
        this.maxItems = maxItems
    }

    // 添加 PDF 书签数据
    async addOutlineData(id: string, outline: any, totalPages: number): Promise<void> {
        const item: PdfOutlineCacheItem = {
            id,
            outline: outline,
            totalPages,
            timestamp: Date.now(),
        }
        return this.addItem(item, this.maxItems)
    }

    // 获取 PDF 书签数据
    async getOutlineData(id: string): Promise<PdfOutlineCacheItem | null> {
        return this.getFromCache(id)
    }

    // 获取所有缓存的书签数据
    async getAllOutlineData(): Promise<PdfOutlineCacheItem[]> {
        return this.getAllCached()
    }
}
