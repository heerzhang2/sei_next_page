"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import type { ReactNode } from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {Label} from "@/components/ui/label";

interface FormFieldProps {
    id: string
    label: string
    required?: boolean
    error?: string
    className?: string
    children: ReactNode
}

export function FormField({ id, label, required = false, error, className, children }: FormFieldProps) {
    return (
        <div className={cn("flex flex-col space-y-2 w-full break-inside-avoid", className)}>
            <Label htmlFor={id} className="flex items-center text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className={cn("w-full", error && "ring-1 ring-red-500 rounded-md")}>{children}</div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
}

// 定义表单数据类型
interface FormData {
    [key: string]: any
}

// 定义验证错误类型
interface FormErrors {
    [key: string]: string
}

export default function FormExample() {
    // 初始表单数据
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        startDate: "",
        salary: "",
        employmentType: "",
        address: "",
        急联人: "",
        importantDates: "项目A截止 2023-06-15\n项目B开始 2023-07-01",
        skills: "",
        agreeToTerms: false,
    })

    // 表单错误状态
    const [errors, setErrors] = useState<FormErrors>({})

    // 表单提交状态
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 显示JSON结果
    const [jsonResult, setJsonResult] = useState<string>("")

    // 处理输入变化
    const handleChange = (field: keyof FormData, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // 当字段被修改时清除该字段的错误
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // 必填字段验证
        if (!formData.fullName.trim()) {
            newErrors.fullName = "姓名是必填项"
        }

        if (!formData.email.trim()) {
            newErrors.email = "邮箱是必填项"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "请输入有效的邮箱地址"
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "电话是必填项"
        } else if (!/^\d{11}$/.test(formData.phone)) {
            newErrors.phone = "请输入有效的11位手机号码"
        }

        if (!formData.department) {
            newErrors.department = "请选择部门"
        }

        if (!formData.position.trim()) {
            newErrors.position = "职位是必填项"
        }

        if (!formData.startDate) {
            newErrors.startDate = "请选择入职日期"
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "您必须同意条款才能提交"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setIsSubmitting(true)

            // 模拟API调用
            setTimeout(() => {
                // 这里是您需要的JSON数据
                const jsonData = JSON.stringify(formData, null, 2)
                setJsonResult(jsonData)
                setIsSubmitting(false)

                // 在实际应用中，您可以在这里调用您的API
                console.log("提交的数据:", jsonData)
            }, 1000)
        } else {
            // 滚动到第一个错误
            const firstErrorField = document.querySelector('[aria-invalid="true"]')
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="w-full max-w-5xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">员工信息表单</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <h3 className="text-lg font-medium">基本信息</h3>
                            <FormField id="fullName" label="姓名" required error={errors.fullName}>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    aria-invalid={!!errors.fullName}
                                />
                            </FormField>

                            <FormField id="email" label="邮箱" required error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    aria-invalid={!!errors.email}
                                />
                            </FormField>

                            <FormField id="phone" label="电话" required error={errors.phone}>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    aria-invalid={!!errors.phone}
                                />
                            </FormField>

                        <h3 className="text-lg font-medium pt-4">职位信息</h3>
                            <FormField id="department" label="部门" required error={errors.department}>
                                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                                    <SelectTrigger id="department" aria-invalid={!!errors.department}>
                                        <SelectValue placeholder="选择部门" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="engineering">工程部</SelectItem>
                                        <SelectItem value="marketing">市场部</SelectItem>
                                        <SelectItem value="finance">财务部</SelectItem>
                                        <SelectItem value="hr">人力资源部</SelectItem>
                                        <SelectItem value="operations">运营部</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField id="position" label="职位" required error={errors.position}>
                                <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => handleChange("position", e.target.value)}
                                    aria-invalid={!!errors.position}
                                />
                            </FormField>

                            <FormField id="startDate" label="入职日期" required error={errors.startDate}>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                    aria-invalid={!!errors.startDate}
                                />
                            </FormField>

                            <FormField id="salary" label="薪资" error={errors.salary}>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={(e) => handleChange("salary", e.target.value)}
                                    aria-invalid={!!errors.salary}
                                />
                            </FormField>

                            <FormField id="employmentType" label="雇佣类型" error={errors.employmentType}>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(value) => handleChange("employmentType", value)}
                                >
                                    <SelectTrigger id="employmentType">
                                        <SelectValue placeholder="选择雇佣类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fullTime">全职</SelectItem>
                                        <SelectItem value="partTime">兼职</SelectItem>
                                        <SelectItem value="contract">合同工</SelectItem>
                                        <SelectItem value="intern">实习生</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>



                        <h3 className="text-lg font-medium pt-4">其他信息</h3>
                            <FormField id="address" label="地址" error={errors.address}>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    aria-invalid={!!errors.address}
                                />
                            </FormField>

                            <FormField id="急联人" label="紧急联系人" error={errors.急联人}>
                                <Input
                                    id="急联人"
                                    value={formData.急联人}
                                    onChange={(e) => handleChange("急联人", e.target.value)}
                                    aria-invalid={!!errors.急联人}
                                />
                            </FormField>

                        <FormField id="skills" label="技能和资质" error={errors.skills}>
                            <Textarea
                                id="skills"
                                value={formData.skills}
                                onChange={(e) => handleChange("skills", e.target.value)}
                                aria-invalid={!!errors.skills}
                            />
                        </FormField>

                        <div className="flex items-center space-x-2 pt-4">
                            <Checkbox
                                id="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onCheckedChange={(checked) => handleChange("agreeToTerms", checked === true)}
                            />
                            <label
                                htmlFor="agreeToTerms"
                                className={cn(
                                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                    errors.agreeToTerms && "text-red-500",
                                )}
                            >
                                我同意所有条款和条件
                            </label>
                        </div>
                        {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

                        {jsonResult && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-md">
                                <h3 className="text-lg font-medium mb-2">提交的JSON数据:</h3>
                                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">{jsonResult}</pre>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-4 border-t p-6">
                        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                            重置
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "提交中..." : "提交表单"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
