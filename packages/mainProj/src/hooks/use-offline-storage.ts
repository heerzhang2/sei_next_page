"use client"

import { useState, useEffect, useCallback } from "react"

interface UseOfflineStorageOptions {
    key: string
    defaultValue?: any
    storage?: "localStorage" | "sessionStorage" | "indexedDB" | "auto"
    syncInterval?: number
}

interface UseOfflineStorageReturn<T> {
    data: T | null
    setData: (data: T) => Promise<void>
    removeData: () => Promise<void>
    isLoading: boolean
    error: string | null
    storageType: string
    isSupported: boolean
}

export function useOfflineStorage<T = any>({
                                               key,
                                               defaultValue = null,
                                               storage = "auto",
                                               syncInterval = 30000,
                                           }: UseOfflineStorageOptions): UseOfflineStorageReturn<T> {
    const [data, setDataState] = useState<T | null>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [storageType, setStorageType] = useState<string>("none")
    const [isSupported, setIsSupported] = useState(false)

    // 检查是否在客户端环境
    const isClient = typeof window !== "undefined"

    // 检测最佳存储方案
    const detectBestStorage = useCallback(() => {
        if (!isClient) return "none"

        if (storage !== "auto") {
            // 用户指定了存储类型，检查是否支持
            switch (storage) {
                case "localStorage":
                    try {
                        const testKey = "__test_localStorage__"
                        localStorage.setItem(testKey, "test")
                        localStorage.removeItem(testKey)
                        return "localStorage"
                    } catch {
                        return "none"
                    }
                case "sessionStorage":
                    try {
                        const testKey = "__test_sessionStorage__"
                        sessionStorage.setItem(testKey, "test")
                        sessionStorage.removeItem(testKey)
                        return "sessionStorage"
                    } catch {
                        return "none"
                    }
                case "indexedDB":
                    return "indexedDB" in window ? "indexedDB" : "none"
                default:
                    return "none"
            }
        }

        // 自动检测最佳存储方案
        // 优先级：IndexedDB > localStorage > sessionStorage
        if ("indexedDB" in window) {
            return "indexedDB"
        }

        try {
            const testKey = "__test_localStorage__"
            localStorage.setItem(testKey, "test")
            localStorage.removeItem(testKey)
            return "localStorage"
        } catch {
            try {
                const testKey = "__test_sessionStorage__"
                sessionStorage.setItem(testKey, "test")
                sessionStorage.removeItem(testKey)
                return "sessionStorage"
            } catch {
                return "none"
            }
        }
    }, [isClient, storage])

    // IndexedDB 操作
    const openDB = useCallback(async (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("OfflineStorage", 1)

            request.onerror = () => reject(new Error("IndexedDB 打开失败"))
            request.onsuccess = () => resolve(request.result)

            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data", { keyPath: "key" })
                }
            }
        })
    }, [])

    const getFromIndexedDB = useCallback(
        async (key: string): Promise<any> => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readonly")
                const store = transaction.objectStore("data")

                return new Promise((resolve, reject) => {
                    const request = store.get(key)
                    request.onerror = () => reject(new Error("IndexedDB 读取失败"))
                    request.onsuccess = () => {
                        const result = request.result
                        resolve(result ? result.value : null)
                    }
                })
            } catch (error) {
                console.error("IndexedDB get error:", error)
                throw error
            }
        },
        [openDB],
    )

    const setToIndexedDB = useCallback(
        async (key: string, value: any): Promise<void> => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readwrite")
                const store = transaction.objectStore("data")

                return new Promise((resolve, reject) => {
                    const request = store.put({ key, value, timestamp: Date.now() })
                    request.onerror = () => reject(new Error("IndexedDB 写入失败"))
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
        async (key: string): Promise<void> => {
            try {
                const db = await openDB()
                const transaction = db.transaction(["data"], "readwrite")
                const store = transaction.objectStore("data")

                return new Promise((resolve, reject) => {
                    const request = store.delete(key)
                    request.onerror = () => reject(new Error("IndexedDB 删除失败"))
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
    const getData = useCallback(async (): Promise<T | null> => {
        if (!isClient) return defaultValue

        const bestStorage = detectBestStorage()
        setStorageType(bestStorage)
        setIsSupported(bestStorage !== "none")

        if (bestStorage === "none") {
            setError("没有可用的存储方案")
            return defaultValue
        }

        try {
            setIsLoading(true)
            setError(null)

            let result = null

            switch (bestStorage) {
                case "localStorage":
                    try {
                        const stored = localStorage.getItem(key)
                        result = stored ? JSON.parse(stored) : defaultValue
                    } catch (parseError) {
                        console.error("localStorage parse error:", parseError)
                        localStorage.removeItem(key) // 清除损坏的数据
                        result = defaultValue
                    }
                    break

                case "sessionStorage":
                    try {
                        const stored = sessionStorage.getItem(key)
                        result = stored ? JSON.parse(stored) : defaultValue
                    } catch (parseError) {
                        console.error("sessionStorage parse error:", parseError)
                        sessionStorage.removeItem(key) // 清除损坏的数据
                        result = defaultValue
                    }
                    break

                case "indexedDB":
                    try {
                        result = await getFromIndexedDB(key)
                        if (result === null) result = defaultValue
                    } catch (dbError) {
                        console.error("IndexedDB error, fallback to localStorage:", dbError)
                        // IndexedDB 失败时回退到 localStorage
                        try {
                            const stored = localStorage.getItem(key)
                            result = stored ? JSON.parse(stored) : defaultValue
                            setStorageType("localStorage")
                        } catch {
                            result = defaultValue
                        }
                    }
                    break

                default:
                    result = defaultValue
            }

            setDataState(result)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "存储读取失败"
            setError(errorMessage)
            console.error("Get data error:", err)
            return defaultValue
        } finally {
            setIsLoading(false)
        }
    }, [key, defaultValue, isClient, detectBestStorage, getFromIndexedDB])

    const setData = useCallback(
        async (newData: T): Promise<void> => {
            if (!isClient || storageType === "none") {
                setError("存储不可用")
                return
            }

            try {
                setError(null)

                switch (storageType) {
                    case "localStorage":
                        localStorage.setItem(key, JSON.stringify(newData))
                        break

                    case "sessionStorage":
                        sessionStorage.setItem(key, JSON.stringify(newData))
                        break

                    case "indexedDB":
                        try {
                            await setToIndexedDB(key, newData)
                        } catch (dbError) {
                            console.error("IndexedDB error, fallback to localStorage:", dbError)
                            // IndexedDB 失败时回退到 localStorage
                            localStorage.setItem(key, JSON.stringify(newData))
                            setStorageType("localStorage")
                        }
                        break
                }

                setDataState(newData)
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "存储写入失败"
                setError(errorMessage)
                console.error("Set data error:", err)
                throw err
            }
        },
        [key, storageType, isClient, setToIndexedDB],
    )

    const removeData = useCallback(async (): Promise<void> => {
        if (!isClient || storageType === "none") {
            setError("存储不可用")
            return
        }

        try {
            setError(null)

            switch (storageType) {
                case "localStorage":
                    localStorage.removeItem(key)
                    break

                case "sessionStorage":
                    sessionStorage.removeItem(key)
                    break

                case "indexedDB":
                    try {
                        await removeFromIndexedDB(key)
                    } catch (dbError) {
                        console.error("IndexedDB error, fallback to localStorage:", dbError)
                        localStorage.removeItem(key)
                        setStorageType("localStorage")
                    }
                    break
            }

            setDataState(defaultValue)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "存储删除失败"
            setError(errorMessage)
            console.error("Remove data error:", err)
            throw err
        }
    }, [key, defaultValue, storageType, isClient, removeFromIndexedDB])

    // 初始化数据
    useEffect(() => {
        getData()
    }, [getData])

    // 监听存储变化（仅适用于 localStorage 和 sessionStorage）
    useEffect(() => {
        if (!isClient || storageType === "indexedDB" || storageType === "none") return

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
    }, [key, defaultValue, storageType, isClient])

    // 定期同步数据（可选）
    useEffect(() => {
        if (!syncInterval || syncInterval <= 0) return

        const interval = setInterval(() => {
            // 这里可以添加与服务器同步的逻辑
            console.log(`Sync check for key: ${key}`)
        }, syncInterval)

        return () => clearInterval(interval)
    }, [key, syncInterval])

    return {
        data,
        setData,
        removeData,
        isLoading,
        error,
        storageType,
        isSupported,
    }
}
