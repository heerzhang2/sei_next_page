//只能在浏览器端用的： 获取令牌的函数
import { getSession } from 'next-auth/react';
// import {useSession} from "next-auth/react";

export async function getAuthToken() {
  const session=await getSession()
  if(session?.user?.accessToken)
    return session?.user?.accessToken;
  if (typeof window !== "undefined") {
    try {
      const offlineAuth = localStorage.getItem("offline_auth")
      if (offlineAuth) {
        const authData = JSON.parse(offlineAuth)
        if (authData.accessToken) {
          return authData.accessToken
        }
        window.location.href = "/login"
        return null
      }
    } catch (error) {
      console.error("[GraphQLProvider] 更新localStorage失败:", error)
    }
  }
}
