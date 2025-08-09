"use client"

import { useState, useEffect } from "react"
import { subscribeToNetworkStatus, getNetworkStatus } from "@/auth/graphql-component"

export interface NetworkStatus {
    isOnline: boolean
    lastError: Error | null
}

export function useNetworkStatus(): NetworkStatus {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(getNetworkStatus())

    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkStatus)
        return unsubscribe
    }, [])

    return networkStatus
}
