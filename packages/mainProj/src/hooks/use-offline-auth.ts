"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineAuthData {
    accessToken: string
    refreshToken: string
    user: {
        id: string
        name?: string
        email?: string
    }
    timestamp: number
    expiresAt: number
}

interface OfflineAuthState {
    isAuthenticated: boolean
    user: OfflineAuthData["user"] | null
    accessToken: string | null
    refreshToken: string | null
    isExpired: boolean
}

export function useOfflineAuth() {
    const [authState, setAuthState] = useState<OfflineAuthState>({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,  //也没用到的
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
                refreshToken: null,     //refreshToken保存在cookie，无法用代码访问的！
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
            refreshToken: null,
            isExpired: false,
        })

        // 触发登出事件
        window.dispatchEvent(new CustomEvent("offline:logout"))
    }, [])

    const updateOfflineAuth = useCallback(
        (authData: Partial<OfflineAuthData>) => {
            if (typeof window === "undefined") return
            try {
                const existing = localStorage.getItem("offline_auth")
                const current = existing ? JSON.parse(existing) : {}
                const updated = {
                    ...current,
                    ...authData,
                    timestamp: Date.now(),
                }
                localStorage.setItem("offline_auth", JSON.stringify(updated))
                loadOfflineAuth()   //重新初始化 内存中的认证状态对象
            } catch (error) {
                console.error("更新离线认证失败:", error)
            }
        },
        [loadOfflineAuth],
    )

    useEffect(() => {
        loadOfflineAuth()

        // 监听离线登录事件
        const handleOfflineLogin = (event: CustomEvent) => {
            console.log("检测到离线登录事件")
            loadOfflineAuth()
        }

        // 监听离线登出事件
        const handleOfflineLogout = () => {
            console.log("检测到离线登出事件")
            setAuthState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
                refreshToken: null,
                isExpired: false,
            })
        }

        // 监听token刷新事件：不管nextjs离线与否两个模式
        const handleTokenRefresh = (event: CustomEvent) => {
            console.log("检测到token刷新事件")
            updateOfflineAuth({
                accessToken: event.detail.accessToken,
                // refreshToken: event.detail.refreshToken,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 重新设置24小时过期
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
