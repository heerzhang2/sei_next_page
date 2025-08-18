"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { useNetworkStatus } from "@/hooks/use-network-status"

/*必须登录用户，否则不能用
【客户端浏览器】情形下的：
* */
const UserLogined = () => {
    const [isClient, setIsClient] = useState(false)
    const { data: session, status } = useSession()
    const networkStatus = useNetworkStatus()

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null

    // 如果网络离线或服务器不可达，跳过认证检查
    if (!networkStatus.isOnline || !networkStatus.isNextJSServerReachable) {
        console.log("UserLogined: 离线模式或服务器不可达，跳过认证检查")
        return null
    }

    // 如果session正在加载，等待
    if (status === "loading") {
        return null
    }

    if (!session?.user || !session?.user?.accessToken) {
        console.log("UserLogined: 跳转login", session)
        redirect("/login")
    }

    return null
}

export default UserLogined
