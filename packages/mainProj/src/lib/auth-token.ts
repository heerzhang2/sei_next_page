import { toast } from "sonner"
import { withBasePath } from "@/lib/tool"
// import { getSession } from 'next-auth/react';
// import {useSession} from "next-auth/react";
//只能在浏览器端用的： 获取令牌的函数
export async function getAuthToken() {
    if (typeof window !== "undefined") {
        try {
          //不管nextjs服务器时候离线的，都需要把accessToken放入localStorage这里的！
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
            window.location.href = withBasePath("/login")
            return null
          }
        } catch (error) {
            console.error("[getAuthToken]失败:", error)
        }
    }
    //备用的做法:  【nextjs服务器离线之后】这个session实际=空的！
    // const session = await getSession()
}
