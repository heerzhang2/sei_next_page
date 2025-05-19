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
    // const { setUserEmail } = useAppState()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    const signInAction = async (_prevState: string | undefined, formData: FormData) => {
        const data = formData as any
        console.log("signInAction录入formData:{}", formData)
        await signIn("credentials", {
            username: data.username,
            email: "herzhang@163.com", //data.email,
            password: "", //data.password,
            redirect: true,
        })
        console.log("signIn完成")
        // if (!response?.error) {
        //     window.location.reload()
        //     router.push("/user")
        //     window.location.href = "/user"
        // } else {
        //     window.location.href = "/"
        // }
        return "signOK"
    }
    const [response, action, isPending] = useActionState(signInAction, undefined)

    const usernameRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        const timeout = setTimeout(() => usernameRef.current?.focus(), 100)
        return () => clearTimeout(timeout)
    }, [])
    const [error, setError] = React.useState("")
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        用户登录
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        欢迎回来！请输入您的账户信息
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form action={action} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <Label htmlFor="username">账户</Label>
                            <Input
                                id="username"
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
                        <Button disabled={!username || !password} className="w-full mt-4" type="submit">
                            登录
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
