"use client"

import { z } from "zod"
import { DynamicForm } from "./dynamic-schema-form"

// 自定义输入组件示例
function CustomInput({ value, onChange, placeholder }: any) {
    return (
        <div className="relative border rounded-md px-3 py-2">
            <input
                type="text"
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                className="outline-none w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
        </div>
    )
}

export default function FormPage() {
    // 基础schema - 这些是所有表单都会有的字段
    const baseSchema = {
        name: z.string().min(2, { message: "姓名至少需要2个字符" }),
        email: z.string().email({ message: "请输入有效的电子邮件地址" }),
    }

    // 这个页面特定的动态字段 - 这些是在这个特定页面上需要的额外字段
    // 这些字段在代码中是预定义的，但需要动态添加到表单中
    const pageSpecificFields = {
        role: z.string().min(1, { message: "请选择一个角色" }),
        bio: z.string().optional(),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: "您必须同意条款和条件",
        }),
        price: z.string().optional(),
        // 中文字段名示例
        测试字段1: z.string().optional(),
    }

    // 字段配置 - 定义每个字段如何渲染
    const fieldConfigs = {
        name: {
            label: "姓名",
            placeholder: "请输入您的姓名",
            type: "text" as const,
        },
        email: {
            label: "电子邮件",
            placeholder: "请输入您的电子邮件",
            type: "email" as const,
        },
        role: {
            label: "角色",
            type: "select" as const,
            options: [
                { label: "用户", value: "user" },
                { label: "管理员", value: "admin" },
                { label: "经理", value: "manager" },
            ],
        },
        bio: {
            label: "个人简介",
            placeholder: "请介绍一下您自己",
            type: "textarea" as const,
        },
        agreeToTerms: {
            label: "我同意条款和条件",
            type: "checkbox" as const,
        },
        price: {
            label: "价格",
            placeholder: "请输入价格",
            type: "custom" as const,
            component: CustomInput,
        },
        测试字段1: {
            label: "测试字段1",
            placeholder: "请输入测试内容",
            type: "text" as const,
        },
    }

    // 处理表单提交
    const handleSubmit = (values: any) => {
        console.log("表单值:", values)
        // 这里可以处理表单提交逻辑
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">动态表单示例</h1>

            <DynamicForm
                baseSchema={baseSchema}
                dynamicFields={pageSpecificFields}
                defaultValues={{
                    name: "",
                    email: "",
                    role: "",
                    bio: "",
                    agreeToTerms: false,
                    price: "",
                    测试字段1: "",
                }}
                onSubmit={handleSubmit}
                fieldConfigs={fieldConfigs}
            />
        </div>
    )
}
