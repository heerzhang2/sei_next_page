"use client"

import type React from "react"

import { useState } from "react"
import { LineColumn } from "@/components/chub"
import { FormField } from "@/components/shub"
import { MemoDatesInput } from "@/components/chub"
import { CollapsibleFormSection } from "@/components/chub"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface FormData {
    // 个人信息
    name: string
    email: string
    phone: string

    // 工作信息
    department: string
    position: string
    startDate: string

    // 项目信息
    projectName: string
    projectDeadlines: string
    projectNotes: string
}

export default function CollapsibleFormExample() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        startDate: "",
        projectName: "",
        projectDeadlines: "",
        projectNotes: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [jsonResult, setJsonResult] = useState<string>("")

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error when field is changed
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // 验证必填字段
        if (!formData.name.trim()) {
            newErrors.name = "姓名是必填项"
        }

        if (!formData.email.trim()) {
            newErrors.email = "邮箱是必填项"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "请输入有效的邮箱地址"
        }

        if (!formData.department) {
            newErrors.department = "请选择部门"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            // 格式化数据为JSON
            const jsonData = JSON.stringify(formData, null, 2)
            setJsonResult(jsonData)
            console.log("提交的数据:", jsonData)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">可折叠表单示例</CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* 个人信息部分 - 默认展开 */}
                        <CollapsibleFormSection title="个人信息" defaultOpen={true}>
                            <LineColumn width={300}>

                                <FormField id="name" label="姓名1" required error={errors.name}>
                                    <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                                </FormField>
                                <FormField id="department" label="部门2" required error={errors.department}>
                                    <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                                        <SelectTrigger id="department">
                                            <SelectValue placeholder="选择部门" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="engineering">工程部</SelectItem>
                                            <SelectItem value="marketing">市场部</SelectItem>
                                            <SelectItem value="finance">财务部</SelectItem>
                                            <SelectItem value="hr">人力资源部</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormField>


                                <FormField id="phone" label="电话3" error={errors.phone}>
                                    <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                                </FormField>
                                <FormField id="projectDeadlines" label="项目截止日期4" error={errors.projectDeadlines}>
                                    <MemoDatesInput
                                        id="projectDeadlines"
                                        value={formData.projectDeadlines}
                                        onChange={(value) => handleChange("projectDeadlines", value || "")}
                                        rows={2}
                                        placeholder="输入项目截止日期"
                                    />
                                </FormField>

                                <FormField id="email" label="邮箱5" required error={errors.email}>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                    />
                                </FormField>
                                <FormField id="projectNotes" label="项目备注6" error={errors.projectNotes}>
                                    <Textarea
                                        id="projectNotes"
                                        value={formData.projectNotes}
                                        onChange={(e) => handleChange("projectNotes", e.target.value)}
                                        rows={5}
                                    />
                                </FormField>

                                <FormField id="startDate" label="入职日期7" error={errors.startDate}>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleChange("startDate", e.target.value)}
                                    />
                                </FormField>
                                <FormField id="projectName" label="项目名称8" error={errors.projectName}>
                                    <Input
                                        id="projectName"
                                        value={formData.projectName}
                                        onChange={(e) => handleChange("projectName", e.target.value)}
                                    />
                                </FormField>


                                <FormField id="position" label="职位9" error={errors.position}>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => handleChange("position", e.target.value)}
                                    />
                                </FormField>
                            </LineColumn>
                        </CollapsibleFormSection>

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
                        <Button type="submit">提交表单</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
