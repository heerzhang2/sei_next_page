"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

// Define the shape of your context data
type StorageContextType = {
    storage: any
    setStorage: (data: any) => void
    modified: boolean | undefined
    setModified: (data: boolean | undefined) => void
}

// Create the context with a default value
const StorageContext = createContext<StorageContextType | undefined>(undefined)

// Create a provider component
export function StorageProvider({ children }: { children: ReactNode }) {
    const [storage, setStorage] = React.useState<any>({});
    const [modified, setModified] = React.useState<boolean | undefined>();
    // Add your state management logic here

    const value = {
        storage,
        setStorage,
        modified,
        setModified,
        // Add other state and methods
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
