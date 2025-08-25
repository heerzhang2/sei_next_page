"use client"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"

/*报告编制的页面必须登录用户才能进去：能用编辑器不一定有权限改，真要保存后端还会控制权限。
PWA离线模式的情况下：这个控制点就失去意义了，只能事后在java后端控制。
上一级父组件依旧是服务端SSR的情形下：
报告编制状态的，没登录的就必须要先登录，不能匿名浏览
若服务端登陆过期accessToken失效的，登录前后authjs.session-token=会变长了
* */
const ReportMakeable = () => {
    const session = useSession()
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

    useEffect(() => {
        const currentState = `${session.status}-${isClientOnline}-${isOnline}-${isGraphQLBackendReachable}-${hasShownDialog}`

        console.log("[v0] ReportMakeable useEffect triggered", {
            isClientOnline,
            isOnline,
            isGraphQLBackendReachable,
            sessionStatus: session.status,
            hasShownDialog,
            hasAccessToken: !!(session?.data?.user as any)?.accessToken,
            hasUser: !!session?.data?.user,
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
                    const response = await fetch("/api/health", {
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

            if (isClientOnline && isOnline && isGraphQLBackendReachable) {
                if (!(session?.data?.user as any)?.accessToken || !session?.data?.user) {
                    console.log("[v0] ReportMakeable: 需要登录", session)
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
                }
            }

            lastCheckRef.current = currentState
        }, 500)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [session, isClientOnline, isOnline, isGraphQLBackendReachable, hasShownDialog])

    useEffect(() => {
        if (session.status === "authenticated" && (session?.data?.user as any)?.accessToken) {
            console.log("[v0] User authenticated, resetting dialog state")
            setHasShownDialog(false)
            lastCheckRef.current = ""
        }
    }, [session.status, session?.data?.user])

    return <ConfirmDialog />
}

export default ReportMakeable
