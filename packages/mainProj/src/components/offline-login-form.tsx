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
import { setCookie, getCookie, deleteCookie } from "cookies-next/client"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"

// 离线认证函数
const authenticateOffline = async (username: string, password: string, deviceId: string) => {
    try {
        // 客户端密码哈希（与服务端保持一致）
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hashBuffer = await crypto.subtle.digest("SHA-256", data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

        const endpoint = process.env.NEXT_PUBLIC_BACK_END
        if (!endpoint) throw new Error("Backend endpoint not configured")
        //没有经过URQL直接发送
        const response = await fetch(`${endpoint}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
            },
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
                variables: { username, password: hashedPassword },
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

// 存储离线认证信息
const storeOfflineAuth = (authData: any, shouldSetCookie = true) => {
    if (typeof window === "undefined") return
    // 存储到localStorage
    localStorage.setItem(
        "offline_auth",
        JSON.stringify({
            accessToken: authData.accessToken,
            user: authData.user,
            timestamp: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }),
    )
    // 根据场景决定是否设置cookie
    if (shouldSetCookie) {
        // 浏览器直连模式：设置cookie
        setCookie("refresh_token", authData.refreshToken, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
            secure: true, //process.env.NODE_ENV === 'production',
            sameSite: "strict",
        })
    }
    // 触发自定义事件通知其他组件
    window.dispatchEvent(
        new CustomEvent("offline:login", {
            detail: authData,
        }),
    )
}

// 获取存储的refreshToken
const getStoredRefreshToken = (): string | null => {
    return (getCookie("refresh_token") as string) || null
}

// 清除refreshToken
const clearStoredRefreshToken = (): void => {
    deleteCookie("refresh_token")
}

export function OfflineLoginForm() {
    const [email, setEmail] = useState("")
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
            const authData = await authenticateOffline(email, password, deviceFingerprint)
            // 存储离线认证信息 - 这里默认设置cookie，因为这是浏览器直连模式
            storeOfflineAuth(authData, true)
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
                        refreshToken: authData.refreshToken,
                        user: authData.user,
                        fromNextjs: false,
                    },
                }),
            )
            console.log("[OfflineLoginForm] 已触发token:refreshed事件")

            toast.success("Next离线情形下登录,与后端服务器连接", {
                duration: 2000,
            })
            // 跳转到首页
            router.push("/")
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
                <CardTitle className="text-2xl">离线登录</CardTitle>
                <CardDescription>
                    {networkStatus.isOnline ? "Next.js服务器正常，建议使用标准登录" : "Next.js服务器离线，使用直连后端登录"}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">用户名/邮箱</Label>
                        <Input
                            id="email"
                            type="text"
                            placeholder="输入用户名或邮箱"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
