"use client"

import React, { useEffect,  useMemo } from "react"
import { SiteMainbar } from "@/components/site-mainbar"
import { gql, useQuery } from "@urql/next"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

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

export default function HeaderWrapper({ items, children }: HeaderWrapperProps) {
    const { isClientOnline, isGraphQLBackendReachable } = useNetworkStatusContext()
    const requestPolicy = useMemo(() => {
        // 离线模式：完全使用缓存，不发起任何网络请求
        if (!isClientOnline || !isGraphQLBackendReachable) {
            return "cache-only"
        }
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable])
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
