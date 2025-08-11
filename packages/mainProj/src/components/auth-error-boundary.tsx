"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import { useNetworkStatus } from "@/hooks/use-network-status"

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const networkStatus = useNetworkStatus()

    useEffect(() => {
        // 检查是否有认证错误
        if ((session as any)?.error === "RefreshAccessTokenError") {
            console.log("Auth error detected, checking network status...")

            // 只有在网络正常的情况下才登出
            if (networkStatus.isOnline) {
                // 再次确认网络连接
                fetch("/api/health", { method: "HEAD", cache: "no-cache" })
                    .then((response) => {
                        if (response.ok) {
                            // 网络正常，确实是认证问题
                            toast.error("登录已过期", {
                                description: "正在重新登录...",
                                duration: 3000,
                            })

                            setTimeout(() => {
                                signOut({ callbackUrl: "/login" })
                            }, 2000)
                        } else {
                            // 服务器有问题，不登出
                            console.log("Server error, not signing out")
                            toast.warning("服务器暂时不可用", {
                                description: "请稍后再试，当前使用缓存数据。",
                                duration: 5000,
                            })
                        }
                    })
                    .catch(() => {
                        // 网络请求失败，不登出
                        console.log("Network error, not signing out")
                        toast.warning("网络连接不稳定", {
                            description: "请检查网络连接，当前使用缓存数据。",
                            duration: 5000,
                        })
                    })
            } else {
                // 离线状态，不登出
                console.log("Offline mode, not signing out")
                toast.warning("离线模式下无法验证登录", {
                    description: "请检查网络连接，或继续离线操作。",
                    duration: 5000,
                })
            }
        }
    }, [session, networkStatus.isOnline])

    return <>{children}</>
}
