"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, FileText, Home, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
    const [isOpen, setIsOpen] = React.useState(false)
    const sidebarRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

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

    // Handle clicks outside the sidebar to close it
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <>
            {/* Trigger button - fixed in the top-left corner */}
            <Button
                ref={triggerRef}
                variant="ghost"
                size="icon"
                className="fixed top-2 left-2 z-50 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
            </Button>

            {/* Overlay - visible on all screen sizes when sidebar is open */}
            {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">报告菜单</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-2">
                        <div className="space-y-1">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon || FileText
                                const isActive = pathname === item.url

                                return (
                                    <Button
                                        key={index}
                                        asChild
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn("w-full justify-start", isActive && "bg-muted font-medium")}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link href={item.url}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </Button>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Additional content */}
                    {children && <div className="p-4 border-t">{children}</div>}
                </div>
            </div>
        </>
    )
}
