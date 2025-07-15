"use client"

import { useState, useEffect } from "react"
import { subscribeToNetworkStatus, getNetworkStatus } from "@/auth/graphql-component"

/**允许报告在网络离线情形下的制作。 不是报告的场景就没有支持这个离线能力。
 * 针对java的graphQL后端; 前端服务器nextjs离线不在这里涉及。
* */
export function useNetworkStatus() {
    const [networkStatus, setNetworkStatus] = useState(getNetworkStatus())

    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkStatus)
        return unsubscribe
    }, [])

    return networkStatus
}
