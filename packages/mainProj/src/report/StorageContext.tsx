"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

interface StorageContextType {
    storage: any
    setStorage: (data: any) => void
    //subrType这个字段是根据URL当中的"subrid"来决定的，是在底下的ReportData组件动态设置的！
    subrType: string | undefined
    setSubrType: (type: string | undefined) => void
    parrepfs: any
    setParrepfs: (data: any) => void
    offline: boolean
    setOffline: (offline: boolean) => void
    modified?: boolean
    setModified?: (modified: boolean) => void
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
    const repId = useActualRepId()

    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)
    const [modified, setModified] = useState<boolean>(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        indexedDBStorage.cleanup().catch((error) => {
            console.error("[StorageContext] Cleanup failed:", error)
        })
    }, [])

    useEffect(() => {
        if (!repId || repId === "*") return

        console.log("[StorageContext] Initializing for repId:", repId)
        //因为PWA离线状态，点击报告链接导航不同项目都会引起重新初始化从而使当前的StorageProvider丢失，需保存当前修改状态！！
        indexedDBStorage
            .load(repId)
            .then((restored) => {
                if (restored) {
                    setStorageState(restored.storage)
                     // setSubrType(restored.metadata.subrType)    //独立流转的子报告情形
                    setParrepfs(restored.metadata.parrepfs || {})
                    setModified(restored.metadata.modified || false)
                    console.log("[StorageContext] Restored from IndexedDB")
                }
                setIsInitialized(true)
            })
            .catch((error) => {
                console.error("[StorageContext] Failed to restore:", error)
                setIsInitialized(true)
            })
    }, [repId])

    useEffect(() => {
        if (!isInitialized || !repId || repId === "*") return

        // Debounce persistence to avoid excessive writes
        const timeoutId = setTimeout(() => {
            indexedDBStorage
                .save(repId, storage, {
                    // subrType,
                    parrepfs,
                    modified,
                })
                .catch((error) => {
                    console.error("[StorageContext] Failed to persist:", error)
                })
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [storage, parrepfs, modified, repId, isInitialized])

    const setStorage = useCallback((data: any) => {
        if (typeof data === "function") {
            setStorageState((prev: any) => {
                const newData = data(prev)
                console.log("[StorageContext] Storage updated (function)", {
                    prevKeys: Object.keys(prev),
                    newKeys: Object.keys(newData),
                })
                return newData
            })
        } else {
            console.log("[StorageContext] Storage updated (direct)", { keys: Object.keys(data) })
            setStorageState(data)
        }
    }, [])

    const setOffline = useCallback((isOffline: boolean) => {
        console.log("[StorageContext] Setting offline status:", isOffline)
        setOfflineState(isOffline)
    }, [])

    const value: StorageContextType = {
        storage,
        setStorage,
        subrType,
        setSubrType,
        parrepfs,
        setParrepfs,
        offline,
        setOffline,
        modified,
        setModified,
    }

    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

export function useStorage() {
    const context = useContext(StorageContext)
    if (context === undefined) {
        throw new Error("useStorage must be used within a StorageProvider")
    }
    return context
}

export async function clearPersistedStorage(repId: string) {
    try {
        await indexedDBStorage.remove(repId)
        console.log("[StorageContext] Cleared persisted storage for repId:", repId)
    } catch (error) {
        console.error("[StorageContext] Failed to clear persisted storage:", error)
    }
}
