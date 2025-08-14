"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"

export function useAccessToken(): string | null {
    const { data: session } = useSession()

    // 使用 useMemo 来稳定 accessToken 的引用
    // 只有当实际的 token 值发生变化时才返回新的引用
    const accessToken = useMemo(() => {
        return session?.user?.accessToken || null
    }, [session?.user?.accessToken])

    return accessToken
}
