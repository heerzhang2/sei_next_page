import { toast } from "sonner"
import { getSession } from 'next-auth/react';
// import {useSession} from "next-auth/react";

//只能在浏览器端用的： 获取令牌的函数
export async function getAuthToken() {
    if (typeof window !== "undefined") {
        try {
          const offlineAuth = localStorage.getItem("offline_auth")
          if (offlineAuth) {
            const authData = JSON.parse(offlineAuth)
            if (authData.accessToken) {
              console.log("[getAuthToken]获得token1", authData.accessToken)
              return authData.accessToken
            }
            toast.error("登录已失效", {
                description: "您的登录凭证已过期，请重新登录",
                duration: 5000,
            })
            window.location.href = "/login"
            return null
          }
        } catch (error) {
            console.error("[getAuthToken]失败:", error)
        }
    }
    //备用的做法:  【nextjs服务器离线之后】这个session实际=空的！
    const session = await getSession()
    if (session?.user?.accessToken) {
        console.log("[getAuthToken]获得token2", session?.user?.accessToken)
        return session?.user?.accessToken;
    }
}
