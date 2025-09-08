import type React from "react"
import { auth } from "@/app/auth"
import {SiteMainbar} from "@/components/site-mainbar";
import {redirect} from "next/navigation";
import {gql, useQuery} from "@urql/next";
import {ReportQuery} from "@/component/rep/report-data";

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

//这若用async服务器组件const session = await auth()，有毛病，SSR看到session?.user都是空的，而且只有浏览器硬性刷新才会再执行的。
export default async function HeaderWrapper({ items, children }: HeaderWrapperProps) {
  const session = await auth()
  const [result, ] = useQuery({
    query: AuthCompQuery,
    variables: {},
    requestPolicy: 'cache-first',
  })
  const userInfo=(!session?.user || !session?.user?.accessToken) ?
              undefined
          : { name: session?.user?.name };

  console.log("HeaderWrapper看到的登录是", { userInfo, result })
  return (
    <SiteMainbar items={items} userInfo={userInfo}>
      {children}
    </SiteMainbar>
  )
}
