"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function AuthStatus() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>认证状态</CardTitle>
                    <CardDescription>正在加载...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (status === "unauthenticated" || !session?.user) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>认证状态</CardTitle>
                    <CardDescription>未登录</CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge variant="destructive">未认证</Badge>
                    <p className="text-sm text-muted-foreground mt-2">请登录以访问受保护的资源</p>
                </CardContent>
            </Card>
        )
    }

    const hasError = (session as any).error === "RefreshAccessTokenError"
    const tokenExpires = session.user.accessTokenExpires
    const isTokenExpired = tokenExpires && Date.now() > tokenExpires
    const timeUntilExpiry = tokenExpires ? Math.max(0, tokenExpires - Date.now()) : 0
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60))

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>认证状态</CardTitle>
                <CardDescription>当前登录信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">状态:</span>
                    <Badge variant={hasError ? "destructive" : "default"}>{hasError ? "Token 错误" : "已认证"}</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">用户:</span>
                        <span className="text-sm">{session.user.name || session.user.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">用户ID:</span>
                        <span className="text-sm font-mono">{session.user.id}</span>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Token 状态:</span>
                        <Badge variant={isTokenExpired ? "destructive" : "secondary"}>{isTokenExpired ? "已过期" : "有效"}</Badge>
                    </div>

                    {!isTokenExpired && tokenExpires && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">剩余时间:</span>
                            <span className="text-sm">{minutesUntilExpiry > 0 ? `${minutesUntilExpiry} 分钟` : "即将过期"}</span>
                        </div>
                    )}
                </div>

                {hasError && (
                    <>
                        <Separator />
                        <div className="p-3 bg-destructive/10 rounded-md">
                            <p className="text-sm text-destructive">Token 刷新失败，请重新登录</p>
                        </div>
                    </>
                )}

                <Separator />

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                        刷新页面
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                        退出登录
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
