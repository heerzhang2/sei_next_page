/**
 * IndexedDB Storage Utility for Report Data
 * Provides large storage capacity (50MB+) with TTL-based cleanup
 */

const DB_NAME = "ReportStorageDB"
const DB_VERSION = 1 // Reverted to version 1, removing token store
const STORE_NAME = "reportStorage"
const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const POST_SAVE_CLEANUP_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface StorageEntry {
    storageKey: string // Format: "repId" or "repId:subrid"
    storage: any
    metadata: {
        subrType?: string
        parrepfs?: any
        modified?: boolean
        timestamp: number
        lastSaveTime?: number
    }
}

class IndexedDBStorage {
    private db: IDBDatabase | null = null
    private initPromise: Promise<void> | null = null

    /**
     * Initialize IndexedDB connection
     */
    private async init(): Promise<void> {
        if (this.db) return
        if (this.initPromise) return this.initPromise

        this.initPromise = new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                reject(new Error("IndexedDB not available in server environment"))
                return
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => {
                console.error("[IndexedDB] Failed to open database:", request.error)
                reject(request.error)
            }

            request.onsuccess = () => {
                this.db = request.result
                console.log("[IndexedDB] Database opened successfully")
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create report storage object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "storageKey" })
                    objectStore.createIndex("timestamp", "metadata.timestamp", { unique: false })
                    objectStore.createIndex("lastSaveTime", "metadata.lastSaveTime", { unique: false })
                    console.log("[IndexedDB] Report object store created")
                }
            }
        })

        return this.initPromise
    }

    /**
     * Generate storage key from repId and optional subrid
     */
    private getStorageKey(repId: string, subrid?: string): string {
        return subrid ? `${repId}:${subrid}` : repId
    }

    /**
     * Save report data to IndexedDB
     * @param repId - Report ID
     * @param subrid - Optional sub-report ID
     * @param storage - Storage data
     * @param metadata - Metadata including modified flag
     */
    async save(repId: string, storage: any, metadata: any, subrid?: string): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            const storageKey = this.getStorageKey(repId, subrid)

            const entry: StorageEntry = {
                storageKey,
                storage,
                metadata: {
                    ...metadata,
                    timestamp: Date.now(),
                },
            }

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.put(entry)

                request.onsuccess = () => {
                    console.log("[IndexedDB] Saved report data:", {
                        storageKey,
                        dataKeys: Object.keys(storage),
                        size: JSON.stringify(entry).length,
                        modified: metadata.modified,
                    })
                    resolve()
                }

                request.onerror = () => {
                    console.error("[IndexedDB] Failed to save:", request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] Save error:", error)
            throw error
        }
    }

    /**
     * Load report data from IndexedDB
     */
    async load(repId: string, subrid?: string): Promise<{ storage: any; metadata: any } | null> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            const storageKey = this.getStorageKey(repId, subrid)

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readonly")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.get(storageKey)

                request.onsuccess = () => {
                    const entry = request.result as StorageEntry | undefined

                    if (!entry) {
                        resolve(null)
                        return
                    }

                    // Check TTL
                    const age = Date.now() - entry.metadata.timestamp
                    if (age > STORAGE_TTL) {
                        console.log("[IndexedDB] Data expired, removing:", {
                            storageKey,
                            ageHours: Math.round(age / 1000 / 60 / 60),
                        })
                        this.remove(repId, subrid)
                        resolve(null)
                        return
                    }

                    console.log("[IndexedDB] Loaded report data:", {
                        storageKey,
                        dataKeys: Object.keys(entry.storage),
                        ageMinutes: Math.round(age / 1000 / 60),
                        modified: entry.metadata.modified,
                    })

                    resolve({
                        storage: entry.storage,
                        metadata: entry.metadata,
                    })
                }

                request.onerror = () => {
                    console.error("[IndexedDB] Failed to load:", request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] Load error:", error)
            return null
        }
    }

    /**
     * Remove report data from IndexedDB
     */
    async remove(repId: string, subrid?: string): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            const storageKey = this.getStorageKey(repId, subrid)

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.delete(storageKey)

                request.onsuccess = () => {
                    console.log("[IndexedDB] Removed report data:", storageKey)
                    resolve()
                }

                request.onerror = () => {
                    console.error("[IndexedDB] Failed to remove:", request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] Remove error:", error)
            throw error
        }
    }

    /**
     * Mark data as saved (for 1-hour cleanup timer)
     */
    async markAsSaved(repId: string, subrid?: string): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            const storageKey = this.getStorageKey(repId, subrid)

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const getRequest = objectStore.get(storageKey)

                getRequest.onsuccess = () => {
                    const entry = getRequest.result as StorageEntry | undefined
                    if (!entry) {
                        resolve()
                        return
                    }

                    entry.metadata.lastSaveTime = Date.now()

                    const putRequest = objectStore.put(entry)

                    putRequest.onsuccess = () => {
                        console.log("[IndexedDB] Marked as saved:", storageKey)
                        resolve()
                    }

                    putRequest.onerror = () => {
                        console.error("[IndexedDB] Failed to mark as saved:", putRequest.error)
                        reject(putRequest.error)
                    }
                }

                getRequest.onerror = () => {
                    console.error("[IndexedDB] Failed to get entry:", getRequest.error)
                    reject(getRequest.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] Mark as saved error:", error)
            throw error
        }
    }

    /**
     * Clean up old entries based on TTL and post-save cleanup
     */
    async cleanup(): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.openCursor()

                const now = Date.now()
                let removedCount = 0

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null

                    if (cursor) {
                        const entry = cursor.value as StorageEntry
                        const age = now - entry.metadata.timestamp

                        // 1. Remove if older than 7 days
                        // 2. Remove if saved more than 1 hour ago
                        const shouldRemove =
                            age > STORAGE_TTL ||
                            (entry.metadata.lastSaveTime && now - entry.metadata.lastSaveTime > POST_SAVE_CLEANUP_TTL)

                        if (shouldRemove) {
                            cursor.delete()
                            removedCount++
                            console.log("[IndexedDB] Cleaned up entry:", {
                                storageKey: entry.storageKey,
                                reason: age > STORAGE_TTL ? "expired" : "post-save-cleanup",
                            })
                        }

                        cursor.continue()
                    } else {
                        // Finished iterating
                        if (removedCount > 0) {
                            console.log("[IndexedDB] Cleanup completed, removed entries:", removedCount)
                        }
                        resolve()
                    }
                }

                request.onerror = () => {
                    console.error("[IndexedDB] Cleanup failed:", request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] Cleanup error:", error)
        }
    }

    /**
     * Get all stored report IDs
     */
    async getAllRepIds(): Promise<string[]> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readonly")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.getAllKeys()

                request.onsuccess = () => {
                    resolve(request.result as string[])
                }

                request.onerror = () => {
                    console.error("[IndexedDB] Failed to get all keys:", request.error)
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error("[IndexedDB] GetAllRepIds error:", error)
            return []
        }
    }
}

// Singleton instance
export const indexedDBStorage = new IndexedDBStorage()
