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
}

// Create the context with a default value
const StorageContext = createContext<StorageContextType | undefined>(undefined)

// Create a provider component
export function StorageProvider({ children }: { children: ReactNode }) {
    const [storage, setStorage] = React.useState<any>({});
    const [modified, setModified] = React.useState<boolean | undefined>();
    //可流转分项报告
    const [parrepfs, setParrepfs] = React.useState<any>({});
    const [subrType, setSubrType] = React.useState<string | undefined>();
    const value = {
        storage,
        setStorage,
        modified,
        setModified,
        parrepfs,
        setParrepfs,
        subrType,
        setSubrType
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
