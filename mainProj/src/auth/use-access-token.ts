'use client'

import { useSession } from "next-auth/react"

export function useAccessToken() {
    const { data: session } = useSession()
    return session?.user?.accessToken
}