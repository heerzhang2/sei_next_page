'use client'

import { useSession } from "next-auth/react"

export function useAccessToken() {
    //若在服务端调用useSession：就报错！
    const { data: session } = useSession()
    const accessToken = (session?.user as any)?.accessToken

    // useEffect(() => {
    //     if (accessToken) {
    //         // 将令牌存储在Cookie中，设置适当的过期时间和安全选项
    //         Cookies.set('token', accessToken, {
    //             secure: true,
    //             sameSite: 'strict',
    //             // 设置合理的过期时间，比如比token过期时间短一些
    //             expires: 1 // 1天
    //         })
    //     }
    // }, [accessToken])

    return accessToken
}
