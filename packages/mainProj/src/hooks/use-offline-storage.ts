"use client"

import { useState, useEffect, useCallback } from "react"

interface UseOfflineStorageOptions {
    key: string
    defaultValue?: any
    storage?: "localStorage" | "sessionStorage" | "indexedDB"
}

interface UseOfflineStorageReturn<T> {
    data: T | null
    setData: (data: T) => void
    removeData: () => void
    isLoading: boolean
    error: string | null
}

export function useOfflineStorage<T = any>({
                                               key,
                                               defaultValue = null,
                                               storage = "localStorage",
                                           }: UseOfflineStorageOptions): UseOfflineStorageReturn<T> {
    const [data, setDataState] = useState<T | null>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 检查是否在客户端环境
    const isClient = typeof window !== "undefined"

    // IndexedDB 操作
    const openDB = useCallback(async () => {
        if (!isClient || !("indexedDB" in window)) {
            throw new Error("IndexedDB not supported")
        }

        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open("OfflineStorage", 1)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data", { keyPath: "key" })
                }
            }
        })
    }, [isClient])

    const getFromIndexedDB = useCallback(
        async (key: string) => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readonly")
                const store = transaction.objectStore("data")

                return new Promise<any>((resolve, reject) => {
                    const request = store.get(key)
                    request.onerror = () => reject(request.error)
                    request.onsuccess = () => {
                        const result = request.result
                        resolve(result ? result.value : null)
                    }
                })
            } catch (error) {
                console.error("IndexedDB get error:", error)
                return null
            }
        },
        [openDB],
    )

    const setToIndexedDB = useCallback(
        async (key: string, value: any) => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readwrite")
                const store = transaction.objectStore("data")

                return new Promise<void>((resolve, reject) => {
                    const request = store.put({ key, value, timestamp: Date.now() })
                    request.onerror = () => reject(request.error)
                    request.onsuccess = () => resolve()
                })
            } catch (error) {
                console.error("IndexedDB set error:", error)
                throw error
            }
        },
        [openDB],
    )

    const removeFromIndexedDB = useCallback(
        async (key: string) => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readwrite")
                const store = transaction.objectStore("data")

                return new Promise<void>((resolve, reject) => {
                    const request = store.delete(key)
                    request.onerror = () => reject(request.error)
                    request.onsuccess = () => resolve()
                })
            } catch (error) {
                console.error("IndexedDB remove error:", error)
                throw error
            }
        },
        [openDB],
    )

    // 通用存储操作
    const getData = useCallback(async () => {
        if (!isClient) return defaultValue

        try {
            setIsLoading(true)
            setError(null)

            let result = null

            switch (storage) {
                case "localStorage":
                    if ("localStorage" in window) {
                        const stored = localStorage.getItem(key)
                        result = stored ? JSON.parse(stored) : defaultValue
                    }
                    break

                case "sessionStorage":
                    if ("sessionStorage" in window) {
                        const stored = sessionStorage.getItem(key)
                        result = stored ? JSON.parse(stored) : defaultValue
                    }
                    break

                case "indexedDB":
                    result = await getFromIndexedDB(key)
                    if (result === null) result = defaultValue
                    break

                default:
                    result = defaultValue
            }

            setDataState(result)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Storage error"
            setError(errorMessage)
            console.error("Get data error:", err)
            return defaultValue
        } finally {
            setIsLoading(false)
        }
    }, [key, defaultValue, storage, isClient, getFromIndexedDB])

    const setData = useCallback(
        async (newData: T) => {
            if (!isClient) return

            try {
                setError(null)

                switch (storage) {
                    case "localStorage":
                        if ("localStorage" in window) {
                            localStorage.setItem(key, JSON.stringify(newData))
                        }
                        break

                    case "sessionStorage":
                        if ("sessionStorage" in window) {
                            sessionStorage.setItem(key, JSON.stringify(newData))
                        }
                        break

                    case "indexedDB":
                        await setToIndexedDB(key, newData)
                        break
                }

                setDataState(newData)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Storage error"
                setError(errorMessage)
                console.error("Set data error:", err)
            }
        },
        [key, storage, isClient, setToIndexedDB],
    )

    const removeData = useCallback(async () => {
        if (!isClient) return

        try {
            setError(null)

            switch (storage) {
                case "localStorage":
                    if ("localStorage" in window) {
                        localStorage.removeItem(key)
                    }
                    break

                case "sessionStorage":
                    if ("sessionStorage" in window) {
                        sessionStorage.removeItem(key)
                    }
                    break

                case "indexedDB":
                    await removeFromIndexedDB(key)
                    break
            }

            setDataState(defaultValue)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Storage error"
            setError(errorMessage)
            console.error("Remove data error:", err)
        }
    }, [key, defaultValue, storage, isClient, removeFromIndexedDB])

    // 初始化数据
    useEffect(() => {
        getData()
    }, [getData])

    // 监听存储变化（仅适用于 localStorage 和 sessionStorage）
    useEffect(() => {
        if (!isClient || storage === "indexedDB") return

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue
                    setDataState(newValue)
                } catch (err) {
                    console.error("Storage change parse error:", err)
                }
            }
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [key, defaultValue, storage, isClient])

    // 检查存储配额（如果支持）
    useEffect(() => {
        if (!isClient || !("navigator" in window) || !("storage" in navigator)) return

        const checkStorageQuota = async () => {
            try {
                if ("estimate" in navigator.storage) {
                    const estimate = await navigator.storage.estimate()
                    const usedMB = (estimate.usage || 0) / (1024 * 1024)
                    const quotaMB = (estimate.quota || 0) / (1024 * 1024)

                    console.log(`Storage used: ${usedMB.toFixed(2)}MB / ${quotaMB.toFixed(2)}MB`)

                    // 如果使用超过 80%，发出警告
                    if (estimate.usage && estimate.quota && estimate.usage / estimate.quota > 0.8) {
                        console.warn("Storage quota nearly full")
                    }
                }
            } catch (err) {
                console.error("Storage quota check error:", err)
            }
        }

        checkStorageQuota()
    }, [isClient])

    return {
        data,
        setData,
        removeData,
        isLoading,
        error,
    }
}
