"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthStatus() {
    const { data: session } = useSession()
    const router = useRouter()
    console.log("AuthStatus: session=", session);
    //interface DefaultSession {
    //   user?: User
    //   expires: ISODateString
    // }        没有error字段？
    useEffect(() => {
        if(!session || (session as any)?.error === "RefreshAccessTokenError") {
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
            Access Token: {session.accessToken?.slice(0, 20)}..AuthStatus不能随便加，必须登录用户产能访问
        </div>
    )
}
