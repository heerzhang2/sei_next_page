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
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import type { OfflineAuthData } from "@/hooks/use-offline-auth"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { withBasePath } from "@/lib/tool"

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
    const { isGraphQLBackendReachable } = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const rawCallbackUrl = searchParams.get("callbackUrl")
    const callbackUrl = rawCallbackUrl && isValidCallbackUrl(rawCallbackUrl) ? rawCallbackUrl : "/"
    const errorParam = searchParams.get("error")
    const codeParam = searchParams.get("code")

    console.log("signIn登录render：——session=", session)

    const [isPending, setIsPending] = useState(false)
    const [error, setError] = React.useState("")
    const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false)
    const [isServerAvailable, setIsServerAvailable] = useState(true)
    // 账户未启用弹窗状态
    const [showDisabledDialog, setShowDisabledDialog] = useState(false)
    // 服务器不可用弹窗状态
    const [showServerUnavailableDialog, setShowServerUnavailableDialog] = useState(false)
    const isGraphQLBackendUnavailable = isGraphQLBackendReachable === false
    let loginButtonLabel = "登录"
    if (isPending) {
        loginButtonLabel = "登录中..."
    } else if (!isServerAvailable) {
        loginButtonLabel = "前端不可用"
    } else if (isGraphQLBackendUnavailable) {
        loginButtonLabel = "后端不可用"
    }

    // 检查 URL 中的错误参数（处理 NextAuth 默认重定向回登录页的情况）
    React.useEffect(() => {
        if (errorParam) {
            // 优先根据 code 给出更精确的提示
            if (codeParam === "USER_NOT_ENABLED") {
                setError("您的账户还未激活，请联系管理员激活账户")
                return
            }
            const errorMessage = errorParam === "CredentialsSignin"
                ? "用户名或密码错误"
                : `登录错误: ${errorParam}`
            setError(errorMessage)
        }
    }, [errorParam, codeParam])

    // 检测 Next.js 前端服务器可用性
    React.useEffect(() => {
        const checkServerAvailability = async () => {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 5000)
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
                const url = `${basePath}/api/auth/csrf`

                const response = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    cache: 'no-cache',
                })

                clearTimeout(timeoutId)
                if (!response.ok) {
                    console.error("服务器不可用，状态码:", response.status)
                    setIsServerAvailable(false)
                    return
                }

                setIsServerAvailable(true)
            } catch (error) {
                console.error("服务器不可用:", error)
                setIsServerAvailable(false)
            }
        }

        checkServerAvailability()
        const intervalId = setInterval(checkServerAvailability, 30000)
        return () => clearInterval(intervalId)
    }, [])

    React.useEffect(() => {
        if (!isServerAvailable) {
            setError("前端服务器当前不可用，请试试离线登录")
            setShowServerUnavailableDialog(true)
            return
        }

        if (isGraphQLBackendUnavailable) {
            setError("Java 后端当前不可用，无法登录。请检查后端服务或稍后再试。")
            setShowServerUnavailableDialog(true)
            return
        }

        setShowServerUnavailableDialog(false)
    }, [isGraphQLBackendUnavailable, isServerAvailable])

    //没使用 urql 的， 直接查询用户信息的 GraphQL；
    const fetchAuthUser = async (accessToken: string) => {
        const query = `
            query AuthCompQuery {
                authUser {
                    id
                    username
                    enabled
                }
            }
        `
        try {
            const basePath = process.env.NEXT_PUBLIC_BACK_END || ""
            const response = await fetch(`${basePath}/graphql`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ query }),
            })
            const result = await response.json()
            return result.data?.authUser
        } catch (error) {
            console.error("[SignInForm] 获取用户信息失败:", error)
            return null
        }
    }

    // 监听 session 变化，登录成功后处理存储
    React.useEffect(() => {
        if (hasJustLoggedIn && session?.user?.accessToken) {
            (async () => {
                try {
                    const accessToken = session.user!.accessToken
                    const userId = session.user!.id
                    const stored = localStorage.getItem("offline_auth") || "{}"
                    const authData: OfflineAuthData = JSON.parse(stored)
                    localStorage.setItem(
                        "offline_auth",
                        JSON.stringify({
                            ...authData,
                            accessToken: accessToken,
                            user: { id: userId as string },
                            timestamp: Date.now(),
                            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                        }),
                    )
                    window.dispatchEvent(
                        new CustomEvent("token:refreshed", {
                            detail: {
                                accessToken: accessToken,
                                user: { id: userId as string },
                                fromNextjs: true,
                            },
                        }),
                    )
                    console.log("[SignInForm] 已触发token:refreshed事件通知新token")

                    // 登录成功后立即查询用户信息，检查账户是否启用
                    console.log("[SignInForm] 登录成功，开始查询用户信息...")
                    const authUser = await fetchAuthUser(accessToken as string)
                    console.log("[SignInForm] 用户信息:", authUser)

                    // 检查账户是否未启用
                    if (authUser && authUser.enabled === false) {
                        console.log("[SignInForm] 账户未启用，显示提醒弹窗")
                        setShowDisabledDialog(true)
                        sessionStorage.removeItem("lastAuthQueryTime")
                        window.dispatchEvent(new CustomEvent("user:login"))
                        setIsPending(false)
                        setHasJustLoggedIn(false)
                        return
                    }

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
            })()
        }
    }, [hasJustLoggedIn, session, callbackUrl, router])

    const { deviceFingerprint: deviceId } = useDeviceFingerprint()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setError("")

        if (isGraphQLBackendUnavailable) {
            setError("Java 后端当前不可用，无法登录。请检查后端服务或稍后再试。")
            setIsPending(false)
            return
        }
        if (!isServerAvailable) {
            setError("前端服务器当前不可用，请试试离线登录")
            setIsPending(false)
            return
        }

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

    // 跳转到第三方认证页面
    const handleGoToThirdPartyAuth = () => {
        setShowDisabledDialog(false)
        window.location.href =withBasePath("/third-party-login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">用户登录</h2>
                    <p className="text-sm text-gray-500 mb-6">欢迎回来！请输入您的账户信息</p>
                </div>

                {/* 账户未启用提醒弹窗 */}
                <Dialog open={showDisabledDialog} onOpenChange={setShowDisabledDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-amber-600">账户未启用</DialogTitle>
                            <DialogDescription className="pt-2">
                                您的账户尚未完成认证，暂时无法使用系统功能。
                                <br />
                                请先完成第三方认证以启用账户。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setShowDisabledDialog(false)}
                            >
                                稍后再说
                            </Button>
                            <Button
                                onClick={handleGoToThirdPartyAuth}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                去认证
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 服务器不可用提醒弹窗 */}
                <Dialog open={showServerUnavailableDialog} onOpenChange={setShowServerUnavailableDialog}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">服务器不可用</DialogTitle>
                            <DialogDescription className="pt-2">
                                Java GraphQL后端服务器当前不可用，无法进行在线登录。
                                <br />
                                请检查网络连接或稍后重试。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={() => setShowServerUnavailableDialog(false)}
                            >
                                知道了
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                            <AlertDescription>
                                {error}
                                {error === "您的账户还未激活，请联系管理员激活账户" && (
                                    <div className="mt-3">
                                        <Link
                                            href="/third-party-login"
                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                        >
                                            跳转旧系统账户登录以表明您的身份
                                        </Link>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button 
                            disabled={isPending || isGraphQLBackendUnavailable || !isServerAvailable} 
                            className="w-full mt-4" 
                            type="submit"
                        >
                            {loginButtonLabel}
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
