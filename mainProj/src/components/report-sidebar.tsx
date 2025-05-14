"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, FileText, Home, Menu, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

interface ReportSidebarProps {
  repId: string
  items?: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  children?: React.ReactNode
}

export function ReportSidebar({ repId, items = [], children }: ReportSidebarProps) {
  const pathname = usePathname()

  // Default menu items if none provided
  const menuItems =
    items.length > 0
      ? items
      : [
          {
            title: "报告概览",
            url: `/rep/${repId}`,
            icon: Home,
          },
          {
            title: "报告详情",
            url: `/rep/${repId}/SLIDING_JJ/1`,
            icon: FileText,
          },
          {
            title: "用户信息",
            url: `/user`,
            icon: User,
          },
          {
            title: "设置",
            url: `/settings`,
            icon: Settings,
          },
        ]

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="fixed top-2 left-2 z-50">
        <SidebarTrigger className="bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
      </div>

      <Sidebar>
        <SidebarHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">报告菜单</h2>
            <SidebarTrigger className="md:hidden">
              <ChevronRight className="h-4 w-4" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav className="grid gap-1 px-2 py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon || FileText
              const isActive = pathname === item.url

              return (
                <Button
                  key={index}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("justify-start", isActive && "bg-muted font-medium")}
                >
                  <Link href={item.url}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </nav>
          {children}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
