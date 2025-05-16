'use client'

import { useSession } from "next-auth/react"

export function useAccessToken() {
    //若在服务端调用useSession：就报错！
    const { data: session } = useSession()
    const accessToken = (session?.user as any)?.accessToken

    return accessToken
}
