"use client"

import { useEffect, useRef, useState } from "react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useOfflineAuth, type OfflineAuthData } from "@/hooks/use-offline-auth"

/**
 * 将离线认证数据转换为 session 格式
 */
function convertToSession(authData: OfflineAuthData) {
    const expiresAt = authData.expiresAt
    return {
        user: {
            id: authData.user.id,
            name: authData.user.name,
            email: authData.user.email,
            image: undefined,
        },
        expires: new Date(expiresAt).toISOString(),
        accessToken: authData.accessToken,
    }
}

/**
 * OfflineSessionPatcher 组件
 * 
 * 在 Next.js 服务器离线时，拦截 NextAuth 的 /api/auth/session 请求，
 * 返回缓存的离线认证数据，避免 502 错误导致的 JSON 解析失败
 */
export function OfflineSessionPatcher() {
    const { isNextJSServerReachable } = useNetworkStatusContext()
    const { isAuthenticated, user, accessToken, isExpired } = useOfflineAuth()
    const isPatchedRef = useRef(false)
    const [cachedAuth, setCachedAuth] = useState<OfflineAuthData | null>(null)

    // 缓存离线认证数据，避免依赖项变化时丢失
    useEffect(() => {
        if (isAuthenticated && !isExpired && user && accessToken) {
            setCachedAuth({
                accessToken,
                user,
                timestamp: Date.now(),
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                fromNextjs: false,
            })
        }
    }, [isAuthenticated, isExpired, user, accessToken])

    useEffect(() => {
        // 避免重复 patch
        if (isPatchedRef.current) return

        // 只有在服务器离线且有缓存的离线认证时才进行 patch
        if (!isNextJSServerReachable && cachedAuth) {
            console.log("[OfflineSessionPatcher] Next.js 服务器离线，注入缓存 session 拦截器")

            const authData = cachedAuth
            const originalFetch = window.fetch
            
            window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
                const url = typeof input === 'string' 
                    ? input 
                    : input instanceof URL 
                        ? input.href 
                        : (input as Request).url
                
                // 拦截 session 请求
                if (url.includes('/api/auth/session')) {
                    console.log("[OfflineSessionPatcher] 拦截 /api/auth/session 请求，返回缓存数据")
                    
                    const session = convertToSession(authData)
                    
                    return new Response(JSON.stringify(session), {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                }
                
                return originalFetch(input, init)
            }

            isPatchedRef.current = true

            // 清理函数
            return () => {
                // 不恢复原始 fetch，因为其他组件可能依赖这个 patch
            }
        }
    }, [isNextJSServerReachable, cachedAuth])

    // 监听网络状态变化
    useEffect(() => {
        const handleNetworkChange = () => {
            console.log("[OfflineSessionPatcher] 网络状态变化")
        }

        window.addEventListener('network:status-changed', handleNetworkChange)
        
        return () => {
            window.removeEventListener('network:status-changed', handleNetworkChange)
        }
    }, [])

    // 服务器恢复在线时的日志
    useEffect(() => {
        if (isNextJSServerReachable && isPatchedRef.current) {
            console.log("[OfflineSessionPatcher] Next.js 服务器已恢复在线")
        }
    }, [isNextJSServerReachable])

    return null
}
