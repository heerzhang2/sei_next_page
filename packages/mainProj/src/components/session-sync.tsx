"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

/**
 * SessionSync component listens to token refresh events and updates next-auth session
 * This bridges the gap between urql's token refresh and next-auth's session management
 */
export function SessionSync() {
    const { update } = useSession()

    useEffect(() => {
        const handleTokenRefresh = async (event: Event) => {
            const customEvent = event as CustomEvent
            const { accessToken, refreshToken, user, skipUpdate } = customEvent.detail || {}

            // Skip if explicitly told to skip (to prevent loops)
            if (skipUpdate) {
                console.log("[SessionSync] 跳过session更新 (skipUpdate=true)")
                return
            }

            if (accessToken) {
                try {
                    console.log("[SessionSync] 收到token:refreshed事件，更新next-auth session")
                    await update({
                        accessToken,
                        refreshToken,
                        user,
                    })
                    console.log("[SessionSync] next-auth session已更新")
                } catch (error) {
                    console.error("[SessionSync] 更新next-auth session失败:", error)
                }
            }
        }

        window.addEventListener("token:refreshed", handleTokenRefresh)

        return () => {
            window.removeEventListener("token:refreshed", handleTokenRefresh)
        }
    }, [update])

    return null // This component doesn't render anything
}
