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
    modeltype?: string
    setModeltype?: (type: string | undefined) => void
    modelversion?: string
    setModelversion?: (version: string | undefined) => void
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
    const repId = useActualRepId()
    const searchParams = useSearchParams()
    const subrid = searchParams?.get("subrid") || undefined

    console.log("[v0] StorageProvider render:", { repId, subrid })

    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)
    const [modified, setModifiedState] = useState<boolean>(false)
    const [modeltype, setModeltypeState] = useState<string | undefined>(undefined)
    const [modelversion, setModelversionState] = useState<string | undefined>(undefined)
    const [isInitialized, setIsInitialized] = useState(false)
    const hasLoadedRef = useRef(false)
    const storageKeyRef = useRef<string>("")
    const activeStorageKeyRef = useRef<string>("")
    const isTransitioningRef = useRef(false)

    useEffect(() => {
        indexedDBStorage.cleanup().catch((error) => {
            console.error("[StorageContext] Cleanup failed:", error)
        })
    }, [])

    const currentKey = `${repId}${subrid ? `:${subrid}` : ""}`
    if (activeStorageKeyRef.current && activeStorageKeyRef.current !== currentKey) {
        console.log("[StorageContext] Report/subrid changed synchronously, resetting state", {
            oldKey: activeStorageKeyRef.current,
            newKey: currentKey,
        })
        isTransitioningRef.current = true
        setModifiedState(false)
        setStorageState({})
        setParrepfs({})
        setModeltypeState(undefined)
        setModelversionState(undefined)
        hasLoadedRef.current = false
        setIsInitialized(false)
    }
    activeStorageKeyRef.current = currentKey

    useEffect(() => {
        if (!repId || repId === "*") return

        const loadKey = `${repId}${subrid ? `-${subrid}` : ""}`

        if (hasLoadedRef.current && storageKeyRef.current === loadKey) {
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
                    setModifiedState(true)
                    setModeltypeState(restored.metadata.modeltype)
                    setModelversionState(restored.metadata.modelversion)
                } else {
                    console.log("[StorageContext] No user edits found in IndexedDB")
                }
                setIsInitialized(true)
                hasLoadedRef.current = true
                storageKeyRef.current = loadKey
                isTransitioningRef.current = false
            })
            .catch((error) => {
                console.error("[StorageContext] Failed to restore:", error)
                setIsInitialized(true)
                hasLoadedRef.current = true
                storageKeyRef.current = loadKey
                isTransitioningRef.current = false
            })
    }, [repId, subrid])

    const saveImmediately = useCallback(() => {
        if (isTransitioningRef.current) {
            console.log("[StorageContext] Skipping save - transitioning between reports")
            return
        }

        if (!repId || repId === "*" || !modified) {
            console.log("[StorageContext] Skipping save - not modified yet")
            return
        }

        const expectedKey = `${repId}${subrid ? `:${subrid}` : ""}`
        if (activeStorageKeyRef.current !== expectedKey) {
            console.log("[StorageContext] Skipping save - storage key mismatch", {
                active: activeStorageKeyRef.current,
                expected: expectedKey,
            })
            return
        }

        console.log("[v0] saveImmediately called:", {
            repId,
            subrid,
            storageKey: subrid ? `${repId}:${subrid}` : repId,
            modified,
            storageKeys: Object.keys(storage).slice(0, 5),
        })

        indexedDBStorage.save(repId, storage, { parrepfs, modified, modeltype, modelversion }, subrid).catch((error) => {
            console.error("[StorageContext] Immediate save failed:", error)
        })
    }, [storage, parrepfs, modified, repId, subrid, modeltype, modelversion])

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
            console.log("[v0] Auto-save triggered:", {
                repId,
                subrid,
                storageKey: subrid ? `${repId}:${subrid}` : repId,
                modified,
                storageKeys: Object.keys(storage).slice(0, 5),
            })

            indexedDBStorage.save(repId, storage, { parrepfs, modified, modeltype, modelversion }, subrid).catch((error) => {
                console.error("[StorageContext] Failed to persist:", error)
            })
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [storage, parrepfs, modified, repId, subrid, isInitialized, modeltype, modelversion])

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
                console.log("[StorageContext] Saving with modified=false to IndexedDB")
                indexedDBStorage
                    .save(repId, storage, { parrepfs, modified: false, modeltype, modelversion }, subrid)
                    .then(() => {
                        return indexedDBStorage.markAsSaved(repId, subrid)
                    })
                    .catch((error) => {
                        console.error("[StorageContext] Failed to update modified flag in IndexedDB:", error)
                    })
            }
        },
        [repId, subrid, storage, parrepfs, modeltype, modelversion],
    )

    const setModeltype = useCallback((type: string | undefined) => {
        console.log("[StorageContext] Setting modeltype:", type)
        setModeltypeState(type)
    }, [])

    const setModelversion = useCallback((version: string | undefined) => {
        console.log("[StorageContext] Setting modelversion:", version)
        setModelversionState(version)
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
        modeltype,
        setModeltype,
        modelversion,
        setModelversion,
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
