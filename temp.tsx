"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState, useEffect, useRef, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/action/AppState"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function SignInForm() {
    const router = useRouter()
    const { setUserEmail } = useAppState()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")

    const signInAction = async (_prevState: string | undefined, formData: FormData) => {
        const data = formData
        console.log("signInAction录入formData:{}", formData)
        const response = await signIn("credentials", {
            username: "herzhang",
            email: "herzhang@163.com", //data.email,
            password: "768768", //data.password,
            redirect: true,
        })
        if (!response?.error) {
            window.location.reload()
            router.push("/user")
            window.location.href = "/user"
        } else {
            window.location.href = "/"
        }
    }
    const [response, action, isPending] = useActionState(signInAction, undefined)

    const usernameRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        const timeout = setTimeout(() => usernameRef.current?.focus(), 100)
        return () => clearTimeout(timeout)
    }, [])
    const [error, setError] = React.useState("")

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white md:mt-8 md:shadow-xl">
                <div className="border-b border-gray-200 text-center p-6 pb-3">
                    <h3 className="text-xl font-medium">使用前先登陆账户</h3>

                    <div className="text-center pb-2">
            <span className="text-sm">
              若没有账户? 先要
              <Button size="sm" variant="primary" className="ml-1">
                申请注册
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </span>
                    </div>
                </div>

                <div className="p-6">
                    <form action={action}>
                        <div className="mt-4">
                            <span className="text-sm text-gray-500 text-center block">请使用您的用户名密码登录:</span>

                            <div className="mt-4">
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
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <div className="mt-4">
                        <Link href="/mainProj/public" className="text-blue-600 hover:underline">
                            ⬅️ Go back home
                        </Link>
                    </div>
                    <div className="mt-4">
                        <Link href="/user" className="text-blue-600 hover:underline">
                            ⬅️ Go 不能尼克酸y用户
                        </Link>
                    </div>
                    <div className="mt-4">
                        <Link href="/profile" className="text-blue-600 hover:underline">
                            ⬅️ Profile y用户
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
