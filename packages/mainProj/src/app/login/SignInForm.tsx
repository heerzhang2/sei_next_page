"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { signIn, useSession, getSession } from "next-auth/react"
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
    const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false)
    const [isServerAvailable, setIsServerAvailable] = useState(true)

    // 检查 URL 中的错误参数
    React.useEffect(() => {
        if (errorParam) {
            const errorMessage = errorParam === "CredentialsSignin"
                ? "用户名或密码错误"
                : `登录错误: ${errorParam}`
            setError(errorMessage)
        }
    }, [errorParam])

    // 检测服务器可用性
    React.useEffect(() => {
        const checkServerAvailability = async () => {
            try {
                // 使用 fetch 检测服务器是否可用，设置较短的超时时间
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000)

                // 获取 basePath
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
                const url = `${basePath}/api/auth/csrf`

                const response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    cache: 'no-cache'
                })

                clearTimeout(timeoutId)

                // 检查响应状态码，如果不是 2xx，则认为服务器不可用
                if (!response.ok) {
                    console.error("服务器不可用，状态码:", response.status)
                    setIsServerAvailable(false)
                    setError("前端服务器当前不可用，请试试离线登录")
                    return
                }

                setIsServerAvailable(true)
            } catch (error) {
                console.error("服务器不可用:", error)
                setIsServerAvailable(false)
                setError("前端服务器当前不可用，请试试离线登录")
            }
        }

        // 初始检测
        checkServerAvailability()

        // 设置定时检测
        const intervalId = setInterval(checkServerAvailability, 30000) // 每30秒检测一次

        return () => clearInterval(intervalId)
    }, [])

    // 监听 session 变化，登录成功后处理存储
    React.useEffect(() => {
        if (hasJustLoggedIn && session?.user?.accessToken) {
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

                // 设置强制刷新标志，确保跳转到首页后 HeaderWrapper 能获取最新用户信息
                sessionStorage.setItem("authForceRefresh", "true")
                console.log("[SignInForm] 已设置 authForceRefresh 标志")

                // 清空上次查询时间，确保登录后立刻执行权限查询
                sessionStorage.removeItem("lastAuthQueryTime")
                console.log("[SignInForm] 已清空 lastAuthQueryTime")

                // 触发登录成功事件，通知 HeaderWrapper 刷新用户信息
                window.dispatchEvent(new CustomEvent("user:login"))
                console.log("[SignInForm] 已触发user:login事件")

                router.push(callbackUrl)
                setHasJustLoggedIn(false)
                setIsPending(false)
            } catch (error) {
                console.error("保存认证失败:", error)
                setError("保存认证信息失败")
                setIsPending(false)
                setHasJustLoggedIn(false)
            }
        }
    }, [hasJustLoggedIn, session, callbackUrl, router])

    const { deviceFingerprint: deviceId } = useDeviceFingerprint()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setError("")

        try {
            console.log("登录formData:", { username, password: "***", deviceId })

            // 检查网络连接
            if (!navigator.onLine) {
                setError("网络不可用，请检查网络连接")
                setIsPending(false)
                return
            }

            // 设置超时检测
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("请求超时")), 10000)
            })

            const result = await Promise.race([
                signIn("credentials", {
                    username: username,
                    password: password,
                    deviceId: deviceId,
                    redirect: false,
                }),
                timeoutPromise
            ]) as any

            if (result?.error) {
                console.error("Login error:", result.error)
                // 检查是否是账户未激活错误
                if (result.code === "USER_NOT_ENABLED") {
                    setError("您的账户还未激活，请联系管理员激活账户")
                    setIsPending(false)
                    return
                }
                // 检查是否是网络相关错误
                const networkErrors = ['NetworkError', 'fetch failed', 'Failed to fetch', 'timeout', 'ERR_CONNECTION_REFUSED', 'ERR_NETWORK']
                const isNetworkError = networkErrors.some(err => 
                    result.error.toLowerCase().includes(err.toLowerCase())
                )

                if (isNetworkError) {
                    setError("无法连接到服务器，请检查网络连接或稍后再试")
                } else {
                    setError(result.error === "CredentialsSignin" ? "用户名或密码错误" : `登录失败: ${result.error}`)
                }
                setIsPending(false)
                return
            }

            // 触发 session 更新
            await updateSession()

            // 标记刚刚登录成功，等待 session 更新后的 useEffect 处理
            setHasJustLoggedIn(true)
        } catch (error: any) {
            console.error("登录过程中出错:", error)
            // 检查是否是网络错误或超时
            if (error.message === "请求超时" || 
                (error instanceof TypeError && error.message.includes('fetch'))) {
                setError("无法连接到服务器，请检查网络连接或稍后再试")
            } else {
                setError("登录过程中出现错误")
            }
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
                        <Button 
                            disabled={isPending || !isServerAvailable} 
                            className="w-full mt-4" 
                            type="submit"
                        >
                            {isPending ? "登录中..." : !isServerAvailable ? "服务器不可用" : "登录"}
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
                        <span 
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => window.location.href = '/report/'}
                        >
                            返回首页
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
