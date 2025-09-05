"use client"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { toast } from "sonner"

/*报告编制的页面必须登录用户才能进去：能用编辑器不一定有权限改，真要保存后端还会控制权限。
PWA离线模式的情况下：这个控制点就失去意义了，只能事后在java后端控制。
上一级父组件依旧是服务端SSR的情形下：
报告编制状态的，没登录的就必须要先登录，不能匿名浏览
若服务端登陆过期accessToken失效的，登录前后authjs.session-token=会变长了
* */
const ReportMakeable = () => {
    const session = useSession()
    const offlineAuth = useOfflineAuth()
    const searchParams = useSearchParams()
    const [make, setMake] = useState(false)
    const [hasShownDialog, setHasShownDialog] = useState(false)
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatus()
    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastCheckRef = useRef<string>("")

    useEffect(() => {
        const make = searchParams.get("make")
        setMake(!!make)
    }, [searchParams])
    //数据结构是： session?.data.{ user:{token s} }
    useEffect(() => {
        const currentState = `${session.status}-${isClientOnline}-${isOnline}-${isGraphQLBackendReachable}-${hasShownDialog}-${offlineAuth.isAuthenticated}-${offlineAuth.isExpired}`

        console.log("ReportMakeable跟踪", {
            isClientOnline,
            isOnline,
            isGraphQLBackendReachable,
            sessionStatus: session.status,
            hasShownDialog,
            hasAccessToken: !!((session?.data?.user)?.accessToken),
            hasUser: !!session?.data?.user,
            offlineAuthStatus: {
                isAuthenticated: offlineAuth.isAuthenticated,
                isExpired: offlineAuth.isExpired,
                hasUser: !!offlineAuth.user,
            },
            currentState,
            lastState: lastCheckRef.current,
        })

        if (currentState === lastCheckRef.current) {
            console.log("[v0] State unchanged, skipping")
            return
        }

        if (hasShownDialog) {
            console.log("[v0] Dialog already shown, skipping")
            return
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(async () => {
            console.log("[v0] Debounced check executing")

            if (session.status === "unauthenticated") {
                console.log("[v0] Session unauthenticated, double-checking network status")

                try {
                    const response = await fetch("/api/nextLive", {
                        method: "GET",
                        cache: "no-cache",
                        signal: AbortSignal.timeout(3000),
                    })

                    if (!response.ok) {
                        console.log("[v0] Health check failed, server is offline")
                        lastCheckRef.current = currentState
                        return
                    }
                } catch (error) {
                    console.log("[v0] Health check error, server is offline:", error)
                    lastCheckRef.current = currentState
                    return
                }
            }

            const hasNextAuthSession =!!((session?.data?.user)?.accessToken)
            const hasOfflineAuth = offlineAuth.isAuthenticated && !offlineAuth.isExpired

            if (isClientOnline && isGraphQLBackendReachable) {
                if (!hasNextAuthSession && !hasOfflineAuth) {
                    console.log("[v0] ReportMakeable: 需要登录", { session, offlineAuth })
                    setHasShownDialog(true)
                    showConfirm(
                        "需要登录",
                        "报告编制功能需要登录后才能使用。是否现在跳转到登录页面？",
                        () => {
                            console.log("[v0] User confirmed login redirect")
                            window.location.href = "/login"
                        },
                        () => {
                            console.log("[v0] User cancelled login redirect")
                            toast.info("已取消登录", {
                                description: "您可以继续浏览，但无法使用编制功能。",
                                duration: 5000,
                            })
                        },
                    )
                } else if (hasOfflineAuth && !hasNextAuthSession) {
                    console.log("[v0] ReportMakeable: 使用离线认证状态")
                }
            }

            lastCheckRef.current = currentState
        }, 500)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [session, offlineAuth, isClientOnline, isOnline, isGraphQLBackendReachable, hasShownDialog])

    useEffect(() => {
        const hasNextAuthSession = session.status === "authenticated" && (session?.data?.user)?.accessToken
        const hasOfflineAuth = offlineAuth.isAuthenticated && !offlineAuth.isExpired

        if (hasNextAuthSession || hasOfflineAuth) {
            console.log("[v0] User authenticated (NextAuth or offline), resetting dialog state")
            setHasShownDialog(false)
            lastCheckRef.current = ""
        }
    }, [session.status, session?.data?.user, offlineAuth.isAuthenticated, offlineAuth.isExpired])

    return <ConfirmDialog />
}

export default ReportMakeable
