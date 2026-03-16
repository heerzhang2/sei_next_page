"use client"

import { useCallback } from "react"
import { signOut } from "next-auth/react"
import { useMutation, gql } from "@urql/next"
import { useOfflineAuth } from "./use-offline-auth"
import { withBasePath } from '@/lib/tool'
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export function useLogout() {
    const [, executeLogout] = useMutation(LOGOUT_MUTATION)
    const { clearOfflineAuth } = useOfflineAuth()

    const logout = useCallback(async () => {
        try {
            console.log("[v0] 开始注销流程")

            try {
                const result = await executeLogout({})
                console.log("[v0] GraphQL logout mutation result:", result)
            } catch (error) {
                console.error("[v0] GraphQL logout mutation failed:", error)
                // Continue with logout even if backend call fails
            }

            clearOfflineAuth()
            console.log("[v0] Cleared offline_auth from localStorage")

            window.dispatchEvent(
                new CustomEvent("auth:logout", {
                    detail: { timestamp: Date.now() },
                }),
            )
            console.log("[v0] Dispatched auth:logout event")

            await signOut({ redirect: false })
            console.log("[v0] Called next-auth signOut")

            window.dispatchEvent(new CustomEvent("user:logout"))
            console.log("[v0] 注销流程完成")

            // Redirect to login page
            window.location.href =withBasePath('/login')
        } catch (error) {
            console.error("[v0] 注销过程出错:", error)
            // Even if there's an error, try to redirect to login
            window.location.href =withBasePath('/login')
        }
    }, [executeLogout, clearOfflineAuth])

    return { logout }
}
