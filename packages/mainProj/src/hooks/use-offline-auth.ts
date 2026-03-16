"use client"

import { useState, useEffect, useCallback } from "react"

export interface OfflineAuthData {
    accessToken: string
    user: {
        id: string
        name?: string
        email?: string
    }
    timestamp: number
    expiresAt: number
    fromNextjs: boolean
}

interface OfflineAuthState {
    isAuthenticated: boolean
    user: OfflineAuthData["user"] | null
    accessToken: string | null
    isExpired: boolean
}

export function useOfflineAuth() {
    const [authState, setAuthState] = useState<OfflineAuthState>({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isExpired: false,
    })

    const loadOfflineAuth = useCallback(() => {
        if (typeof window === "undefined") return
        try {
            const stored = localStorage.getItem("offline_auth")
            if (!stored) {
                setAuthState((prev) => ({ ...prev, isAuthenticated: false }))
                return
            }
            const authData: OfflineAuthData = JSON.parse(stored)
            const now = Date.now()
            const isExpired = now > authData.expiresAt
            setAuthState({
                isAuthenticated: !isExpired,
                user: authData.user,
                accessToken: authData.accessToken,
                isExpired,
            })
            if (isExpired) {
                console.log("离线认证已过期")
                localStorage.removeItem("offline_auth")
            }
        } catch (error) {
            console.error("加载离线认证失败:", error)
            localStorage.removeItem("offline_auth")
            setAuthState((prev) => ({ ...prev, isAuthenticated: false }))
        }
    }, [])

    const clearOfflineAuth = useCallback(() => {
        if (typeof window === "undefined") return

        localStorage.removeItem("offline_auth")
        setAuthState({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isExpired: false,
        })

        window.dispatchEvent(new CustomEvent("offline:logout"))
    }, [])

    const updateOfflineAuth = useCallback(
        (authData: Partial<OfflineAuthData>) => {
            if (typeof window === "undefined") return
            try {
                const existing = localStorage.getItem("offline_auth")
                const current = existing ? JSON.parse(existing) : {}

                const { refreshToken, ...safeAuthData } = authData as any

                const updated = {
                    ...current,
                    ...safeAuthData,
                    timestamp: Date.now(),
                }
                localStorage.setItem("offline_auth", JSON.stringify(updated))
                loadOfflineAuth()
            } catch (error) {
                console.error("更新离线认证失败:", error)
            }
        },
        [loadOfflineAuth],
    )

    useEffect(() => {
        loadOfflineAuth()

        const handleOfflineLogin = (event: CustomEvent) => {
            console.log("检测到离线登录事件")
            loadOfflineAuth()
        }

        const handleOfflineLogout = () => {
            console.log("检测到离线登出事件")
            setAuthState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
                isExpired: false,
            })
        }

        const handleTokenRefresh = (event: CustomEvent) => {
            console.log("检测到token刷新事件")
            updateOfflineAuth({
                accessToken: event.detail.accessToken,
                user: event.detail.user,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                fromNextjs: event.detail.fromNextjs,
            } as Partial<OfflineAuthData>)
        }

        window.addEventListener("offline:login", handleOfflineLogin as EventListener)
        window.addEventListener("offline:logout", handleOfflineLogout)
        window.addEventListener("token:refreshed", handleTokenRefresh as EventListener)

        return () => {
            window.removeEventListener("offline:login", handleOfflineLogin as EventListener)
            window.removeEventListener("offline:logout", handleOfflineLogout)
            window.removeEventListener("token:refreshed", handleTokenRefresh as EventListener)
        }
    }, [loadOfflineAuth, updateOfflineAuth])

    return {
        ...authState,
        clearOfflineAuth,
        updateOfflineAuth,
        loadOfflineAuth,
    }
}
