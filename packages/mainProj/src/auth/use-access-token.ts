"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { useNetworkStatus } from "@/hooks/use-network-status"

export function useAccessToken(): string | null {
    const { data: session } = useSession()
    const offlineAuth = useOfflineAuth()
    const networkStatus = useNetworkStatus()

    const accessToken = useMemo(() => {
        // 优先使用NextAuth的token（如果Next.js服务器可达）
        if (networkStatus.isNextJSServerReachable && session?.accessToken) {
            console.log("[v0] useAccessToken: 使用NextAuth token")
            return session.accessToken
        }
        // 如果Next.js服务器不可达但有离线认证，使用离线token
        if (!networkStatus.isNextJSServerReachable && offlineAuth.isAuthenticated && offlineAuth.accessToken) {
            console.log("[v0] useAccessToken: 使用离线认证token")
            return offlineAuth.accessToken
        }
        // 如果都没有，返回null
        console.log("[v0] useAccessToken: 无可用token")
        if(networkStatus.isNextJSServerReachable && networkStatus.isGraphQLBackendReachable){
            //应该增加跳转登录
            console.log("应该增加跳转登录: 无可用token")
        }
        return null
    }, [
        session?.user?.accessToken,
        offlineAuth.isAuthenticated,
        offlineAuth.accessToken,
        networkStatus.isNextJSServerReachable,
    ])

    return accessToken
}
