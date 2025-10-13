"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"

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

const getStorageKey = (repId: string) => `report-storage-${repId}`
const getMetadataKey = (repId: string) => `report-metadata-${repId}`

// Storage TTL: 7 days (in milliseconds)
const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000

const cleanupOldStorage = () => {
    try {
        if (typeof window === "undefined") return

        const now = Date.now()
        const keysToRemove: string[] = []

        // Check all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (!key) continue

            // Only check our report metadata keys
            if (key.startsWith("report-metadata-")) {
                try {
                    const metadataStr = localStorage.getItem(key)
                    if (!metadataStr) continue

                    const metadata = JSON.parse(metadataStr)
                    const timestamp = metadata.timestamp || 0

                    // If older than TTL, mark for removal
                    if (now - timestamp > STORAGE_TTL) {
                        const repId = key.replace("report-metadata-", "")
                        keysToRemove.push(getStorageKey(repId))
                        keysToRemove.push(getMetadataKey(repId))
                    }
                } catch (error) {
                    // Invalid metadata, mark for removal
                    keysToRemove.push(key)
                }
            }
        }

        // Remove old entries
        keysToRemove.forEach((key) => {
            localStorage.removeItem(key)
        })

        if (keysToRemove.length > 0) {
            console.log("[v0] Cleaned up old storage entries:", keysToRemove.length / 2, "reports")
        }
    } catch (error) {
        console.error("[v0] Failed to cleanup old storage:", error)
    }
}

const persistToStorage = (repId: string, data: any, metadata: any) => {
    try {
        if (typeof window === "undefined") return

        const storageKey = getStorageKey(repId)
        const metadataKey = getMetadataKey(repId)
        const dataStr = JSON.stringify(data)
        const metadataStr = JSON.stringify({
            ...metadata,
            timestamp: Date.now(),
        })

        // Primary: sessionStorage (auto-cleanup on tab close)
        sessionStorage.setItem(storageKey, dataStr)
        sessionStorage.setItem(metadataKey, metadataStr)

        // Backup: localStorage with TTL
        localStorage.setItem(storageKey, dataStr)
        localStorage.setItem(metadataKey, metadataStr)

        console.log("[v0] StorageContext persisted to session+local storage", { repId, dataKeys: Object.keys(data) })
    } catch (error) {
        console.error("[v0] Failed to persist storage:", error)
    }
}

const restoreFromStorage = (repId: string): { storage: any; metadata: any } | null => {
    try {
        if (typeof window === "undefined") return null

        const storageKey = getStorageKey(repId)
        const metadataKey = getMetadataKey(repId)

        // Try sessionStorage first (most recent)
        let storageData = sessionStorage.getItem(storageKey)
        let metadataData = sessionStorage.getItem(metadataKey)
        let source = "sessionStorage"

        // Fallback to localStorage if not in session
        if (!storageData) {
            storageData = localStorage.getItem(storageKey)
            metadataData = localStorage.getItem(metadataKey)
            source = "localStorage"

            // Check TTL for localStorage data
            if (metadataData) {
                const metadata = JSON.parse(metadataData)
                const timestamp = metadata.timestamp || 0
                const age = Date.now() - timestamp

                if (age > STORAGE_TTL) {
                    console.log("[v0] localStorage data expired, ignoring", {
                        repId,
                        age: Math.round(age / 1000 / 60 / 60),
                        hours: "",
                    })
                    // Clean up expired data
                    localStorage.removeItem(storageKey)
                    localStorage.removeItem(metadataKey)
                    return null
                }
            }
        }

        if (!storageData) return null

        const storage = JSON.parse(storageData)
        const metadata = metadataData ? JSON.parse(metadataData) : {}

        console.log("[v0] StorageContext restored from", source, {
            repId,
            dataKeys: Object.keys(storage),
            timestamp: metadata.timestamp,
        })

        return { storage, metadata }
    } catch (error) {
        console.error("[v0] Failed to restore storage:", error)
        return null
    }
}

export function StorageProvider({ children }: { children: ReactNode }) {
    const repId = useActualRepId()

    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)
    const [modified, setModified] = useState<boolean>(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        cleanupOldStorage()
    }, [])

    useEffect(() => {
        if (!repId || repId === "*") return

        console.log("[v0] StorageProvider initializing for repId:", repId)

        const restored = restoreFromStorage(repId)
        if (restored) {
            setStorageState(restored.storage)
            setSubrType(restored.metadata.subrType)
            setParrepfs(restored.metadata.parrepfs || {})
            setModified(restored.metadata.modified || false)
            console.log("[v0] Restored storage context")
        }

        setIsInitialized(true)
    }, [repId])

    useEffect(() => {
        if (!isInitialized || !repId || repId === "*") return

        // Debounce persistence to avoid excessive writes
        const timeoutId = setTimeout(() => {
            persistToStorage(repId, storage, {
                subrType,
                parrepfs,
                modified,
            })
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [storage, subrType, parrepfs, modified, repId, isInitialized])

    const setStorage = useCallback((data: any) => {
        if (typeof data === "function") {
            setStorageState((prev: any) => {
                const newData = data(prev)
                console.log("[v0] Storage updated (function)", {
                    prevKeys: Object.keys(prev),
                    newKeys: Object.keys(newData),
                })
                return newData
            })
        } else {
            console.log("[v0] Storage updated (direct)", { keys: Object.keys(data) })
            setStorageState(data)
        }
    }, [])

    const setOffline = useCallback((isOffline: boolean) => {
        console.log("StorageContext: Setting offline status", isOffline)
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

export function clearPersistedStorage(repId: string) {
    try {
        if (typeof window === "undefined") return

        const storageKey = getStorageKey(repId)
        const metadataKey = getMetadataKey(repId)

        sessionStorage.removeItem(storageKey)
        sessionStorage.removeItem(metadataKey)
        localStorage.removeItem(storageKey)
        localStorage.removeItem(metadataKey)

        console.log("[v0] Cleared persisted storage for repId:", repId)
    } catch (error) {
        console.error("[v0] Failed to clear persisted storage:", error)
    }
}
