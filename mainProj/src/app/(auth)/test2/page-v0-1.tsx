"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// 表单验证模式
const formSchema = z.object({
    fullName: z.string().min(2, { message: "姓名至少需要2个字符" }),
    email: z.string().email({ message: "请输入有效的电子邮件地址" }),
    address: z.string().min(5, { message: "地址至少需要5个字符" }),
    phone: z.string().min(5, { message: "电话号码至少需要5个字符" }),
    message: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "您必须同意条款和条件",
    }),
})

type FormValues = z.infer<typeof formSchema>

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 初始化表单
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            address: "",
            phone: "",
            message: "",
            agreeToTerms: false,
        },
    })

    // 处理表单提交
    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        console.log("表单值:", values)

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsSubmitting(false)
    }

    // 滚动到错误字段
    useEffect(() => {
        if (isSubmitting && Object.keys(form.formState.errors).length > 0) {
            const firstErrorField = document.querySelector('[aria-invalid="true"]')
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
                if (firstErrorField instanceof HTMLElement) {
                    firstErrorField.focus()
                }
            }
            setIsSubmitting(false)
        }
    }, [form.formState.errors, isSubmitting])

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">联系我们</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* 姓名字段 */}
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>姓名</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="请输入您的姓名"
                                        {...field}
                                        className="w-full" // 确保宽度为100%
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 电子邮件字段 */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>电子邮件</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="请输入您的电子邮件"
                                        type="email"
                                        {...field}
                                        className="w-full" // 确保宽度为100%
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 地址字段 */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>地址</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="请输入您的地址"
                                        {...field}
                                        className="w-full" // 确保宽度为100%
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 电话字段 */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>电话</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="请输入您的电话号码"
                                        {...field}
                                        className="w-full" // 确保宽度为100%
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 消息字段 */}
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>消息</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="请输入您的消息"
                                        className="min-h-[100px] w-full" // 确保宽度为100%
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 同意条款复选框 - 修复布局问题 */}
                    <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-1" // 微调对齐
                                    />
                                </FormControl>
                                <div className="grid gap-1.5 leading-none">
                                    <FormLabel className="text-sm font-medium leading-none">紧急联系人 我同意所有条款和条件</FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full" // 使按钮也是全宽
                    >
                        {isSubmitting ? "提交中..." : "提交表单"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
