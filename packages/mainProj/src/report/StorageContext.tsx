"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import { useSearchParams } from "next/navigation"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

interface StorageContextType {
    storage: any
    setStorage: (data: any) => void
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
    const searchParams = useSearchParams()
    const subrid = searchParams?.get("subrid") || undefined

    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)
    const [modified, setModifiedState] = useState<boolean>(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        indexedDBStorage.cleanup().catch((error) => {
            console.error("[StorageContext] Cleanup failed:", error)
        })
    }, [])

    useEffect(() => {
        if (!repId || repId === "*" || !modified) return

        console.log("[StorageContext] Initializing storage for:", { repId, subrid, modified })

        indexedDBStorage
            .load(repId, subrid)
            .then((restored) => {
                if (restored) {
                    setStorageState(restored.storage)
                    setParrepfs(restored.metadata.parrepfs || {})
                    console.log("[StorageContext] Restored from IndexedDB")
                }
                setIsInitialized(true)
            })
            .catch((error) => {
                console.error("[StorageContext] Failed to restore:", error)
                setIsInitialized(true)
            })
    }, [repId, subrid, modified])

    const saveImmediately = useCallback(() => {
        if (!repId || repId === "*") return

        console.log("[StorageContext] Saving immediately for repId:", repId)
        indexedDBStorage.save(repId, storage, { parrepfs, modified }, subrid).catch((error) => {
            console.error("[StorageContext] Immediate save failed:", error)
        })
    }, [storage, parrepfs, modified, repId, subrid])

    useEffect(() => {
        window.addEventListener("beforeunload", saveImmediately)
        return () => window.removeEventListener("beforeunload", saveImmediately)
    }, [saveImmediately])

    useEffect(() => {
        return () => {
            console.log("[StorageContext] Component unmounting, saving immediately")
            saveImmediately()
        }
    }, [saveImmediately])

    useEffect(() => {
        if (typeof window === "undefined") return

        const handleRouteChange = () => {
            console.log("[StorageContext] Route changing, saving immediately")
            saveImmediately()
        }

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest("a")
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                console.log("[StorageContext] Link clicked, saving immediately")
                saveImmediately()
            }
        }

        window.addEventListener("popstate", handleRouteChange)
        document.addEventListener("click", handleClick, true)

        return () => {
            window.removeEventListener("popstate", handleRouteChange)
            document.removeEventListener("click", handleClick, true)
        }
    }, [])

    useEffect(() => {
        if (!isInitialized || !repId || repId === "*" || !modified) return

        const timeoutId = setTimeout(() => {
            indexedDBStorage.save(repId, storage, { parrepfs, modified }, subrid).catch((error) => {
                console.error("[StorageContext] Failed to persist:", error)
            })
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [storage, parrepfs, modified, repId, subrid, isInitialized])

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

    const setModified = useCallback(
        (value: boolean) => {
            console.log("[StorageContext] Setting modified:", value)
            setModifiedState(value)

            if (!value && repId && repId !== "*") {
                indexedDBStorage.markAsSaved(repId, subrid).catch((error) => {
                    console.error("[StorageContext] Failed to mark as saved:", error)
                })
            }
        },
        [repId, subrid],
    )

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

export async function clearPersistedStorage(repId: string, subrid?: string) {
    try {
        await indexedDBStorage.remove(repId, subrid)
        console.log("[StorageContext] Cleared persisted storage for:", { repId, subrid })
    } catch (error) {
        console.error("[StorageContext] Failed to clear persisted storage:", error)
    }
}
