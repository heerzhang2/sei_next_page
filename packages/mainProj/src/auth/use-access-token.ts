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
            // refreshToken: authData.refreshToken,
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
    //在nextjs服务器离线模式下的 用户认证信息存储：
    const offlineAuth = useOfflineAuth()
    const networkStatus = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const { showConfirm, ConfirmDialog, hiddenConfirm } = useLoginRedirectConfirm()
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const lastDialogTimeRef = useRef<number>(0)

    useEffect(() => {
        const handleTokenRefresh = async (event: CustomEvent) => {
            console.log("[v0] useAccessToken: 收到token刷新事件accessToken", event.detail?.accessToken)
            const { accessToken, skipUpdate } = event.detail
            if (skipUpdate) {
                console.log("useAccessToken: 跳过session更新（已由refreshAuth处理）")
                return
            }
            if (accessToken) {
                try {
                    const newsession = await update({
                        user: {
                            ...session?.user,
                            accessToken: accessToken,
                        },
                    })
                    console.log("useAccessToken: update更新session",session,"更新后=",newsession)
                } catch (error) {
                    console.error("useAccessToken: NextAuth更新失败", error)
                }
            }
        }
        window.addEventListener("token:refreshed", handleTokenRefresh as EventListener)
        return () => {
            window.removeEventListener("token:refreshed", handleTokenRefresh as EventListener)
        }
    }, [session, update])

    const accessToken = useMemo(() => {
        //必须按网络区分：不能都用session?.user?.accessToken
        if (print || (networkStatus.isOnline)) {
            if (session?.user?.accessToken) {
                return session?.user?.accessToken
            }
        }
        else if (
            !print &&
            !networkStatus.isOnline &&
            networkStatus.isGraphQLBackendReachable
        ) {
            if (offlineAuth.isAuthenticated && offlineAuth.accessToken) {
                return offlineAuth.accessToken
            }
            if(offlineAuth)
                console.log("useAccessToken:不正常没法用offlineAuth",offlineAuth)
        }
        console.log("useAccessToken:=NULL时",networkStatus,session,offlineAuth)
        return null
    },
      [networkStatus.isOnline, networkStatus.isGraphQLBackendReachable, session?.user?.accessToken,
        offlineAuth.isAuthenticated, offlineAuth.accessToken, print]
    )

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
