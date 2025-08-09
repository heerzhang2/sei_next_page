"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineStorageOptions {
    key: string
    defaultValue?: any
    syncInterval?: number
}

interface StorageInfo {
    used: number
    quota: number
    percentage: number
}

export function useOfflineStorage<T>({ key, defaultValue, syncInterval = 5000 }: OfflineStorageOptions) {
    const [data, setData] = useState<T>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)

    // 从本地存储加载数据
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true)

            // 尝试从 IndexedDB 加载
            if (typeof window !== "undefined" && "indexedDB" in window) {
                const stored = await getFromIndexedDB(key)
                if (stored !== null) {
                    setData(stored)
                    setLastSaved(new Date(stored._timestamp || Date.now()))
                    return
                }
            }

            // 回退到 localStorage
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(key)
                if (stored) {
                    const parsed = JSON.parse(stored)
                    setData(parsed.data || defaultValue)
                    setLastSaved(new Date(parsed.timestamp || Date.now()))
                } else {
                    setData(defaultValue)
                }
            } else {
                setData(defaultValue) // For SSR, default to initial value
            }
        } catch (error) {
            console.error("加载离线数据失败:", error)
            setData(defaultValue)
        } finally {
            setIsLoading(false)
        }
    }, [key, defaultValue])

    // 保存数据到本地存储
    const saveData = useCallback(
        async (newData: T) => {
            try {
                const timestamp = Date.now()
                const dataWithTimestamp = {
                    ...newData,
                    _timestamp: timestamp,
                }

                if (typeof window !== "undefined") {
                    // 优先使用 IndexedDB
                    if ("indexedDB" in window) {
                        await saveToIndexedDB(key, dataWithTimestamp)
                    } else {
                        // 回退到 localStorage
                        localStorage.setItem(
                            key,
                            JSON.stringify({
                                data: newData,
                                timestamp,
                            }),
                        )
                    }
                }

                setData(newData)
                setLastSaved(new Date(timestamp))
            } catch (error) {
                console.error("保存离线数据失败:", error)
            }
        },
        [key],
    )

    // 获取存储信息
    const updateStorageInfo = useCallback(async () => {
        if (typeof window !== "undefined" && "storage" in navigator && "estimate" in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate()
                setStorageInfo({
                    used: estimate.usage || 0,
                    quota: estimate.quota || 0,
                    percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
                })
            } catch (error) {
                console.error("获取存储信息失败:", error)
            }
        }
    }, [])

    // 清理过期数据
    const cleanupExpiredData = useCallback(async () => {
        const expireTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7天前

        try {
            if (typeof window !== "undefined" && "indexedDB" in window) {
                await cleanupIndexedDB(expireTime)
            }

            // 清理 localStorage 中的过期数据
            if (typeof window !== "undefined") {
                Object.keys(localStorage).forEach((storageKey) => {
                    if (storageKey.startsWith("offline_")) {
                        try {
                            const stored = JSON.parse(localStorage.getItem(storageKey) || "{}")
                            if (stored.timestamp && stored.timestamp < expireTime) {
                                localStorage.removeItem(storageKey)
                            }
                        } catch (error) {
                            // 忽略解析错误，删除无效数据
                            localStorage.removeItem(storageKey)
                        }
                    }
                })
            }
        } catch (error) {
            console.error("清理过期数据失败:", error)
        }
    }, [])

    useEffect(() => {
        loadData()
        updateStorageInfo()
        cleanupExpiredData()

        // 定期更新存储信息
        const interval = setInterval(() => {
            updateStorageInfo()
        }, syncInterval)

        return () => clearInterval(interval)
    }, [loadData, updateStorageInfo, cleanupExpiredData, syncInterval])

    return {
        data,
        setData: saveData,
        isLoading,
        lastSaved,
        storageInfo,
        refresh: loadData,
        cleanup: cleanupExpiredData,
    }
}

// IndexedDB 辅助函数
async function getFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("OfflineStorage", 1)

        request.onerror = () => reject(request.error)

        request.onsuccess = () => {
            const db = request.result
            const transaction = db.transaction(["data"], "readonly")
            const store = transaction.objectStore("data")
            const getRequest = store.get(key)

            getRequest.onsuccess = () => {
                resolve(getRequest.result?.data || null)
            }

            getRequest.onerror = () => reject(getRequest.error)
        }

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains("data")) {
                db.createObjectStore("data", { keyPath: "key" })
            }
        }
    })
}

async function saveToIndexedDB(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("OfflineStorage", 1)

        request.onerror = () => reject(request.error)

        request.onsuccess = () => {
            const db = request.result
            const transaction = db.transaction(["data"], "readwrite")
            const store = transaction.objectStore("data")
            const putRequest = store.put({ key, data, timestamp: Date.now() })

            putRequest.onsuccess = () => resolve()
            putRequest.onerror = () => reject(putRequest.error)
        }

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains("data")) {
                db.createObjectStore("data", { keyPath: "key" })
            }
        }
    })
}

async function cleanupIndexedDB(expireTime: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("OfflineStorage", 1)

        request.onerror = () => reject(request.error)

        request.onsuccess = () => {
            const db = request.result
            const transaction = db.transaction(["data"], "readwrite")
            const store = transaction.objectStore("data")
            const cursorRequest = store.openCursor()

            cursorRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result
                if (cursor) {
                    if (cursor.value.timestamp < expireTime) {
                        cursor.delete()
                    }
                    cursor.continue()
                } else {
                    resolve()
                }
            }

            cursorRequest.onerror = () => reject(cursorRequest.error)
        }
    })
}
