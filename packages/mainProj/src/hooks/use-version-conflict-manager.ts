"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

export interface VersionConflictRequest {
    id: string
    operationName: string
    variables: any
    query: string
    timestamp: number
    errorMessage: string
    invalidId: string
    retryCount: number
    status: "conflict" | "resolved" | "ignored"
    backupTimestamp: number
}

export interface VersionConflictManager {
    conflictRequests: VersionConflictRequest[]
    totalConflicts: number
    resolvedCount: number
    ignoredCount: number

    // 冲突操作
    addConflictRequest: (operation: any, error: any) => Promise<void>
    resolveConflict: (id: string) => Promise<void>
    ignoreConflict: (id: string) => Promise<void>
    clearConflicts: () => Promise<void>

    // 导出功能
    exportConflictData: () => string
}

const CONFLICT_DB_NAME = "version-conflicts-sei"
const CONFLICT_STORE_NAME = "conflicts"
const CONFLICT_DB_VERSION = 1

const openConflictDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(CONFLICT_DB_NAME, CONFLICT_DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(CONFLICT_STORE_NAME)) {
                const store = db.createObjectStore(CONFLICT_STORE_NAME, { keyPath: "id" })
                store.createIndex("timestamp", "timestamp", { unique: false })
                store.createIndex("status", "status", { unique: false })
            }
        }
    })
}

const saveConflictToIndexedDB = async (conflict: VersionConflictRequest): Promise<void> => {
    try {
        const db = await openConflictDatabase()
        const transaction = db.transaction([CONFLICT_STORE_NAME], "readwrite")
        const store = transaction.objectStore(CONFLICT_STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.put(conflict)
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    } catch (error) {
        console.error("保存版本冲突到IndexedDB失败:", error)
        throw error
    }
}

const loadConflictsFromIndexedDB = async (): Promise<VersionConflictRequest[]> => {
    try {
        const db = await openConflictDatabase()
        const transaction = db.transaction([CONFLICT_STORE_NAME], "readonly")
        const store = transaction.objectStore(CONFLICT_STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.getAll()
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result || [])
        })
    } catch (error) {
        console.error("从IndexedDB加载版本冲突失败:", error)
        return []
    }
}

const updateConflictInIndexedDB = async (id: string, updates: Partial<VersionConflictRequest>): Promise<void> => {
    try {
        const db = await openConflictDatabase()
        const transaction = db.transaction([CONFLICT_STORE_NAME], "readwrite")
        const store = transaction.objectStore(CONFLICT_STORE_NAME)

        return new Promise((resolve, reject) => {
            const getRequest = store.get(id)
            getRequest.onerror = () => reject(getRequest.error)
            getRequest.onsuccess = () => {
                const conflict = getRequest.result
                if (conflict) {
                    const updatedConflict = { ...conflict, ...updates }
                    const putRequest = store.put(updatedConflict)
                    putRequest.onerror = () => reject(putRequest.error)
                    putRequest.onsuccess = () => resolve()
                } else {
                    reject(new Error("版本冲突记录不存在"))
                }
            }
        })
    } catch (error) {
        console.error("更新版本冲突记录失败:", error)
        throw error
    }
}

const clearConflictsFromIndexedDB = async (): Promise<void> => {
    try {
        const db = await openConflictDatabase()
        const transaction = db.transaction([CONFLICT_STORE_NAME], "readwrite")
        const store = transaction.objectStore(CONFLICT_STORE_NAME)

        return new Promise((resolve, reject) => {
            const request = store.clear()
            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    } catch (error) {
        console.error("清空版本冲突记录失败:", error)
        throw error
    }
}

export function useVersionConflictManager(): VersionConflictManager {
    const [conflictRequests, setConflictRequests] = useState<VersionConflictRequest[]>([])
    const mountedRef = useRef(true)

    const loadConflicts = useCallback(async () => {
        if (!mountedRef.current) return

        try {
            const conflicts = await loadConflictsFromIndexedDB()
            setConflictRequests(conflicts)
        } catch (error) {
            console.error("加载版本冲突记录失败:", error)
        }
    }, [])

    const addConflictRequest = useCallback(async (operation: any, error: any) => {
        try {
            const operationName = operation.query?.definitions?.[0]?.name?.value || "Unknown"
            const errorMessage = error.message || error.graphQLErrors?.[0]?.message || "版本冲突错误"
            const invalidId = error.graphQLErrors?.[0]?.extensions?.invalidId || "未知ID"

            const conflict: VersionConflictRequest = {
                id: `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                operationName,
                variables: operation.variables || {},
                query: operation.query?.loc?.source?.body || "",
                timestamp: Date.now(),
                errorMessage,
                invalidId,
                retryCount: 0,
                status: "conflict",
                backupTimestamp: Date.now(),
            }

            await saveConflictToIndexedDB(conflict)

            setConflictRequests((prev) => [conflict, ...prev])

            console.log("[VersionConflictManager] 已保存版本冲突请求:", operationName)
        } catch (error) {
            console.error("添加版本冲突请求失败:", error)
            toast.error("保存版本冲突请求失败")
        }
    }, [])

    const resolveConflict = useCallback(async (id: string) => {
        try {
            await updateConflictInIndexedDB(id, { status: "resolved" })

            setConflictRequests((prev) =>
                prev.map((conflict) => (conflict.id === id ? { ...conflict, status: "resolved" } : conflict)),
            )

            toast.success("版本冲突已标记为已解决")
        } catch (error) {
            console.error("解决版本冲突失败:", error)
            toast.error("解决版本冲突失败")
        }
    }, [])

    const ignoreConflict = useCallback(async (id: string) => {
        try {
            await updateConflictInIndexedDB(id, { status: "ignored" })

            setConflictRequests((prev) =>
                prev.map((conflict) => (conflict.id === id ? { ...conflict, status: "ignored" } : conflict)),
            )

            toast.success("版本冲突已标记为忽略")
        } catch (error) {
            console.error("忽略版本冲突失败:", error)
            toast.error("忽略版本冲突失败")
        }
    }, [])

    const clearConflicts = useCallback(async () => {
        try {
            await clearConflictsFromIndexedDB()
            setConflictRequests([])
            toast.success("版本冲突记录已清空")
        } catch (error) {
            console.error("清空版本冲突记录失败:", error)
            toast.error("清空版本冲突记录失败")
        }
    }, [])

    const exportConflictData = useCallback((): string => {
        const exportData = {
            conflictRequests,
            exportedAt: new Date().toISOString(),
            version: "1.0",
            type: "version-conflicts",
        }
        return JSON.stringify(exportData, null, 2)
    }, [conflictRequests])

    // 统计数据
    const totalConflicts = conflictRequests.length
    const resolvedCount = conflictRequests.filter((c) => c.status === "resolved").length
    const ignoredCount = conflictRequests.filter((c) => c.status === "ignored").length

    useEffect(() => {
        mountedRef.current = true
        loadConflicts()

        return () => {
            mountedRef.current = false
        }
    }, [loadConflicts])

    return {
        conflictRequests,
        totalConflicts,
        resolvedCount,
        ignoredCount,
        addConflictRequest,
        resolveConflict,
        ignoreConflict,
        clearConflicts,
        exportConflictData,
    }
}
