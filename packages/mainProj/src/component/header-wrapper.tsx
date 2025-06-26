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

export default async function HeaderWrapper({ items, children }: HeaderWrapperProps) {
  const session = await auth()
  const userInfo=(!session?.user || !session?.user?.accessToken) ?
          undefined
      : { name: session?.user?.name };
  return (
    <SiteMainbar items={items} userInfo={userInfo}>
      {children}
    </SiteMainbar>
  )
}
