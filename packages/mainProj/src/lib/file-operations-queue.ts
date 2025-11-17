/**
 * File Operations Queue for Offline PWA Support
 * Manages pending file uploads with IndexedDB persistence
 */

const DB_NAME = "FileOperationsDB"
const DB_VERSION = 1
const STATE_STORE = "uppyState"

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

                // 只保留 STATE_STORE，移除 DELETE_QUEUE
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

    async loadUppyState(key: string): Promise<UppyStateSnapshot | null> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readonly")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.get(key)

            request.onsuccess = () => {
                const snapshot = request.result as UppyStateSnapshot | undefined
                resolve(snapshot || null)
            }
            request.onerror = () => reject(request.error)
        })
    }

    async removeUppyState(key: string): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

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

    async getAllUppyStates(): Promise<UppyStateSnapshot[]> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readonly")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.getAll()

            request.onsuccess = () => resolve(request.result as UppyStateSnapshot[])
            request.onerror = () => reject(request.error)
        })
    }

    async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const now = Date.now()
        let removedCount = 0

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readwrite")

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

    async clearAll(): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STATE_STORE], "readwrite")
            const store = transaction.objectStore(STATE_STORE)
            const request = store.clear()

            request.onsuccess = () => {
                console.log("[FileQueue] Cleared all Uppy states")
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }
}

// 生成状态存储的key
export function generateUppyStateKey(
    repId: string,
    subrid?: string,
    redId?: number,
    hash?: string
): string {
    return `${repId}${subrid ? `:${subrid}` : ""}${redId ? `:${redId}` : ""}${hash ? `:${hash}` : ""}`
}

export const fileOperationsQueue = new FileOperationsQueue()