"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {useNetworkStatusContext} from "@/contexts/network-status-context";

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

// 将 IndexedDB 辅助函数移到顶部，避免使用前声明的问题
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

export function useOfflineStorage<T>({ key, defaultValue, syncInterval = 5000 }: OfflineStorageOptions) {
    const [data, setData] = useState<T>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
    const { isClientOnline, isOnline, isGraphQLBackendReachable,lastOnlineTime } = useNetworkStatusContext()
    const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

    // 同步到服务器的函数
    const syncToServer = useCallback(
        async (data: T) => {
            if (!isClientOnline || !isGraphQLBackendReachable) {
                return false
            }

            setSyncStatus("syncing")
            window.dispatchEvent(new CustomEvent("sync-start"))

            try {
                const response = await fetch("/api/sync", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        key,
                        data,
                        timestamp: Date.now(),
                    }),
                })

                if (response.ok) {
                    setSyncStatus("success")
                    setLastSyncTime(new Date())
                    window.dispatchEvent(new CustomEvent("sync-success"))
                    return true
                } else {
                    setSyncStatus("error")
                    window.dispatchEvent(new CustomEvent("sync-error"))
                    return false
                }
            } catch (error) {
                console.error("同步失败:", error)
                setSyncStatus("error")
                window.dispatchEvent(new CustomEvent("sync-error"))
                return false
            }
        },
        [key, isClientOnline, isGraphQLBackendReachable],
    )

    // 获取存储信息
    const updateStorageInfo = useCallback(async () => {
        if ("storage" in navigator && "estimate" in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate()
                setStorageInfo((prev) => {
                    const newInfo = {
                        used: estimate.usage || 0,
                        quota: estimate.quota || 0,
                        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
                    }
                    // 只有当信息真正改变时才更新
                    if (!prev || prev.used !== newInfo.used || prev.quota !== newInfo.quota) {
                        return newInfo
                    }
                    return prev
                })
            } catch (error) {
                console.error("获取存储信息失败:", error)
            }
        }
    }, []) // 移除所有依赖，使用函数式更新

    // 从本地存储加载数据
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true)

            // 尝试从 IndexedDB 加载
            if ("indexedDB" in window) {
                const stored = await getFromIndexedDB(key)
                if (stored !== null) {
                    setData(stored)
                    setLastSaved(new Date(stored._timestamp || Date.now()))
                    return
                }
            }

            // 回退到 localStorage
            const stored = localStorage.getItem(key)
            if (stored) {
                const parsed = JSON.parse(stored)
                setData(parsed.data || defaultValue)
                setLastSaved(new Date(parsed.timestamp || Date.now()))
            } else {
                setData(defaultValue)
            }
        } catch (error) {
            console.error("加载离线数据失败:", error)
            setData(defaultValue)
        } finally {
            setIsLoading(false)
        }
    }, [key, defaultValue]) // 只保留必要的依赖

    // 保存数据到本地存储
    const saveData = useCallback(
        async (newData: T) => {
            try {
                const timestamp = Date.now()
                const dataWithTimestamp = {
                    ...newData,
                    _timestamp: timestamp,
                }

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

                setData(newData)
                setLastSaved(new Date(timestamp))

                // 触发数据变更事件
                window.dispatchEvent(new CustomEvent("offline-data-change"))

                // 同步数据到服务器
                const syncSuccess = await syncToServer(newData)
                if (!syncSuccess) {
                    console.warn("数据同步到服务器失败，本地数据已更新")
                }
            } catch (error) {
                console.error("保存离线数据失败:", error)
            }
        },
        [key, syncToServer],
    )

    // 清理过期数据
    const cleanupExpiredData = useCallback(async () => {
        const expireTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7天前

        try {
            if ("indexedDB" in window) {
                await cleanupIndexedDB(expireTime)
            }

            // 清理 localStorage 中的过期数据
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
        } catch (error) {
            console.error("清理过期数据失败:", error)
        }
    }, [])

    const syncFromServer = useCallback(async (): Promise<T | null> => {
        if (!isClientOnline || !isGraphQLBackendReachable) {
            return null
        }

        try {
            const response = await fetch(`/api/sync/${key}`, {
                cache: "no-cache",
            })

            if (response.ok) {
                const serverData = await response.json()
                return serverData.data
            }
        } catch (error) {
            console.error("从服务器获取数据失败:", error)
        }

        return null
    }, [key, isClientOnline, isGraphQLBackendReachable])

    const loadDataRef = useRef(loadData)
    const updateStorageInfoRef = useRef(updateStorageInfo)
    const cleanupExpiredDataRef = useRef(cleanupExpiredData)

    // 更新 refs
    useEffect(() => {
        loadDataRef.current = loadData
        updateStorageInfoRef.current = updateStorageInfo
        cleanupExpiredDataRef.current = cleanupExpiredData
    }, [loadData, updateStorageInfo, cleanupExpiredData])

    useEffect(() => {
        loadDataRef.current()
        updateStorageInfoRef.current()
        cleanupExpiredDataRef.current()

        // 定期更新存储信息
        const interval = setInterval(() => {
            updateStorageInfoRef.current()
        }, syncInterval)

        return () => clearInterval(interval)
    }, [syncInterval]) // 只依赖 syncInterval

    useEffect(() => {
        if (isClientOnline && lastOnlineTime) {
            // 网络恢复时自动同步
            const autoSync = async () => {
                try {
                    // 先尝试从服务器获取最新数据
                    const serverData = await syncFromServer()
                    if (serverData) {
                        // 触发数据更新事件
                        window.dispatchEvent(
                            new CustomEvent("data-sync-update", {
                                detail: { key, data: serverData },
                            }),
                        )
                    }
                } catch (error) {
                    console.error("自动同步失败:", error)
                }
            }

            // 延迟执行，避免网络刚恢复时的不稳定
            const timer = setTimeout(autoSync, 2000)
            return () => clearTimeout(timer)
        }
    }, [isClientOnline, lastOnlineTime, syncFromServer, key])

    useEffect(() => {
        const handleDataSyncUpdate = (event: CustomEvent<{ key: string; data: T }>) => {
            if (event.detail.key === key) {
                setData(event.detail.data)
            }
        }

        window.addEventListener("data-sync-update", handleDataSyncUpdate as EventListener)

        return () => {
            window.removeEventListener("data-sync-update", handleDataSyncUpdate as EventListener)
        }
    }, [key])

    return {
        data,
        setData: saveData,
        isLoading,
        lastSaved,
        storageInfo,
        refresh: loadData,
        cleanup: cleanupExpiredData,
        syncStatus,
        lastSyncTime,
        syncToServer,
        syncFromServer,
        canSync: isClientOnline && isGraphQLBackendReachable,
    }
}
