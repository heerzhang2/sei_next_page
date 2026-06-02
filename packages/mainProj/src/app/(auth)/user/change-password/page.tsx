"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { PasswordStrength, validatePasswordStrength } from "@/components/password-strength"
import { useClient } from "@urql/next"
import { gql } from "@urql/core"
import { withBasePath } from "@/lib/tool"

// 密码修改 GraphQL Mutation（预留，等待后端实现）
const CHANGE_PASSWORD_MUTATION = gql`
    mutation ChangePassword(
        $oldPassword: String!
        $newPassword: String!
    ) {
        changePassword(
            oldPassword: $oldPassword
            newPassword: $newPassword
        )
    }
`
//当前用户忘记密码的解决办法： 修改数据库用户表，这个用户的密码清空，enable停用该账户，让用户重新去注册账号，但是要求用户账户名称必须保证和原来的一样,不可更改username。
export default function ChangePasswordPage() {
    const router = useRouter()
    const client = useClient()
    const { data: session, status } = useSession()
    
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    // 检查用户是否登录
    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-yellow-800 mb-2">您还未登录</h2>
                        <p className="text-yellow-700 mb-4">请先登录以修改密码</p>
                        <Link href={withBasePath("/login")} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                            前往登录
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const validateForm = (): boolean => {
        setError("")

        // 验证旧密码
        if (!oldPassword) {
            setError("请输入当前密码")
            return false
        }

        // 验证新密码强度
        const passwordValidation = validatePasswordStrength(newPassword, 2)
        if (!passwordValidation.valid) {
            setError(passwordValidation.message || "新密码强度不足")
            return false
        }

        // 验证确认密码
        if (newPassword !== confirmPassword) {
            setError("两次输入的新密码不一致")
            return false
        }

        // 验证新旧密码不能相同
        if (oldPassword === newPassword) {
            setError("新密码不能与当前密码相同")
            return false
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
            console.log("修改密码:", { oldPassword: "***", newPassword: "***" })
            const result = await client.mutation(CHANGE_PASSWORD_MUTATION, {
                oldPassword,
                newPassword,
            }).toPromise()

            if (result.error) {
                const errorMessage = result.error.message || "修改密码失败"
                setError(errorMessage)
                console.error("修改密码错误:", result.error)
                setIsPending(false)
                return
            }

            if (result.data?.changePassword === true) {
                setSuccess("密码修改成功！请使用新密码重新登录")
                // 3秒后跳转到登录页
                setTimeout(() => {
                    router.push("/login")
                }, 5000)
            } else {
                setError("修改密码失败，请检查当前密码是否正确")
            }

        } catch (error) {
            console.error("修改密码过程中出错:", error)
            setError("修改密码过程中出现错误，请检查网络连接")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">修改密码</h1>
                    <p className="mt-2 text-gray-600">请设置一个强密码以保护您的账户安全</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 当前密码 */}
                        <div>
                            <Label htmlFor="oldPassword">
                                当前密码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                required
                                onChange={(e) => setOldPassword(e.currentTarget.value)}
                                value={oldPassword}
                                type="password"
                                placeholder="请输入当前密码"
                                autoComplete="current-password"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 新密码 */}
                        <div>
                            <Label htmlFor="newPassword">
                                新密码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                required
                                onChange={(e) => setNewPassword(e.currentTarget.value)}
                                value={newPassword}
                                type="password"
                                placeholder="至少6位的复杂密码"
                                autoComplete="new-password"
                                className="mt-1"
                                disabled={isPending}
                            />
                            {/* 密码强度检测 */}
                            <PasswordStrength
                                password={newPassword}
                                minStrength={2}
                                className="mt-2"
                            />
                        </div>

                        {/* 确认新密码 */}
                        <div>
                            <Label htmlFor="confirmPassword">
                                确认新密码 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                                value={confirmPassword}
                                type="password"
                                placeholder="再次输入新密码"
                                autoComplete="new-password"
                                className="mt-1"
                                disabled={isPending}
                            />
                        </div>

                        {/* 错误提示 */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>错误</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* 成功提示 */}
                        {success && (
                            <Alert className="bg-green-50 border-green-200">
                                <AlertTitle className="text-green-800">成功</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* 提交按钮 */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={isPending}
                                onClick={() => router.push(withBasePath("/user"))}
                            >
                                取消
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                disabled={isPending}
                            >
                                {isPending ? "修改中..." : "确认修改"}
                            </Button>
                        </div>
                    </form>

                    {/* 密码安全提示 */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">密码安全建议：</h3>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            <li>使用至少8位以上的密码</li>
                            <li>包含大小写字母、数字和特殊符号</li>
                            <li>避免使用常见的单词或个人信息</li>
                            <li>定期更换密码以提高安全性</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
