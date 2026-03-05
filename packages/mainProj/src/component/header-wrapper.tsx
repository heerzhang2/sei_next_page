"use client"

import type React from "react"
import { SiteMainbar } from "@/components/site-mainbar"
import { gql, useQuery } from "@urql/next"
import { useEffect } from "react"

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
    const [result, reexecuteQuery] = useQuery({
        query: AuthCompQuery,
        variables: {},
        requestPolicy: "cache-first",
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
