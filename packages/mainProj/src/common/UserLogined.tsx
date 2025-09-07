"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import {useNetworkStatusContext} from "@/contexts/network-status-context";
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { useOfflineAuth } from "@/hooks/use-offline-auth"
import { toast } from "sonner"

/*必须登录用户，否则不能用
【客户端浏览器】情形下的：
* */
const UserLogined = () => {
    const [isClient, setIsClient] = useState(false)
    const { data: session, status } = useSession()
    const networkStatus = useNetworkStatusContext()
    const offlineAuth = useOfflineAuth()
    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        // 如果网络离线或服务器不可达，跳过认证检查
        if (!networkStatus.isOnline || !networkStatus.isNextJSServerReachable) {
            console.log("UserLogined: 离线模式或服务器不可达，跳过认证检查")
            return
        }

        // 如果session正在加载，等待
        if (status === "loading") {
            return
        }

        const hasNextAuthSession = session?.user?.accessToken
        const hasOfflineAuth = offlineAuth.isAuthenticated && !offlineAuth.isExpired

        if (!hasNextAuthSession && !hasOfflineAuth) {
            console.log("UserLogined: 需要登录", { session, offlineAuth })
            showConfirm(
                "需要登录",
                "此页面需要登录后才能访问。是否现在跳转到登录页面？",
                () => {
                    window.location.href = "/login"
                },
                () => {
                    toast.info("已取消登录", {
                        description: "您可以继续使用离线功能。",
                        duration: 5000,
                    })
                },
            )
        } else if (hasOfflineAuth && !hasNextAuthSession) {
            console.log("UserLogined: 使用离线认证状态")
        }
    }, [isClient, session, status, networkStatus, offlineAuth, showConfirm])

    if (!isClient) return null

    return <ConfirmDialog />
}

export default UserLogined
