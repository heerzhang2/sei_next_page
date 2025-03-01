"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthStatus() {
    const { data: session } = useSession()
    const router = useRouter()
    console.log("AuthStatus: session=", session);
    useEffect(() => {
        if(!session || session?.error === "RefreshAccessTokenError") {
           //SSR服务端报错之后，需要最终在客户端 重新登录
            router.push("/api/auth/signout")
        }
    }, [session, router])

    if (!session) {
        return <div>@-#     Not signed in  -未登录？</div>
    }

    return (
        <div>
            @-#  Signed in as {session.user?.email}
            Access Token: {session.accessToken?.slice(0, 20)}...全局的页眉未工具条
        </div>
    )
}
