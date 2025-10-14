"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useMemo, useState, useRef, useEffect } from "react"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { useSearchParams } from "next/navigation"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

// 存储离线认证信息
const storeOfflineAuth = (authData: any) => {
    if (typeof window === "undefined") return
    // 存储到localStorage
    localStorage.setItem(
        "offline_auth",
        JSON.stringify({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            user: authData.user,
            timestamp: Date.now(),
            expiresAt: Date.now() + 15 * 24 * 60 * 60 * 1000,
        }),
    )
}

interface UseAccessTokenReturn {
    accessToken: string | null
    ConfirmDialog: React.ComponentType
}

export function useAccessToken(): UseAccessTokenReturn {
    const { data: session, update } = useSession()
    const offlineAuth = useOfflineAuth()
    const networkStatus = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")

    const { showConfirm, ConfirmDialog, hiddenConfirm } = useLoginRedirectConfirm()
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const lastDialogTimeRef = useRef<number>(0)

    const [freshToken, setFreshToken] = useState<string | null>(null)
    const freshTokenTimeRef = useRef<number>(0)
    const [offlineTokenRepl, setOfflineTokenRepl] = useState(false)

    useEffect(() => {
        const handleTokenRefresh = async (event: CustomEvent) => {
            console.log("[v0] useAccessToken: 收到token刷新事件accessToken", event.detail?.accessToken)
            const { accessToken, skipUpdate } = event.detail

            if (skipUpdate) {
                console.log("[v0] useAccessToken: 跳过session更新（已由refreshAuth处理）")
                if (accessToken) {
                    setFreshToken(accessToken)
                    freshTokenTimeRef.current = Date.now()
                    setTimeout(
                        () => {
                            setFreshToken(null)
                        },
                        5 * 60 * 1000,
                    )
                }
                return
            }

            if (accessToken) {
                setFreshToken(accessToken)
                freshTokenTimeRef.current = Date.now()

                try {
                    const newsession = await update({
                        user: {
                            ...session?.user,
                            accessToken: accessToken,
                        },
                    })
                    console.log("useAccessToken: update更新newsession", newsession)
                } catch (error) {
                    console.error("useAccessToken: NextAuth更新失败", error)
                }

                setTimeout(
                    () => {
                        setFreshToken(null)
                    },
                    5 * 60 * 1000,
                )
            } else {
                setOfflineTokenRepl(true)
            }
        }

        window.addEventListener("token:refreshed", handleTokenRefresh as EventListener)
        return () => {
            window.removeEventListener("token:refreshed", handleTokenRefresh as EventListener)
        }
    }, [session, update]) // Updated dependency to session

    const accessToken = useMemo(() => {
        if (freshToken && Date.now() - freshTokenTimeRef.current < 5 * 60 * 1000) {
            console.log("[v0] useAccessToken: 使用刚刷新的freshToken=", freshToken)
            return freshToken
        }
        if (offlineTokenRepl) {
            if (session?.user) {
                const user = { id: session?.user?.id }
                const authData = {
                    accessToken: session?.user?.accessToken,
                    refreshToken: session?.user?.refreshToken,
                    user: user,
                }
                storeOfflineAuth(authData)
                setOfflineTokenRepl(false)
                console.log("更新离线TOKEN事件=?NEW=用offlineTokenRepl token authData", authData, "session", session)
                return authData.accessToken
            }
            setOfflineTokenRepl(false)
        }
        if (networkStatus.isOnline && session?.user?.accessToken) {
            // console.log("[v0] useAccessToken: 使用NextAuth token", session)
            return session?.user?.accessToken
        }

        if (offlineAuth.isAuthenticated && offlineAuth.accessToken) {
            // console.log("[v0] useAccessToken: 使用离线认证token作为备选")
            return offlineAuth.accessToken
        }
        return null
    }, [session, networkStatus, freshToken, offlineTokenRepl, print, offlineAuth]) // Updated dependency to session

    const shouldShowLoginDialog = useMemo(() => {
        return (
            !print &&
            networkStatus.connectionType !== null &&
            networkStatus.isOnline &&
            networkStatus.isGraphQLBackendReachable &&
            !accessToken
        )
    }, [
        print,
        networkStatus.connectionType,
        networkStatus.isOnline,
        networkStatus.isGraphQLBackendReachable,
        accessToken,
    ])

    useEffect(() => {
        if (shouldShowLoginDialog) {
            const now = Date.now()
            const twentyMinutes = 20 * 60 * 1000
            if (!hasShownDialog || now - lastDialogTimeRef.current > twentyMinutes) {
                console.log("应该增加跳转登录: 无可用token", {
                    old: lastDialogTimeRef.current,
                    passedminute: now - lastDialogTimeRef.current,
                    overtime: now - lastDialogTimeRef.current > twentyMinutes,
                })
                setHasShownDialog(true)
                lastDialogTimeRef.current = now
                showConfirm(
                    "需要登录",
                    "当前功能需要登录后才能使用。是否现在跳转到登录页面？accessToken",
                    () => {
                        const currentPath = window.location.pathname + window.location.search
                        window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`
                    },
                    () => {
                        toast.info("已取消登录", {
                            description: "您可以继续浏览，但部分功能可能无法使用。",
                            duration: 5000,
                        })
                    },
                )
            } else hiddenConfirm()
        } else hiddenConfirm()
    }, [shouldShowLoginDialog, hasShownDialog, showConfirm])

    return {
        accessToken,
        ConfirmDialog,
    }
}
