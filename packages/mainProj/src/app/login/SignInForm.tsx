"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useEffect, useRef, useState } from "react"
import {signIn, useSession} from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"

async function sha256Hash(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
}
const isValidCallbackUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url, window.location.origin);
        return parsedUrl.origin === window.location.origin;
    } catch {
        return false;
    }
}

export default function SignInForm() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    const rawCallbackUrl = searchParams.get('callbackUrl');
    const callbackUrl = rawCallbackUrl && isValidCallbackUrl(rawCallbackUrl)
        ? rawCallbackUrl
        : '/';
    console.log("signIn登录render：——session=",session)
    const signInAction = async (_prevState: string | undefined, formData: FormData) => {
        const username = formData.get("username") as string
        const password = formData.get("password") as string

        console.log("signInAction 录入formData:", { username, password: "***" })

        try {
            const hashedPassword = await sha256Hash(password)

            const result = await signIn("credentials", {
                username: username,
                password: hashedPassword, // Send hashed password instead of plain text
                redirect: false,
            })
            if (result?.error) {
                return `登录失败: ${result.error}`
            } else {
                if (typeof window !== "undefined") {
                    console.log("signIn完成token:refreshed session=",session)
                    window.dispatchEvent(
                        new CustomEvent("token:refreshed", {
                            detail: {
                                accessToken: null,      //表示依照session提取token
                                refreshToken: session?.user?.refreshToken,
                            },
                        }),
                    )
                }
                // 登录成功，跳转到回调URL或首页
                router.push(callbackUrl)
                return "登录成功"
            }
        } catch (error) {
            console.error("登录过程中出错:", error)
            return "登录过程中出现错误"
        }
    }

    const [response, action, isPending] = useActionState(signInAction, undefined)
    const usernameRef = useRef<HTMLInputElement>(null)
    // useEffect(() => {
    //     const timeout = setTimeout(() => usernameRef.current?.focus(), 100)
    //     return () => clearTimeout(timeout)
    // }, [])
    const [error, setError] = React.useState("")

    // 当 response 有错误信息时显示
    useEffect(() => {
        if (response && response !== "登录成功") {
            setError(response)
        } else {
            setError("")
        }
    }, [response])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">用户登录</h2>
                    <p className="text-sm text-gray-500 mb-6">欢迎回来！请输入您的账户信息</p>
                </div>

                <form action={action} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <Label htmlFor="username">账户</Label>
                            <Input
                                id="username"
                                name="username"
                                ref={usernameRef}
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
                        <Button disabled={!username || !password || isPending} className="w-full mt-4" type="submit">
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
