"use client"

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { SiteMainbar } from "@/components/site-mainbar"
import { gql, useQuery } from "@urql/next"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

// 10分钟缓存时间
const AUTH_QUERY_CACHE_MS = 10 * 60 * 1000

export const AuthCompQuery = gql`
      query AuthCompQuery {
          authUser{
              id,username, authName, person{id,name}
              dep{id name} office{id name} 
              unit{id name dvs{id name} }
              ispUnits{id,unit{id,name}}
              authorities{ name}
           }
      }
`

interface HeaderWrapperProps {
    items?: {
        title: string
        url: string
        icon?: React.ComponentType<{ className?: string }>
    }[]
    children?: React.ReactNode
}

const AUTH_QUERY_TIME_KEY = "lastAuthQueryTime"
const AUTH_FORCE_REFRESH_KEY = "authForceRefresh"
const AUTH_USERNAME_KEY = "authUsername"

export default function HeaderWrapper({ items, children }: HeaderWrapperProps) {
    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()
    // 用于强制重新计算 requestPolicy
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    // 使用 ref 缓存 requestPolicy，避免网络状态变化时重复计算
    const requestPolicyRef = useRef<"cache-only" | "cache-first" | "cache-and-network" | "network-only">("cache-and-network")
    // 标记是否已经初始化过 requestPolicy
    const isInitializedRef = useRef(false)

    const getLastAuthQueryTime = () => {
        if (typeof window === "undefined") return 0
        const stored = sessionStorage.getItem(AUTH_QUERY_TIME_KEY)
        return stored ? parseInt(stored, 10) : 0
    }

    const setLastAuthQueryTime = (time: number) => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(AUTH_QUERY_TIME_KEY, time.toString())
        }
    }

    const requestPolicy = useMemo(() => {
        // 离线模式：完全使用缓存，不发起任何网络请求
        if (!isClientOnline || !isGraphQLBackendReachable) {
            requestPolicyRef.current = "cache-only"
            return "cache-only"
        }

        // 检查是否需要强制刷新（登录后）
        if (typeof window !== "undefined") {
            const forceRefresh = sessionStorage.getItem(AUTH_FORCE_REFRESH_KEY)
            if (forceRefresh === "true") {
                console.log("[HeaderWrapper] 检测到强制刷新标志，使用 network-only")
                sessionStorage.removeItem(AUTH_FORCE_REFRESH_KEY)
                requestPolicyRef.current = "network-only"
                return "network-only"
            }
        }

        // 如果已经初始化过，且当前是 cache-only，保持 cache-only 避免重复请求
        if (isInitializedRef.current && requestPolicyRef.current === "cache-only") {
            return "cache-only"
        }

        // GraphQL 在线时：10分钟内使用缓存，避免重复请求
        const now = Date.now()
        const lastTime = getLastAuthQueryTime()
        if (now - lastTime < AUTH_QUERY_CACHE_MS) {
            console.log("[HeaderWrapper] 10分钟内已发送过AuthCompQuery，使用缓存优先")
            // 10分钟内有缓存记录，直接使用 cache-only，完全不发起请求
            // 这样可以避免在 Next.js 离线时重复请求
            isInitializedRef.current = true
            requestPolicyRef.current = "cache-only"
            return "cache-only"
        }
        
        isInitializedRef.current = true
        requestPolicyRef.current = "cache-and-network"
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable, refreshTrigger])

    // 不使用 pause: true，因为 requestPolicy 已经处理了缓存策略
    // pause: true 会阻止缓存读取，使用 cache-only 策略可以让 URQL 从缓存中读取数据
    const [result, reexecuteQuery] = useQuery({
        query: AuthCompQuery,
        variables: {},
        requestPolicy,
    })

    // 在收到合法响应数据后才设置时间标志和用户名
    useEffect(() => {
        const { data, error, fetching } = result

        // 只有在没有错误、有数据且不在 fetching 中时才设置时间标志
        if (!error && data?.authUser && !fetching) {
            const now = Date.now()
            // 只要有数据就更新时间标志，确保下次使用缓存
            // 不再检查时间差，因为需要确保时间戳反映最后一次成功获取数据的时间
            console.log("[HeaderWrapper] 收到合法响应数据，设置时间标志")
            setLastAuthQueryTime(now)
            
            // 保存用户名到 sessionStorage，用于离线时显示
            if (data.authUser.username && typeof window !== "undefined") {
                sessionStorage.setItem(AUTH_USERNAME_KEY, data.authUser.username)
                console.log("[HeaderWrapper] 保存用户名到 sessionStorage:", data.authUser.username)
            }
        }
    }, [result])

    useEffect(() => {
        const handleLogout = () => {
            console.log("[v0] HeaderWrapper detected logout, refetching query")
            // 清除保存的用户名
            if (typeof window !== "undefined") {
                sessionStorage.removeItem(AUTH_USERNAME_KEY)
            }
            reexecuteQuery({ requestPolicy: "network-only" })
        }

        const handleLogin = () => {
            console.log("[HeaderWrapper] 检测到登录成功，设置强制刷新标志")
            // 设置强制刷新标志，下次组件渲染时会使用 network-only
            if (typeof window !== "undefined") {
                sessionStorage.setItem(AUTH_FORCE_REFRESH_KEY, "true")
                sessionStorage.removeItem(AUTH_QUERY_TIME_KEY)
                // 清除之前保存的用户名，强制重新获取
                sessionStorage.removeItem(AUTH_USERNAME_KEY)
            }
            // 触发重新渲染以重新计算 requestPolicy
            setRefreshTrigger(prev => prev + 1)
        }

        window.addEventListener("user:logout", handleLogout)
        window.addEventListener("offline:logout", handleLogout)
        window.addEventListener("user:login", handleLogin)

        return () => {
            window.removeEventListener("user:logout", handleLogout)
            window.removeEventListener("offline:logout", handleLogout)
            window.removeEventListener("user:login", handleLogin)
        }
    }, [reexecuteQuery])

    const { authUser } = result?.data || {}
    
    // 获取用户名：优先使用查询结果，如果没有则尝试从 sessionStorage 恢复
    const getUsername = () => {
        if (authUser?.username) {
            return authUser.username
        }
        // 当查询结果没有用户名时（可能是 cache-only 无缓存，或正在加载），尝试从 sessionStorage 恢复
        if (typeof window !== "undefined") {
            const savedUsername = sessionStorage.getItem(AUTH_USERNAME_KEY)
            if (savedUsername) {
                console.log("[HeaderWrapper] 从 sessionStorage 恢复用户名:", savedUsername)
                return savedUsername
            }
        }
        return undefined
    }
    
    const userInfo = { name: getUsername() }
    return (
        <SiteMainbar items={items} userInfo={userInfo}>
            {children}
        </SiteMainbar>
    )
}
