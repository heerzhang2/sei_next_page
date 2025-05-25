"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useEffect, useRef, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
//密码hash 防止在服务后台泄密
// var sha256 = require('hash.js/lib/hash/sha/256');

export default function SignInForm() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    //http://192.168.0.100:3765/api/auth/callback/credentials?   表单数据
    // username: undefined
    // email: herzhang@163.com
    // password:
    // csrfToken: e2...a
    // callbackUrl: http://192.168.0.100:3765/login?error=CredentialsSignin&code=credentials
    const signInAction = async (_prevState: string | undefined, formData: FormData) => {
        // 正确的方式：使用 FormData.get() 方法获取表单数据
        const username = formData.get("username") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        console.log("signInAction录入formData:", { username, email, password })

        try {
            const result = await signIn("credentials", {
                username: username,
                email: email || "herzhang@163.com", // 使用实际的 email 或默认值
                password: password,
                redirect: false, // 设置为 false 以便处理错误
            })

            console.log("signIn完成", result)

            if (result?.error) {
                return `登录失败: ${result.error}`
            } else {
                // 登录成功，重定向到用户页面
                router.push("/user")
                return "登录成功"
            }
        } catch (error) {
            console.error("登录过程中出错:", error)
            return "登录过程中出现错误"
        }
    }

    const [response, action, isPending] = useActionState(signInAction, undefined)

    const usernameRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        const timeout = setTimeout(() => usernameRef.current?.focus(), 100)
        return () => clearTimeout(timeout)
    }, [])

    const [error, setError] = React.useState("")

    // 当 response 有错误信息时显示
    useEffect(() => {
        if (response && response !== "登录成功" && response !== "signOK") {
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
                                name="username" // 重要：添加 name 属性
                                ref={usernameRef}
                                required
                                onChange={(e) => setUsername(e.currentTarget.value)}
                                value={username}
                                type="text"
                                placeholder="账户"
                                className="mt-1"
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                name="email" // 重要：添加 name 属性
                                onChange={(e) => setEmail(e.currentTarget.value)}
                                value={email}
                                type="email"
                                placeholder="邮箱地址"
                                className="mt-1"
                            />
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                name="password" // 重要：添加 name 属性
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
