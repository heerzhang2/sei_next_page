/**
 * File Operations Queue for Offline PWA Support
 * Manages pending file uploads and deletes with IndexedDB persistence
 */

const DB_NAME = "FileOperationsDB"
const DB_VERSION = 1
const DELETE_QUEUE = "deleteQueue"
const STATE_STORE = "uppyState"

export type DeleteFileOperation = {
    id: string
    repId: string
    subrid?: string
    timestamp: number
    status: "pending" | "processing" | "failed" | "completed"
    retryCount: number
    lastError?: string
    // 删除 deleteIndex 字段
    deleteUrl: string
}

export type UppyStateSnapshot = {
    key: string
    repId: string
    subrid?: string
    hash: string
    timestamp: number
    files: Array<{
        id: string
        name: string
        type: string
        size: number
        data?: ArrayBuffer | File // 文件数据（ArrayBuffer 或 File 对象）
        fileHandle?: any // 文件句柄（用于大文件）
        lastModified?: number
        progress?: number
        uploadURL?: string
    }>
    meta: any
    oldfiles?: any
}

class FileOperationsQueue {
    private db: IDBDatabase | null = null
    private initPromise: Promise<void> | null = null
    private processingCallbacks: Set<(operations: DeleteFileOperation[]) => void> = new Set()

    private async init(): Promise<void> {
        if (this.db) return
        if (this.initPromise) return this.initPromise

        this.initPromise = new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                reject(new Error("IndexedDB not available"))
                return
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                this.db = request.result
                console.log("[FileQueue] Database opened")
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                if (!db.objectStoreNames.contains(DELETE_QUEUE)) {
                    const queueStore = db.createObjectStore(DELETE_QUEUE, { keyPath: "id" })
                    queueStore.createIndex("repId", "repId", { unique: false })
                    queueStore.createIndex("status", "status", { unique: false })
                    queueStore.createIndex("timestamp", "timestamp", { unique: false })
                    queueStore.createIndex("deleteUrl", "deleteUrl", { unique: false }) // 新增索引，便于按URL查找
                    console.log("[FileQueue] Queue store created")
                }

                if (!db.objectStoreNames.contains(STATE_STORE)) {
                    const stateStore = db.createObjectStore(STATE_STORE, { keyPath: "key" })
                    stateStore.createIndex("repId", "repId", { unique: false })
                    stateStore.createIndex("timestamp", "timestamp", { unique: false })
                    console.log("[FileQueue] State store created")
                }
            }
        })

        return this.initPromise
    }

    async addOperation(operation: Omit<DeleteFileOperation, "id" | "timestamp" | "status" | "retryCount">): Promise<string> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const id = `delete-${operation.repId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullOperation: DeleteFileOperation = {
            ...operation,
            id,
            timestamp: Date.now(),
            status: "pending",
            retryCount: 0,
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readwrite")
            const store = transaction.objectStore(DELETE_QUEUE)
            const request = store.add(fullOperation)

            request.onsuccess = () => {
                console.log("[FileQueue] Added operation:", id, operation.deleteUrl)
                this.notifyProcessingCallbacks()
                resolve(id)
            }
            request.onerror = () => reject(request.error)
        })
    }

    async getPendingOperations(): Promise<DeleteFileOperation[]> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readonly")
            const store = transaction.objectStore(DELETE_QUEUE)
            const index = store.index("status")
            const request = index.getAll("pending")

            request.onsuccess = () => resolve(request.result as DeleteFileOperation[])
            request.onerror = () => reject(request.error)
        })
    }

    async getOperationsByReport(repId: string, subrid?: string): Promise<DeleteFileOperation[]> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readonly")
            const store = transaction.objectStore(DELETE_QUEUE)
            const index = store.index("repId")
            const request = index.getAll(repId)

            request.onsuccess = () => {
                const operations = request.result as DeleteFileOperation[]
                const filtered = subrid ? operations.filter((op) => op.subrid === subrid) : operations
                resolve(filtered)
            }
            request.onerror = () => reject(request.error)
        })
    }

    // 新增：根据 deleteUrl 查找操作
    async getOperationByDeleteUrl(deleteUrl: string): Promise<DeleteFileOperation | null> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readonly")
            const store = transaction.objectStore(DELETE_QUEUE)
            const index = store.index("deleteUrl")
            const request = index.get(deleteUrl)

            request.onsuccess = () => resolve(request.result as DeleteFileOperation || null)
            request.onerror = () => reject(request.error)
        })
    }

    // 新增：根据 deleteUrl 删除操作
    async removeOperationByDeleteUrl(deleteUrl: string): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readwrite")
            const store = transaction.objectStore(DELETE_QUEUE)
            const index = store.index("deleteUrl")
            const request = index.getKey(deleteUrl)

            request.onsuccess = () => {
                const id = request.result
                if (id) {
                    const deleteRequest = store.delete(id)
                    deleteRequest.onsuccess = () => {
                        console.log("[FileQueue] Removed operation by deleteUrl:", deleteUrl)
                        resolve()
                    }
                    deleteRequest.onerror = () => reject(deleteRequest.error)
                } else {
                    resolve() // 没有找到对应的记录
                }
            }
            request.onerror = () => reject(request.error)
        })
    }

    async updateOperation(id: string, updates: Partial<DeleteFileOperation>): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readwrite")
            const store = transaction.objectStore(DELETE_QUEUE)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const operation = getRequest.result as DeleteFileOperation
                if (!operation) {
                    resolve()
                    return
                }

                const updated = { ...operation, ...updates }
                const putRequest = store.put(updated)

                putRequest.onsuccess = () => {
                    console.log("[FileQueue] Updated operation:", id, updates)
                    resolve()
                }
                putRequest.onerror = () => reject(putRequest.error)
            }
            getRequest.onerror = () => reject(getRequest.error)
        })
    }

    async removeOperation(id: string): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE], "readwrite")
            const store = transaction.objectStore(DELETE_QUEUE)
            const request = store.delete(id)

            request.onsuccess = () => {
                console.log("[FileQueue] Removed operation:", id)
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }

    async saveUppyState(snapshot: UppyStateSnapshot): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readwrite")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.put(snapshot)

            request.onsuccess = () => {
                console.log("[FileQueue] Saved Uppy state:", snapshot.key)
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }

    async loadUppyState(repId: string, subrid?: string, hash?: string): Promise<UppyStateSnapshot | null> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const key = `${repId}${subrid ? `:${subrid}` : ""}${hash ? `:${hash}` : ""}`

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readonly")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.get(key)

            request.onsuccess = () => {
                const snapshot = request.result as UppyStateSnapshot | undefined
                if (snapshot) {
                    console.log("[FileQueue] Loaded Uppy state:", key, snapshot.files.length, "files")
                }
                resolve(snapshot || null)
            }
            request.onerror = () => reject(request.error)
        })
    }

    async removeUppyState(repId: string, subrid?: string, hash?: string): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const key = `${repId}${subrid ? `:${subrid}` : ""}${hash ? `:${hash}` : ""}`

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readwrite")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.delete(key)

            request.onsuccess = () => {
                console.log("[FileQueue] Removed Uppy state:", key)
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }

    onProcessingNeeded(callback: (operations: DeleteFileOperation[]) => void): () => void {
        this.processingCallbacks.add(callback)
        return () => this.processingCallbacks.delete(callback)
    }

    private async notifyProcessingCallbacks(): Promise<void> {
        const operations = await this.getPendingOperations()
        this.processingCallbacks.forEach((callback) => callback(operations))
    }

    async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const now = Date.now()
        let removedCount = 0

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([DELETE_QUEUE, STATE_STORE], "readwrite")

            // Clean queue
            const queueStore = transaction.objectStore(DELETE_QUEUE)
            const queueRequest = queueStore.openCursor()

            queueRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
                if (cursor) {
                    const operation = cursor.value as DeleteFileOperation
                    if (operation.status === "completed" && now - operation.timestamp > maxAge) {
                        cursor.delete()
                        removedCount++
                    }
                    cursor.continue()
                }
            }

            // Clean state
            const stateStore = transaction.objectStore(STATE_STORE)
            const stateRequest = stateStore.openCursor()

            stateRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
                if (cursor) {
                    const snapshot = cursor.value as UppyStateSnapshot
                    if (now - snapshot.timestamp > maxAge) {
                        cursor.delete()
                        removedCount++
                    }
                    cursor.continue()
                }
            }

            transaction.oncomplete = () => {
                if (removedCount > 0) {
                    console.log("[FileQueue] Cleanup completed, removed:", removedCount)
                }
                resolve()
            }
            transaction.onerror = () => reject(transaction.error)
        })
    }
}

export const fileOperationsQueue = new FileOperationsQueue()