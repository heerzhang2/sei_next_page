"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface StorageContextType {
    storage: any
    setStorage: (data: any) => void
    subrType: string | undefined
    setSubrType: (type: string | undefined) => void
    parrepfs: any
    setParrepfs: (data: any) => void
    offline: boolean
    setOffline: (offline: boolean) => void
    modified: boolean | undefined
    setModified: (data: boolean | undefined) => void
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)
    const [modified, setModified] = useState<boolean | undefined>();

    const setStorage = useCallback((data: any) => {
        console.log("StorageContext: Setting storage data", data)
        setStorageState(data)
    }, [])

    const setOffline = useCallback((isOffline: boolean) => {
        console.log("StorageContext: Setting offline status", isOffline)
        setOfflineState(isOffline)
    }, [])

    // 监听网络状态变化
    useEffect(() => {
        const handleOnline = () => {
            console.log("StorageContext: Network online detected")
            setOfflineState(false) // 直接调用 setOfflineState 而不是 setOffline
        }

        const handleOffline = () => {
            console.log("StorageContext: Network offline detected")
            setOfflineState(true) // 直接调用 setOfflineState 而不是 setOffline
        }

        if (typeof window !== "undefined") {
            // 初始化网络状态
            setOfflineState(!navigator.onLine)

            window.addEventListener("online", handleOnline)
            window.addEventListener("offline", handleOffline)

            return () => {
                window.removeEventListener("online", handleOnline)
                window.removeEventListener("offline", handleOffline)
            }
        }
    }, []) // 空依赖数组，确保只运行一次

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
