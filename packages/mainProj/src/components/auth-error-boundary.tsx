"use client"

import type React from "react"

import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()

    useEffect(() => {
        // 检查是否有认证错误
        if ((session as any)?.error === "RefreshAccessTokenError") {
            console.log("Auth error detected, signing out...")

            toast.error("登录已过期", {
                description: "正在重新登录...",
                duration: 3000,
            })

            // 延迟登出，给用户看到提示的时间
            setTimeout(() => {
                signOut({ callbackUrl: "/login" })
            }, 2000)
        }
    }, [session])

    return <>{children}</>
}
