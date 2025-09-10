"use client"

import type React from "react"
import {SiteMainbar} from "@/components/site-mainbar";
import {gql, useQuery} from "@urql/next";

// export const dynamic = "force-dynamic"
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

//这若用async服务器组件const session = await auth()，有毛病，SSR看到session?.user是空的，而且只有浏览器硬性刷新才会再执行HeaderWrapper的。
export default function HeaderWrapper({ items, children }: HeaderWrapperProps) {
  //改成在客户端做查询了，不是SSR做了。
  const [result, ] = useQuery({
    query: AuthCompQuery,
    variables: {},
    requestPolicy: 'cache-first',
  })
  const { authUser }=result?.data || {};
  const userInfo={ name: authUser?.username };
  console.log("HeaderWrapper看到的登录是", { userInfo, authUser })
  return (
    <SiteMainbar items={items} userInfo={userInfo}>
      {children}
    </SiteMainbar>
  )
}
