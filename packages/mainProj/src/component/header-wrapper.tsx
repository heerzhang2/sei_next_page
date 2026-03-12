"use client"

import React, { useEffect, useMemo } from "react"
import { SiteMainbar } from "@/components/site-mainbar"
import { gql, useQuery } from "@urql/next"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

// 10分钟缓存时间
const AUTH_QUERY_CACHE_MS = 10 * 60 * 1000

export const AuthCompQuery = gql`
      query AuthCompQuery {
          authUser{
              id,username, person{id,name}
              dep{id name} office{id name} 
              unit{id name dvs{id name} }
              ispUnits{id,unit{id,name}}
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

export default function HeaderWrapper({ items, children }: HeaderWrapperProps) {
    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()

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
            return "cache-only"
        }
        // Next.js 离线但 GraphQL 在线：10分钟内使用缓存，避免重复请求
        if (!isNextJSServerReachable && isGraphQLBackendReachable) {
            const now = Date.now()
            const lastTime = getLastAuthQueryTime()
            if (now - lastTime < AUTH_QUERY_CACHE_MS) {
                console.log("[HeaderWrapper] 10分钟内已发送过AuthCompQuery，使用缓存")
                return "cache-only"
            }
            // 标记本次请求时间
            setLastAuthQueryTime(now)
            return "cache-and-network"
        }
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])
    const [result, reexecuteQuery] = useQuery({
        query: AuthCompQuery,
        variables: {},
        requestPolicy,
    })

    useEffect(() => {
        const handleLogout = () => {
            console.log("[v0] HeaderWrapper detected logout, refetching query")
            reexecuteQuery({ requestPolicy: "network-only" })
        }

        window.addEventListener("user:logout", handleLogout)
        window.addEventListener("offline:logout", handleLogout)

        return () => {
            window.removeEventListener("user:logout", handleLogout)
            window.removeEventListener("offline:logout", handleLogout)
        }
    }, [reexecuteQuery])

    const { authUser } = result?.data || {}
    const userInfo = { name: authUser?.username }
    return (
        <SiteMainbar items={items} userInfo={userInfo}>
            {children}
        </SiteMainbar>
    )
}
