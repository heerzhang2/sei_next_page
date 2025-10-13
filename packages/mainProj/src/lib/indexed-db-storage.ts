/**
 * IndexedDB Storage Utility for Report Data
 * Provides large storage capacity (50MB+) with TTL-based cleanup
 */

const DB_NAME = "ReportStorageDB"
const DB_VERSION = 1
const STORE_NAME = "reportStorage"
const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

interface StorageEntry {
    repId: string
    storage: any
    metadata: {
        subrType?: string
        parrepfs?: any
        modified?: boolean
        timestamp: number
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

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "repId" })
                    objectStore.createIndex("timestamp", "metadata.timestamp", { unique: false })
                    console.log("[IndexedDB] Object store created")
                }
            }
        })

        return this.initPromise
    }

    /**
     * Save report data to IndexedDB
     */
    async save(repId: string, storage: any, metadata: any): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            const entry: StorageEntry = {
                repId,
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
                        repId,
                        dataKeys: Object.keys(storage),
                        size: JSON.stringify(entry).length,
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
    async load(repId: string): Promise<{ storage: any; metadata: any } | null> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readonly")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.get(repId)

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
                            repId,
                            ageHours: Math.round(age / 1000 / 60 / 60),
                        })
                        this.remove(repId) // Clean up expired data
                        resolve(null)
                        return
                    }

                    console.log("[IndexedDB] Loaded report data:", {
                        repId,
                        dataKeys: Object.keys(entry.storage),
                        ageMinutes: Math.round(age / 1000 / 60),
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
    async remove(repId: string): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const request = objectStore.delete(repId)

                request.onsuccess = () => {
                    console.log("[IndexedDB] Removed report data:", repId)
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
     * Clean up old entries based on TTL
     */
    async cleanup(): Promise<void> {
        try {
            await this.init()
            if (!this.db) throw new Error("Database not initialized")

            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction([STORE_NAME], "readwrite")
                const objectStore = transaction.objectStore(STORE_NAME)
                const index = objectStore.index("timestamp")
                const request = index.openCursor()

                const now = Date.now()
                let removedCount = 0

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null

                    if (cursor) {
                        const entry = cursor.value as StorageEntry
                        const age = now - entry.metadata.timestamp

                        if (age > STORAGE_TTL) {
                            cursor.delete()
                            removedCount++
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
