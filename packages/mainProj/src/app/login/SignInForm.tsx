"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"
import type { OfflineAuthData } from "@/hooks/use-offline-auth"

const isValidCallbackUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url, window.location.origin)
        return parsedUrl.origin === window.location.origin
    } catch {
        return false
    }
}

export default function SignInForm() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { data: session, update: updateSession } = useSession()
    const searchParams = useSearchParams()
    const rawCallbackUrl = searchParams.get("callbackUrl")
    const callbackUrl = rawCallbackUrl && isValidCallbackUrl(rawCallbackUrl) ? rawCallbackUrl : "/"
    const errorParam = searchParams.get("error")

    console.log("signIn登录render：——session=", session)

    const [isPending, setIsPending] = useState(false)
    const [error, setError] = React.useState("")

    // 检查 URL 中的错误参数
    React.useEffect(() => {
        if (errorParam) {
            const errorMessage = errorParam === "CredentialsSignin"
                ? "用户名或密码错误"
                : `登录错误: ${errorParam}`
            setError(errorMessage)
        }
    }, [errorParam])
    const { deviceFingerprint: deviceId } = useDeviceFingerprint()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setError("")

        try {
            console.log("登录formData:", { username, password: "***", deviceId })

            const result = await signIn("credentials", {
                username: username,
                password: password,
                deviceId: deviceId,
                redirect: false,
            })

            if (result?.error) {
                console.error("Login error:", result.error)
                setError(result.error === "CredentialsSignin" ? "用户名或密码错误" : `登录失败: ${result.error}`)
                setIsPending(false)
                return
            }

            // 触发 session 更新
            await updateSession()

            // 等待 session 更新后处理存储
            setTimeout(() => {
                if (session?.user?.accessToken) {
                    try {
                        const stored = localStorage.getItem("offline_auth") || "{}"
                        const authData: OfflineAuthData = JSON.parse(stored)
                        localStorage.setItem(
                            "offline_auth",
                            JSON.stringify({
                                ...authData,
                                accessToken: session.user.accessToken,
                                user: { id: session.user.id as string },
                                timestamp: Date.now(),
                                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                            }),
                        )
                        window.dispatchEvent(
                            new CustomEvent("token:refreshed", {
                                detail: {
                                    accessToken: session.user.accessToken,
                                    user: { id: session.user.id as string },
                                    fromNextjs: true,
                                },
                            }),
                        )
                        console.log("[SignInForm] 已触发token:refreshed事件通知新token")
                        router.push(callbackUrl)
                    } catch (error) {
                        console.error("保存认证失败:", error)
                        setError("保存认证信息失败")
                    }
                } else {
                    setError("登录后获取session失败，请重试")
                }
                setIsPending(false)
            }, 500)
        } catch (error) {
            console.error("登录过程中出错:", error)
            setError("登录过程中出现错误")
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">用户登录</h2>
                    <p className="text-sm text-gray-500 mb-6">欢迎回来！请输入您的账户信息</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* 隐藏字段传递设备ID */}
                    <input type="hidden" name="deviceId" value={deviceId} />

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <Label htmlFor="username">账户</Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                onChange={(e) => setUsername(e.currentTarget.value)}
                                value={username}
                                type="text"
                                placeholder="账户"
                                className="mt-1"
                            />
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                name="password"
                                required
                                onChange={(e) => setPassword(e.currentTarget.value)}
                                value={password}
                                type="password"
                                placeholder="密码最少6位的复杂"
                                autoComplete="off"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>报错</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button disabled={isPending} className="w-full mt-4" type="submit">
                            {isPending ? "登录中..." : "登录"}
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-500">
                    <Link href="/signup" className="text-blue-600 hover:text-blue-700">
                        没有账户？立即注册
                    </Link>
                </div>
                <div className="p-6 border-t border-gray-200">
                    <div className="mt-4">
                        <Link href="/" className="text-blue-600 hover:underline">
                            首页
                        </Link>
                    </div>
                    <div className="mt-4">
                        <Link href="/user" className="text-blue-600 hover:underline">
                            用户
                        </Link>
                    </div>
                    <div className="mt-4">
                        <Link href="/profile" className="text-blue-600 hover:underline">
                            ⬅ 用户信息
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
