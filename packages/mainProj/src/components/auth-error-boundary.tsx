"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import {useSearchParams} from "next/navigation";

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const networkStatus = useNetworkStatus()
    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")

    useEffect(() => {
        // 检查是否有认证错误
        if ((session as any)?.error === "RefreshAccessTokenError") {
            console.log("Auth error detected, checking network status...")

            if (!networkStatus.isClientOnline) {
                console.log("Client is offline, not signing out")
                toast.warning("离线模式", {
                    description: "当前处于离线状态，使用缓存数据继续操作。",
                    duration: 5000,
                })
                return
            }

            if (!networkStatus.isNextJSServerReachable) {
                console.log("Next.js server unreachable, entering offline mode")
                toast.warning("服务器离线", {
                    description: "服务器暂时不可用，已切换到离线模式。",
                    duration: 5000,
                })
                return
            }

            if (!print && networkStatus.isClientOnline && networkStatus.isNextJSServerReachable && networkStatus.isOnline) {
                // 网络正常，确实是认证问题，询问用户是否跳转登录
                console.log("Network confirmed OK, asking user about signing out")
                showConfirm(
                    "登录已过期",
                    "您的登录状态已过期，需要重新登录。是否现在跳转到登录页面？",
                    () => {
                        toast.error("登录已过期", {
                            description: "正在重新登录...",
                            duration: 3000,
                        })
                        setTimeout(() => {
                            signOut({ redirectTo: "/login" })
                        }, 1000)
                    },
                    () => {
                        toast.info("已取消跳转", {
                            description: "您可以继续使用离线功能，或稍后手动登录。",
                            duration: 5000,
                        })
                    },
                )
            } else {
                console.log("Network status not optimal, entering offline mode")
                toast.warning("网络连接不稳定", {
                    description: "已切换到离线模式，使用缓存数据继续操作。",
                    duration: 5000,
                })
            }
        }
    }, [session, networkStatus, showConfirm])

    return (
        <>
            {children}
            <ConfirmDialog />
        </>
    )
}
