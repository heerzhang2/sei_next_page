import type React from "react"
import { auth } from "@/app/auth"
import {SiteMainbar} from "@/components/site-mainbar";
import {redirect} from "next/navigation";

// export const dynamic = "force-dynamic"

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
  const userInfo=(!session?.user || !session?.user?.accessToken) ?
              undefined
          : { name: session?.user?.name };

  console.log("HeaderWrapper看到的登录是", { userInfo, items })
  return (
    <SiteMainbar items={items} userInfo={userInfo}>
      {children}
    </SiteMainbar>
  )
}
