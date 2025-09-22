"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useLoginRedirectConfirm } from "@/components/login-redirect-confirm"

export function UserNav() {
    const { data: session } = useSession()
    const { showConfirm, ConfirmDialog } = useLoginRedirectConfirm()

    if (!session?.user) {
        return (
            <Link href="/login">
                <Button variant="outline">{"登录"}</Button>
            </Link>
        )
    }

    const handleSignOut = () => {
        showConfirm("确认退出登录", "您确定要退出登录吗？退出后将跳转到登录页面nav。", () => {
            signOut({ callbackUrl: "/login" })
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user.image || "/avatars/01.png"} alt="@shadcn" />
                            <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            {"个人资料"}
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {"账单"}
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {"设置"}
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>{"新团队"}</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        {"退出"}
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog />
        </>
    )
}
