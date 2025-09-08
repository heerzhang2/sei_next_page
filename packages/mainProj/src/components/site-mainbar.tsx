"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, FileText, Home, Settings, User,LogIn, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut, signIn } from "next-auth/react"

interface ReportSidebarProps {
    items?: {
        title: string
        url: string
        icon?: React.ComponentType<{ className?: string }>
    }[]
    children?: React.ReactNode
    userInfo?: {
        name?: string | null
    }
}

/**主菜单区域的
 * 没法添加repId参数了：若需要repId的都放入更底下层次的子路由中的独立菜单去做了。
 *@param items: 可以注入，目前是默认的菜单列表。
 * */
export function SiteMainbar({ items = [], children, userInfo }: ReportSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
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
                    url: `/rep/`,
                    icon: Home,
                },
                {
                    title: "报告详情",
                    url: `/rep/SLIDING_JJ/1`,
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

    // 处理导航，禁用自动滚动
    const handleNavigation = React.useCallback(
        (url: string) => {
            setIsOpen(false)
            // 使用 scroll: false 禁用自动滚动行为
            router.push(url, { scroll: false })
        },
        [router],
    )

    return (
        <>
            {/* Trigger button - fixed in the top-left corner */}
            <Button
                ref={triggerRef}
                variant="ghost"
                size="icon"
                className="fixed top-0 md:top-2 left-2 print:hidden z-50 hover:backdrop-blur-0 active:bg-white mix-blend-normal transition-all h-8 w-8 hover:bg-blue-500 hover:scale-110 hover:shadow-lg hover:opacity-100"
                onClick={() => setIsOpen(!isOpen)}
                // 添加 data 属性来标识这是一个固定定位元素
                data-scroll-ignore="true"
            >
                <Menu className="h-3.5 w-3.5 opacity-90" />
                <span className="sr-only">打开报告主菜单</span>
            </Button>

            {/* Overlay - visible on all screen sizes when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                    data-scroll-ignore="true"
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
                data-scroll-ignore="true"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        {/* 客户端 Header 组件 */}
                        <div className="flex items-center">
                            { userInfo?.name?? ''}
                            {(userInfo?.name) ? <Button variant="ghost" size="icon" onClick={() => signOut()}>
                                    <LogOut className="h-4 w-4" />
                                    <span className="sr-only">注销</span>
                                </Button>
                                :
                                <Button variant="ghost" size="icon" className="ml-14"
                                        onClick={() => signIn()}>
                                    <LogIn className="h-4 w-4" />
                                    <span className="sr-only">登录</span>
                                </Button>
                            }
                        </div>
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
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn("w-full justify-start", isActive && "bg-muted font-medium")}
                                        onClick={() => handleNavigation(item.url)}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.title}
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
