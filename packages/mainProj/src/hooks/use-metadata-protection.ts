"use client"

import { useEffect, useRef, useCallback } from "react"

interface MetadataBackup {
    data: any[]
    timestamp: number
    instanceId: string
}

/**
 * IndexedDB备份管理器
 */
class MetadataBackupManager {
    private dbName = "urql-metadata-backups"
    private dbVersion = 1
    private storeName = "backups"

    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true })
                    store.createIndex("timestamp", "timestamp", { unique: false })
                    store.createIndex("instanceId", "instanceId", { unique: false })
                }
            }
        })
    }

    async saveBackup(backup: MetadataBackup): Promise<void> {
        const db = await this.openDB()
        const transaction = db.transaction([this.storeName], "readwrite")
        const store = transaction.objectStore(this.storeName)

        // 添加备份
        await new Promise<void>((resolve, reject) => {
            const request = store.add(backup)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })

        // 清理旧备份，只保留最近10个
        await this.cleanOldBackups()
    }

    async getLatestBackup(): Promise<MetadataBackup | null> {
        const db = await this.openDB()
        const transaction = db.transaction([this.storeName], "readonly")
        const store = transaction.objectStore(this.storeName)
        const index = store.index("timestamp")

        return new Promise((resolve, reject) => {
            const request = index.openCursor(null, "prev") // 降序，获取最新的
            request.onsuccess = () => {
                const cursor = request.result
                if (cursor) {
                    resolve(cursor.value)
                } else {
                    resolve(null)
                }
            }
            request.onerror = () => reject(request.error)
        })
    }

    async getBackupHistory(): Promise<MetadataBackup[]> {
        const db = await this.openDB()
        const transaction = db.transaction([this.storeName], "readonly")
        const store = transaction.objectStore(this.storeName)
        const index = store.index("timestamp")

        return new Promise((resolve, reject) => {
            const request = index.getAll()
            request.onsuccess = () => {
                const backups = request.result.sort((a, b) => b.timestamp - a.timestamp)
                resolve(backups.slice(0, 10)) // 返回最近10个
            }
            request.onerror = () => reject(request.error)
        })
    }

    private async cleanOldBackups(): Promise<void> {
        const db = await this.openDB()
        const transaction = db.transaction([this.storeName], "readwrite")
        const store = transaction.objectStore(this.storeName)
        const index = store.index("timestamp")

        // 获取所有备份，按时间排序
        const allBackups = await new Promise<MetadataBackup[]>((resolve, reject) => {
            const request = index.getAll()
            request.onsuccess = () => resolve(request.result.sort((a, b) => b.timestamp - a.timestamp))
            request.onerror = () => reject(request.error)
        })

        // 删除超过10个的旧备份
        if (allBackups.length > 10) {
            const toDelete = allBackups.slice(10)
            for (const backup of toDelete) {
                await new Promise<void>((resolve, reject) => {
                    const request = store.delete((backup as any).id)
                    request.onsuccess = () => resolve()
                    request.onerror = () => reject(request.error)
                })
            }
        }

        // 删除24小时前的备份
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        const expiredBackups = allBackups.filter((b) => b.timestamp < oneDayAgo)
        for (const backup of expiredBackups) {
            await new Promise<void>((resolve, reject) => {
                const request = store.delete((backup as any).id)
                request.onsuccess = () => resolve()
                request.onerror = () => reject(request.error)
            })
        }
    }
}

/**
 * 保护URQL离线队列metadata不被意外清空的Hook
 * 监控metadata变化，在检测到异常清空时自动恢复
 */
export function useMetadataProtection() {
    const backupManagerRef = useRef<MetadataBackupManager>()
    const backupRef = useRef<MetadataBackup | null>(null)
    const instanceIdRef = useRef(Math.random().toString(36).slice(2, 11))
    const isInitializingRef = useRef(true)
    const lastBackupTimeRef = useRef(0)

    // 初始化备份管理器
    useEffect(() => {
        backupManagerRef.current = new MetadataBackupManager()
    }, [])

    // 从IndexedDB读取metadata
    const readMetadata = useCallback(async (): Promise<any[]> => {
        try {
            if (typeof window === "undefined") return []

            return new Promise((resolve) => {
                const request = indexedDB.open("graphcache-sei")
                request.onsuccess = () => {
                    const db = request.result
                    if (!db.objectStoreNames.contains("metadata")) {
                        resolve([])
                        return
                    }

                    const transaction = db.transaction(["metadata"], "readonly")
                    const store = transaction.objectStore("metadata")
                    const getRequest = store.get("metadata")

                    getRequest.onsuccess = () => {
                        const result = getRequest.result
                        resolve(result ? result : [])
                    }

                    getRequest.onerror = () => resolve([])
                }

                request.onerror = () => resolve([])
            })
        } catch (error) {
            console.error("[MetadataProtection] 读取metadata失败:", error)
            return []
        }
    }, [])

    const backupMetadata = useCallback(async (data: any[]) => {
        if (!data || data.length === 0 || !backupManagerRef.current) return

        const now = Date.now()
        // 限制备份频率，避免过度备份
        if (now - lastBackupTimeRef.current < 1000) return

        const backup: MetadataBackup = {
            //data: JSON.parse(JSON.stringify(data)), // 深拷贝
            data: data,
            timestamp: now,
            instanceId: instanceIdRef.current,
        }

        try {
            await backupManagerRef.current.saveBackup(backup)
            backupRef.current = backup
            lastBackupTimeRef.current = now
            console.log(`[MetadataProtection] 备份metadata到IndexedDB: ${data.length} 项`)
        } catch (error) {
            console.error("[MetadataProtection] IndexedDB备份失败:", error)
        }
    }, [])

    const restoreMetadata = useCallback(async (): Promise<boolean> => {
        try {
            if (!backupManagerRef.current) return false

            const backup = await backupManagerRef.current.getLatestBackup()
            if (!backup) return false

            const now = Date.now()

            // 只恢复24小时内的备份
            if (now - backup.timestamp > 24 * 60 * 60 * 1000) {
                console.log("[MetadataProtection] 备份已过期，不进行恢复")
                return false
            }

            if (!backup.data || backup.data.length === 0) return false

            // 写入IndexedDB
            return new Promise((resolve) => {
                const request = indexedDB.open("graphcache-sei")
                request.onsuccess = () => {
                    const db = request.result
                    if (!db.objectStoreNames.contains("metadata")) {
                        resolve(false)
                        return
                    }

                    const transaction = db.transaction(["metadata"], "readwrite")
                    const store = transaction.objectStore("metadata")
                    //= store.put(JSON.stringify(backup.data), "metadata")
                    const putRequest = store.put(backup.data, "metadata")

                    putRequest.onsuccess = () => {
                        console.log(`[MetadataProtection] 从IndexedDB恢复metadata成功: ${backup.data.length} 项`)
                        // 触发URQL重新读取
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(
                                new CustomEvent("urql:metadata-restored", {
                                    detail: { count: backup.data.length },
                                }),
                            )
                        }
                        resolve(true)
                    }

                    putRequest.onerror = () => resolve(false)
                }

                request.onerror = () => resolve(false)
            })
        } catch (error) {
            console.error("[MetadataProtection] 恢复失败:", error)
            return false
        }
    }, [])

    // 监控metadata变化
    useEffect(() => {
        let intervalId: NodeJS.Timeout
        let isMonitoring = true

        const monitorMetadata = async () => {
            if (!isMonitoring) return

            try {
                const currentMetadata = await readMetadata()

                // 初始化阶段，建立基线
                if (isInitializingRef.current) {
                    if (currentMetadata.length > 0) {
                        await backupMetadata(currentMetadata)
                        isInitializingRef.current = false
                        console.log("[MetadataProtection] 初始化完成，建立基线备份")
                    }
                    return
                }

                // 检测异常清空
                if (currentMetadata.length === 0 && backupRef.current && backupRef.current.data.length > 0) {
                    const timeSinceBackup = Date.now() - backupRef.current.timestamp

                    // 如果备份很新（5分钟内），且当前为空，可能是异常清空
                    if (timeSinceBackup < 5 * 60 * 1000) {
                        console.warn("[MetadataProtection] 检测到metadata异常清空，尝试恢复【---非常严重了！！！】")
                        // const restored = await restoreMetadata()
                        // if (restored) {
                        //     // 延迟一下再次检查，确保恢复成功
                        //     setTimeout(async () => {
                        //         const afterRestore = await readMetadata()
                        //         if (afterRestore.length > 0) {
                        //             console.log("[MetadataProtection] metadata恢复成功")
                        //         } else {
                        //             console.error("[MetadataProtection] metadata恢复失败")
                        //         }
                        //     }, 1000)
                        // }
                    }
                } else if (currentMetadata.length > 0) {
                    // 有数据时进行备份
                    // await backupMetadata(currentMetadata)
                }
            } catch (error) {
                console.error("[MetadataProtection] 监控过程出错:", error)
            }
        }

        // 立即执行一次
        // monitorMetadata()

        // 每2秒监控一次
        // intervalId = setInterval(monitorMetadata, 2000)

        // 监听页面可见性变化
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // monitorMetadata()
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            isMonitoring = false
            if (intervalId) clearInterval(intervalId)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [readMetadata, backupMetadata, restoreMetadata])

    // 手动恢复功能
    const manualRestore = useCallback(async (): Promise<boolean> => {
        console.log("[MetadataProtection] 执行手动恢复...")
        return await restoreMetadata()
    }, [restoreMetadata])

    const getBackupHistory = useCallback(async (): Promise<MetadataBackup[]> => {
        try {
            if (!backupManagerRef.current) return []
            return await backupManagerRef.current.getBackupHistory()
        } catch (error) {
            console.error("[MetadataProtection] 获取备份历史失败:", error)
            return []
        }
    }, [])

    return {
        manualRestore,
        getBackupHistory,
        currentBackup: backupRef.current,
    }
}
