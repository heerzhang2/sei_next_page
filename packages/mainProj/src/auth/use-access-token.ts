"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useMemo, useState, useRef, useEffect } from "react"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useSearchParams } from "next/navigation"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"

interface UseAccessTokenReturn {
    accessToken: string | null
    ConfirmDialog: React.ComponentType
}

export function useAccessToken(): UseAccessTokenReturn {
    const { data: session, update } = useSession()
    const offlineAuth = useOfflineAuth()
    const networkStatus = useNetworkStatus()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")

    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const lastDialogTimeRef = useRef<number>(0)

    const [freshToken, setFreshToken] = useState<string | null>(null)
    const freshTokenTimeRef = useRef<number>(0)

    useEffect(() => {
        const handleTokenRefresh = async (event: CustomEvent) => {
            console.log("[v0] useAccessToken: 收到token刷新事件", event.detail)
            const { accessToken } = event.detail
            if (accessToken) {
                setFreshToken(accessToken)
                freshTokenTimeRef.current = Date.now()

                try {
                    await update({
                        user: {
                            ...session?.user,
                            accessToken: accessToken,
                        },
                    })
                    console.log("[v0] useAccessToken: NextAuth session已更新")
                } catch (error) {
                    console.error("[v0] useAccessToken: 更新NextAuth session失败", error)
                }

                setTimeout(
                    () => {
                        setFreshToken(null)
                    },
                    5 * 60 * 1000,
                )
            }
        }

        window.addEventListener("token:refreshed", handleTokenRefresh as EventListener)
        return () => {
            window.removeEventListener("token:refreshed", handleTokenRefresh as EventListener)
        }
    }, [session?.user, update])

    const accessToken = useMemo(() => {
        if (freshToken && Date.now() - freshTokenTimeRef.current < 5 * 60 * 1000) {
            console.log("[v0] useAccessToken: 使用刚刷新的token")
            return freshToken
        }

        if (networkStatus.isOnline && session?.user?.accessToken) {
            console.log("[v0] useAccessToken: 使用NextAuth token")
            return session?.user?.accessToken
        }

        if (offlineAuth.isAuthenticated && offlineAuth.accessToken) {
            console.log("[v0] useAccessToken: 使用离线认证token作为备选")
            return offlineAuth.accessToken
        }

        console.log("[v0] useAccessToken: 无可用token", networkStatus)
        if (
            !print &&
            networkStatus.connectionType !== null &&
            networkStatus.isOnline &&
            networkStatus.isGraphQLBackendReachable
        ) {
            const now = Date.now()
            const twentyMinutes = 20 * 60 * 1000

            if (!hasShownDialog || now - lastDialogTimeRef.current > twentyMinutes) {
                console.log("应该增加跳转登录: 无可用token")
                setHasShownDialog(true)
                lastDialogTimeRef.current = now

                showConfirm(
                    "需要登录",
                    "当前功能需要登录后才能使用。是否现在跳转到登录页面？",
                    () => {
                        console.log("[v0] User confirmed login redirect")
                        window.location.href = "/login"
                    },
                    () => {
                        console.log("[v0] User cancelled login redirect")
                        toast.info("已取消登录", {
                            description: "您可以继续浏览，但部分功能可能无法使用。",
                            duration: 5000,
                        })
                    },
                )
            }
        }
        return null
    }, [session?.user, networkStatus, print, offlineAuth, showConfirm, hasShownDialog, freshToken])

    return {
        accessToken,
        ConfirmDialog,
    }
}
