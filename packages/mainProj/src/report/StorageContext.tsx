"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

// Define the shape of your context data
type StorageContextType = {
    storage: any
    setStorage: (data: any) => void
    modified: boolean | undefined
    setModified: (data: boolean | undefined) => void
    parrepfs: any
    setParrepfs: (data: any) => void
    subrType: any
    setSubrType: (data: any) => void
    offline: boolean
    setOffline: (data: boolean) => void
}

// Create the context with a default value
const StorageContext = createContext<StorageContextType | undefined>(undefined)

// Create a provider component
export function StorageProvider({ children }: { children: ReactNode }) {
    const [storage, setStorage] = React.useState<any>({});
    const [modified, setModified] = React.useState<boolean | undefined>();
    //可流转分项报告
    const [parrepfs, setParrepfs] = React.useState<any>({});
    //不是独立流转的，其它情形（可重复分项的）就没有这个！
    const [subrType, setSubrType] = React.useState<string | undefined>();
    //后端主要的服务器离线了
    const [offline, setOffline] = React.useState<boolean>(false);
    //复用app路由带来的【问题】流转分项与主报告的状态管理，交叉？。
    const value = {
        storage,
        setStorage,
        modified,
        setModified,
        parrepfs,
        setParrepfs,
        subrType,
        setSubrType,
        offline,
        setOffline,
    }
    return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

// Create a custom hook to use the context
export function useStorage() {
    const context = useContext(StorageContext)
    if (context === undefined) {
        throw new Error("useStorage must be used within a StorageProvider")
    }
    return context
}
