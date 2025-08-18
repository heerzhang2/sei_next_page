import { redirect } from "next/navigation"
import { auth } from "@/app/auth"
import { headers } from "next/headers"

/*必须登录用户，否则不能用
【服务端SSR】情形下的：
* */
const UserAuthed = async () => {
    const headersList = headers()
    const isOfflineMode = headersList.get("x-offline-mode") === "true"
    const isOfflineFallback = headersList.get("x-offline-fallback") === "true"
    const userAgent = headersList.get("user-agent") || ""
    const isServiceWorkerRequest = userAgent.includes("ServiceWorker")

    // 如果是离线模式或Service Worker请求，跳过认证检查
    if (isOfflineMode || isOfflineFallback || isServiceWorkerRequest) {
        console.log("UserAuthed: 离线模式检测到，跳过认证检查")
        return null
    }

    try {
        const session = await auth()
        if (!session?.user || !session?.user?.accessToken) {
            try {
                // 尝试快速健康检查
                const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/health`, {
                    method: "HEAD",
                    cache: "no-cache",
                    signal: AbortSignal.timeout(2000), // 2秒超时
                })

                if (!response.ok) {
                    console.log("UserAuthed: 服务器不可用，跳过认证检查")
                    return null
                }
            } catch (error) {
                console.log("UserAuthed: 网络检查失败，跳过认证检查", error)
                return null
            }
            console.log("UserAuthed: 跳转login", session)
            redirect("/login")
        }
    } catch (error) {
        console.error("UserAuthed: 认证检查失败", error)
        return null
    }

    return null
}

export default UserAuthed
