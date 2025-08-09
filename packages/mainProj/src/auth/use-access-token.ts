"use client"

import { useSession } from "next-auth/react"

export function useAccessToken(): string | null {
    const { data: session } = useSession()

    // 从 session 中获取 accessToken
    return session?.user?.accessToken || null
}
