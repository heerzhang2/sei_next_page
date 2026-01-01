"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useDeviceFingerprint } from "@/report/hook/useDeviceFingerprint"
import { useClient } from "@urql/next"
import { gql } from "@urql/core"

const REGISTER_MUTATION = gql`
    mutation RegisterUser(
        $username: String!
        $password: String!
        $mobile: String!
        $external: String
        $eName: String
        $ePassword: String
    ) {
        newUser(
            username: $username
            password: $password
            mobile: $mobile
            external: $external
            eName: $eName
            ePassword: $ePassword
        )
    }
`

export default function SignUpForm() {
    const router = useRouter()
    const client = useClient()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [external, setExternal] = useState("")
    const [eName, setEName] = useState("")
    const [ePassword, setEPassword] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const { deviceFingerprint: deviceId } = useDeviceFingerprint()

    const validateForm = (): boolean => {
        setError("")

        // 验证用户名
        if (!username || username.length < 3) {
            setError("用户名至少需要3个字符")
            return false
        }

        // 验证密码
        if (!password || password.length < 6) {
            setError("密码至少需要6个字符")
            return false
        }

        // 验证确认密码
        if (password !== confirmPassword) {
            setError("两次输入的密码不一致")
            return false
        }

        // 验证手机号（必填）
        if (!mobile) {
            setError("请输入手机号")
            return false
        }
        if (!/^1[3-9]\d{9}$/.test(mobile)) {
            setError("手机号格式不正确")
            return false
        }

        // 如果填写了外部认证信息，需要同时填写用户名和密码
        if (external) {
            if (!eName || !ePassword) {
                setError("外部认证需要填写用户名和密码")
                return false
            }
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        setError("")
        setSuccess("")

        if (!validateForm()) {
            setIsPending(false)
            return
        }

        try {
            console.log("注册formData:", { username, mobile, external, eName, deviceId })

            // 使用 urql 发送 mutation 请求
            const result = await client.mutation(REGISTER_MUTATION, {
                username,
                password,
                mobile,
                external: external || null,
                eName: eName || null,
                ePassword: ePassword || null,
            }).toPromise()

            if (result.error) {
                const errorMessage = result.error.message || "注册失败"
                setError(errorMessage)
                console.error("注册错误:", result.error)
                setIsPending(false)
                return
            }

            if (result.data?.newUser === true) {
                setSuccess("注册成功！正在跳转到登录页面...")
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            } else {
                setError("注册失败，请重试")
            }
        } catch (error) {
            console.error("注册过程中出错:", error)
            setError("注册过程中出现错误，请检查网络连接")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">用户注册</h2>
                    <p className="text-sm text-gray-500 mb-6">创建一个新账户开始使用</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* 隐藏字段传递设备ID */}
                    <input type="hidden" name="deviceId" value={deviceId} />

                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* 用户名 */}
                        <div className="mb-4">
                            <Label htmlFor="username">
                                账户 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                required
                                onChange={(e) => setUsername(e.currentTarget.value)}
                                value={username}
                                type="text"
                                placeholder="至少3个字符"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 密码 */}
                        <div className="mt-4">
                            <Label htmlFor="password">
                                密码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                required
                                onChange={(e) => setPassword(e.currentTarget.value)}
                                value={password}
                                type="password"
                                placeholder="至少6位的复杂密码"
                                autoComplete="new-password"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 确认密码 */}
                        <div className="mt-4">
                            <Label htmlFor="confirmPassword">
                                确认密码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                                value={confirmPassword}
                                type="password"
                                placeholder="再次输入密码"
                                autoComplete="new-password"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 手机号（必填） */}
                        <div className="mt-4">
                            <Label htmlFor="mobile">
                                手机号 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="mobile"
                                name="mobile"
                                required
                                onChange={(e) => setMobile(e.currentTarget.value)}
                                value={mobile}
                                type="tel"
                                placeholder="请输入手机号"
                                autoComplete="tel"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 分隔线 */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    外部认证（可选）
                                </span>
                            </div>
                        </div>

                        {/* 外部认证系统 */}
                        <div className="mt-4">
                            <Label htmlFor="external">
                                外部认证系统 <span className="text-gray-400">(可选)</span>
                            </Label>
                            <Input
                                id="external"
                                name="external"
                                onChange={(e) => setExternal(e.currentTarget.value)}
                                value={external}
                                type="text"
                                placeholder="例如：旧平台"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 外部用户名 */}
                        <div className="mt-4">
                            <Label htmlFor="eName">
                                外部系统用户名
                            </Label>
                            <Input
                                id="eName"
                                name="eName"
                                onChange={(e) => setEName(e.currentTarget.value)}
                                value={eName}
                                type="text"
                                placeholder="外部系统的用户名"
                                disabled={isPending || !external}
                            />
                        </div>

                        {/* 外部密码 */}
                        <div className="mt-4">
                            <Label htmlFor="ePassword">
                                外部系统密码
                            </Label>
                            <Input
                                id="ePassword"
                                name="ePassword"
                                onChange={(e) => setEPassword(e.currentTarget.value)}
                                value={ePassword}
                                type="password"
                                placeholder="外部系统的密码"
                                autoComplete="off"
                                disabled={isPending || !external}
                            />
                        </div>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>错误</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* 成功提示 */}
                    {success && (
                        <Alert className="mt-4 bg-green-50 border-green-200">
                            <AlertTitle className="text-green-800">成功</AlertTitle>
                            <AlertDescription className="text-green-700">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end">
                        <Button disabled={isPending} className="w-full mt-4" type="submit">
                            {isPending ? "注册中..." : "注册"}
                        </Button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">
                        已有账户？{" "}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            立即登录
                        </Link>
                    </p>
                    <p className="text-xs text-gray-400">
                        注册即表示您同意我们的服务条款和隐私政策
                    </p>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <div className="mt-4">
                        <Link href="/" className="text-blue-600 hover:underline">
                            首页
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
