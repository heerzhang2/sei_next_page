"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"
import { toast } from "sonner"

/*必须登录用户，否则不能用
【客户端浏览器】情形下的：
* */
const UserLogined = () => {
    const [isClient, setIsClient] = useState(false)
    const { data: session, status } = useSession()
    const networkStatus = useNetworkStatus()
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

        if (!session?.user || !session?.user?.accessToken) {
            console.log("UserLogined: 需要登录", session)
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
        }
    }, [isClient, session, status, networkStatus, showConfirm])

    if (!isClient) return null

    return <ConfirmDialog />
}

export default UserLogined
