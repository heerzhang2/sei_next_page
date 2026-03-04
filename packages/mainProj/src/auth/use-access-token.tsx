"use client"

import type React from "react"
import { useMemo, useState, useRef, useEffect } from "react"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { useSearchParams } from "next/navigation"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"
import { useSession } from 'next-auth/react';
import { getCookie } from "cookies-next/client"
import {useNetworkStatusContext} from "@/contexts/network-status-context";
import { withBasePath } from "@/lib/tool";

interface UseAccessTokenReturn {
    accessToken: string | null
    ConfirmDialog: React.ComponentType
}
/**双重保障？ GraphQLProvider里面还会依据Event即可修改发送用的currentTokenRef的。
* */
export function useAccessToken() {
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [user, setUser] = useState<any | null>(null)
    const { update } = useSession()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const networkStatus = useNetworkStatusContext()

    const { showConfirm, ConfirmDialog, hiddenConfirm } = useLoginRedirectConfirm()
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const lastDialogTimeRef = useRef<number>(0)
    // const offlineAuth = useOfflineAuth()

    useEffect(() => {
        const fetchToken = async () => {
            const token = getCookie("accessToken")
            const userData = getCookie("user")
            setAccessToken(token || null)
            setUser(userData ? JSON.parse(userData) : null)
        }

        fetchToken()

        const handleTokenRefreshed = (event: CustomEvent) => {
            console.log("[useAccessToken] 检测到token刷新事件，更新token")
            const { accessToken: newAccessToken, user: newUser } = event.detail
            if (newAccessToken) {
                setAccessToken(newAccessToken)
                setUser(newUser)
                console.log("[useAccessToken] Token已更新为新刷新的token")
            }
        }

        window.addEventListener("token:refreshed", handleTokenRefreshed as EventListener)

        const handleOfflineLogin = (event: CustomEvent) => {
            console.log("[useAccessToken] 检测到离线登录事件，更新token")
            const { accessToken: newAccessToken, user } = event.detail
            if (newAccessToken) {
                setAccessToken(newAccessToken)
                setUser(user)
                console.log("[useAccessToken] Token已更新为新登录的token")
            }
        }

        window.addEventListener("offline:login", handleOfflineLogin as EventListener)

        return () => {
            window.removeEventListener("token:refreshed", handleTokenRefreshed as EventListener)
            window.removeEventListener("offline:login", handleOfflineLogin as EventListener)
        }
    }, [update])

    const shouldShowLoginDialog = useMemo(() => {
        return (
            !print &&
            networkStatus.connectionType !== null &&
            networkStatus.isNextJSServerReachable &&
            networkStatus.isGraphQLBackendReachable &&
            !accessToken
        )
    }, [
        print,
        networkStatus.connectionType,
        networkStatus.isNextJSServerReachable,
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
                        window.location.href = `${withBasePath('/login')}?callbackUrl=${encodeURIComponent(currentPath)}`
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

    return { accessToken, user, ConfirmDialog }
}
