"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useSession } from "next-auth/react"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"

// 离线认证函数
const authenticateOffline = async (username: string, password: string, deviceId: string) => {
    try {
        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        if (!endpoint) throw new Error("Backend endpoint not configured")

        //没有经过URQL直接发送
        const response = await fetch(`${endpoint}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
            },
            credentials: "include", // 关键：允许跨域请求发送和接收cookie
            body: JSON.stringify({
                query: `
          mutation Authenticate($username: String!, $password: String!) {
            authenticate(username: $username, password: $password) {
              accessToken
              refreshToken
              user {
                id
              }
            }
          }
        `,
                variables: { username, password },
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.errors) {
            throw new Error(result.errors[0]?.message || "认证失败")
        }

        if (!result.data?.authenticate) {
            throw new Error("认证失败")
        }

        return result.data.authenticate
    } catch (error) {
        console.error("离线认证失败:", error)
        throw error
    }
}

const AUTH_USERNAME_KEY = "authUsername"

const storeOfflineAuth = (authData: any, username: string) => {
    if (typeof window === "undefined") return
    // 存储到localStorage - 只存储accessToken和user信息，不存储refreshToken
    localStorage.setItem(
        "offline_auth",
        JSON.stringify({
            accessToken: authData.accessToken,
            user: authData.user,
            timestamp: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }),
    )

    // 保存用户名到 sessionStorage，用于离线时显示
    sessionStorage.setItem(AUTH_USERNAME_KEY, username)
    console.log("[OfflineLoginForm] 保存用户名到 sessionStorage:", username)

    // 触发自定义事件通知其他组件
    window.dispatchEvent(
        new CustomEvent("offline:login", {
            detail: authData,
        }),
    )
}

export function OfflineLoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const networkStatus = useNetworkStatusContext()
    const { data: session, update } = useSession()
    const { deviceFingerprint } = useDeviceFingerprint()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // 检查Java后端是否可达
            if (!networkStatus.isGraphQLBackendReachable) {
                throw new Error("无法连接到认证服务器，请检查网络连接")
            }
            const authData = await authenticateOffline(username, password, deviceFingerprint)
            storeOfflineAuth(authData, username)
            try {
                //若是在Nextjs服务器离线情况下：这实际无效，是没法真正修改session的accessToken。
                await update({
                    user: {
                        ...session?.user,
                        accessToken: authData?.accessToken,
                    },
                })
                console.log("OfflineLoginForm:NextAuth session已更新")
            } catch (error) {
                console.error("OfflineLoginForm:更新NextAuth session失败", error)
            }

            window.dispatchEvent(
                new CustomEvent("token:refreshed", {
                    detail: {
                        accessToken: authData.accessToken,
                        user: authData.user,
                        fromNextjs: false,
                    },
                }),
            )
            console.log("[OfflineLoginForm] 已触发token:refreshed事件，refreshToken存储在cookie中")

            // 清空上次查询时间，确保登录后立刻执行权限查询
            sessionStorage.removeItem("lastAuthQueryTime")
            console.log("[OfflineLoginForm] 已清空 lastAuthQueryTime")

            toast.success("Next离线情形下登录,与后端服务器连接", {
                duration: 2000,
            })
            // 跳转到首页
            window.location.href = "/report/"
        } catch (error: any) {
            console.error("离线登录失败:", error)
            toast.error("登录失败", {
                description: error.message || "请检查用户名和密码",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">前端服务离线情况</CardTitle>
                <CardDescription>
                    {networkStatus.isNextJSServerReachable ? "Next.js服务器正常，建议使用标准登录" : "Next.js服务器离线，使用直连后端登录"}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">用户名/邮箱</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="输入用户名"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="password">密码</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={isLoading || !networkStatus.isGraphQLBackendReachable}
                    >
                        {isLoading ? "登录中..." : "离线登录"}
                    </Button>
                    {!networkStatus.isGraphQLBackendReachable && (
                        <p className="text-sm text-red-500 mt-2 text-center">后端服务器不可达，无法进行认证</p>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
