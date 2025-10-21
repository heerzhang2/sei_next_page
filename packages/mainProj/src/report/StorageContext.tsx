"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
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
    const hasLoadedRef = useRef(false)
    const storageKeyRef = useRef<string>("")

    useEffect(() => {
        indexedDBStorage.cleanup().catch((error) => {
            console.error("[StorageContext] Cleanup failed:", error)
        })
    }, [])

    useEffect(() => {
        if (!repId || repId === "*") return

        const currentKey = `${repId}${subrid ? `-${subrid}` : ""}`

        // Skip if already loaded for this key
        if (hasLoadedRef.current && storageKeyRef.current === currentKey) {
            console.log("[StorageContext] Already loaded for this key, skipping")
            return
        }

        console.log("[StorageContext] Loading from IndexedDB for:", { repId, subrid })

        indexedDBStorage
            .load(repId, subrid)
            .then((restored) => {
                if (restored && restored.metadata.modified) {
                    console.log("[StorageContext] Restored user edits from IndexedDB", {
                        keys: Object.keys(restored.storage).length,
                        modified: restored.metadata.modified,
                    })
                    setStorageState(restored.storage)
                    setParrepfs(restored.metadata.parrepfs || {})
                    setModifiedState(true) // Restore modified state
                } else {
                    console.log("[StorageContext] No user edits found in IndexedDB")
                }
                setIsInitialized(true)
                hasLoadedRef.current = true
                storageKeyRef.current = currentKey
            })
            .catch((error) => {
                console.error("[StorageContext] Failed to restore:", error)
                setIsInitialized(true)
                hasLoadedRef.current = true
                storageKeyRef.current = currentKey
            })
    }, [repId, subrid])

    useEffect(() => {
        const currentKey = `${repId}${subrid ? `-${subrid}` : ""}`
        if (storageKeyRef.current && storageKeyRef.current !== currentKey) {
            console.log("[StorageContext] Report/subrid changed, resetting state")
            hasLoadedRef.current = false
            setIsInitialized(false)
            setModifiedState(false) // Reset modified state on navigation
        }
    }, [repId, subrid])

    const saveImmediately = useCallback(() => {
        if (!repId || repId === "*" || !modified) {
            console.log("[StorageContext] Skipping save - not modified yet")
            return
        }

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
            if (modified) {
                console.log("[StorageContext] Component unmounting, saving immediately")
                saveImmediately()
            }
        }
    }, [saveImmediately, modified])

    useEffect(() => {
        if (typeof window === "undefined") return

        const handleRouteChange = () => {
            if (modified) {
                console.log("[StorageContext] Route changing, saving immediately")
                saveImmediately()
            }
        }

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest("a")
            if (link && link.href && link.href.startsWith(window.location.origin)) {
                if (modified) {
                    console.log("[StorageContext] Link clicked, saving immediately")
                    saveImmediately()
                }
            }
        }

        window.addEventListener("popstate", handleRouteChange)
        document.addEventListener("click", handleClick, true)

        return () => {
            window.removeEventListener("popstate", handleRouteChange)
            document.removeEventListener("click", handleClick, true)
        }
    }, [saveImmediately, modified])

    useEffect(() => {
        if (!isInitialized || !repId || repId === "*" || !modified) return

        const timeoutId = setTimeout(() => {
            console.log("[StorageContext] Auto-saving to IndexedDB")
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
                    prevKeys: Object.keys(prev).length,
                    newKeys: Object.keys(newData).length,
                })
                return newData
            })
        } else {
            console.log("[StorageContext] Storage updated (direct)", { keys: Object.keys(data).length })
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
