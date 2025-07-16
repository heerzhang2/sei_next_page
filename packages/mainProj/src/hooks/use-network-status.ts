"use client"

import { useState, useEffect } from "react"
import { subscribeToNetworkStatus, getNetworkStatus } from "@/auth/graphql-component"

/**允许报告在网络离线情形下的制作。 不是报告的场景就没有支持这个离线能力。URQL的离线状态中存储的报告修改能力的配套。
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
