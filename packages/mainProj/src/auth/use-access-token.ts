"use client"

import type React from "react"
import { useMemo, useState, useRef, useEffect } from "react"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { useSearchParams } from "next/navigation"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

interface UseAccessTokenReturn {
    accessToken: string | null
    ConfirmDialog: React.ComponentType
}
/** 避免混乱，
 * 只能统一都 依照localStorage里面的"offline_auth"来读取：
* */
export function useAccessToken(): UseAccessTokenReturn {
    //统一都读用户认证信息存储：
    const offlineAuth = useOfflineAuth()
    const networkStatus = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const { showConfirm, ConfirmDialog, hiddenConfirm } = useLoginRedirectConfirm()
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const lastDialogTimeRef = useRef<number>(0)

    const accessToken = useMemo(() => {
        console.log("useAccessToken:读统一",offlineAuth)
        return offlineAuth.accessToken
    }, [offlineAuth.accessToken])

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
