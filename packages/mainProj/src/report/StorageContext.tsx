"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface StorageContextType {
    storage: any
    setStorage: (data: any) => void
    subrType: string | undefined
    setSubrType: (type: string | undefined) => void
    parrepfs: any
    setParrepfs: (data: any) => void
    offline: boolean
    setOffline: (offline: boolean) => void
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
    const [storage, setStorageState] = useState<any>({})
    const [subrType, setSubrType] = useState<string | undefined>(undefined)
    const [parrepfs, setParrepfs] = useState<any>({})
    const [offline, setOfflineState] = useState<boolean>(false)

    const setStorage = (data: any) => {
        console.log("StorageContext: Setting storage data", data)
        setStorageState(data)
    }

    const setOffline = (isOffline: boolean) => {
        console.log("StorageContext: Setting offline status", isOffline)
        setOfflineState(isOffline)
    }

    // 监听网络状态变化
    useEffect(() => {
        const handleOnline = () => {
            console.log("StorageContext: Network online detected")
            setOffline(false)
        }

        const handleOffline = () => {
            console.log("StorageContext: Network offline detected")
            setOffline(true)
        }

        if (typeof window !== "undefined") {
            window.addEventListener("online", handleOnline)
            window.addEventListener("offline", handleOffline)

            // 初始化网络状态
            setOffline(!navigator.onLine)

            return () => {
                window.removeEventListener("online", handleOnline)
                window.removeEventListener("offline", handleOffline)
            }
        }
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
