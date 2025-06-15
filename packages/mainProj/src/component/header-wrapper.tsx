import type React from "react"
import { auth } from "@/app/auth"
import {SiteMainbar} from "@/components/site-mainbar";

export const dynamic = "force-dynamic"

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

  return (
    <SiteMainbar items={items} userInfo={{ name: session?.user?.name }}>
      {children}
    </SiteMainbar>
  )
}
