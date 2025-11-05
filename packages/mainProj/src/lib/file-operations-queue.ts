/**
 * File Operations Queue for Offline PWA Support
 * Manages pending file uploads and deletes with IndexedDB persistence
 */

const DB_NAME = "FileOperationsDB"
const DB_VERSION = 1
const QUEUE_STORE = "fileQueue"
const STATE_STORE = "uppyState"

export type FileOperation = {
    id: string // Unique operation ID
    type: "upload" | "delete"
    repId: string
    subrid?: string
    hash: string // Editor hash (e.g., "FxDiagram_pf")
    business: string
    timestamp: number
    status: "pending" | "processing" | "failed" | "completed"
    retryCount: number
    lastError?: string
    // Upload-specific data
    file?: {
        name: string
        type: string
        size: number
        data?: File // Changed from ArrayBuffer to File
        lastModified?: number
    }
    uploadMeta?: {
        eid: string
        liveDays: number
        business: string
    }
    // Delete-specific data
    deleteUrl?: string
    deleteIndex?: number
    // Result data
    result?: any
}

export type UppyStateSnapshot = {
    key: string // Format: "repId:subrid:hash"
    repId: string
    subrid?: string
    hash: string
    timestamp: number
    files: Array<{
        id: string
        name: string
        type: string
        size: number
        data?: File // Changed from ArrayBuffer to File
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
    private processingCallbacks: Set<(operations: FileOperation[]) => void> = new Set()

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

                if (!db.objectStoreNames.contains(QUEUE_STORE)) {
                    const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: "id" })
                    queueStore.createIndex("repId", "repId", { unique: false })
                    queueStore.createIndex("status", "status", { unique: false })
                    queueStore.createIndex("timestamp", "timestamp", { unique: false })
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

    async addOperation(operation: Omit<FileOperation, "id" | "timestamp" | "status" | "retryCount">): Promise<string> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        const id = `${operation.type}-${operation.repId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fullOperation: FileOperation = {
            ...operation,
            id,
            timestamp: Date.now(),
            status: "pending",
            retryCount: 0,
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([QUEUE_STORE], "readwrite")
            const store = transaction.objectStore(QUEUE_STORE)
            const request = store.add(fullOperation)

            request.onsuccess = () => {
                console.log("[FileQueue] Added operation:", id, operation.type)
                this.notifyProcessingCallbacks()
                resolve(id)
            }
            request.onerror = () => reject(request.error)
        })
    }

    async getPendingOperations(): Promise<FileOperation[]> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([QUEUE_STORE], "readonly")
            const store = transaction.objectStore(QUEUE_STORE)
            const index = store.index("status")
            const request = index.getAll("pending")

            request.onsuccess = () => resolve(request.result as FileOperation[])
            request.onerror = () => reject(request.error)
        })
    }

    async getOperationsByReport(repId: string, subrid?: string): Promise<FileOperation[]> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([QUEUE_STORE], "readonly")
            const store = transaction.objectStore(QUEUE_STORE)
            const index = store.index("repId")
            const request = index.getAll(repId)

            request.onsuccess = () => {
                const operations = request.result as FileOperation[]
                const filtered = subrid ? operations.filter((op) => op.subrid === subrid) : operations
                resolve(filtered)
            }
            request.onerror = () => reject(request.error)
        })
    }

    async updateOperation(id: string, updates: Partial<FileOperation>): Promise<void> {
        await this.init()
        if (!this.db) throw new Error("Database not initialized")

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([QUEUE_STORE], "readwrite")
            const store = transaction.objectStore(QUEUE_STORE)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const operation = getRequest.result as FileOperation
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
            const transaction = this.db!.transaction([QUEUE_STORE], "readwrite")
            const store = transaction.objectStore(QUEUE_STORE)
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

    onProcessingNeeded(callback: (operations: FileOperation[]) => void): () => void {
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
            const transaction = this.db!.transaction([QUEUE_STORE, STATE_STORE], "readwrite")

            // Clean queue
            const queueStore = transaction.objectStore(QUEUE_STORE)
            const queueRequest = queueStore.openCursor()

            queueRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
                if (cursor) {
                    const operation = cursor.value as FileOperation
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
