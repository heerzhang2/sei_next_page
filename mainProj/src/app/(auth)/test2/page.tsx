"use client"

import React, {useEffect} from "react"
import {ClearableSelect, MemoDatesInput} from "@/components/chub"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// 示例表单组件
export default function FormWithClearableSelect() {
    const formSchema = z.object({
        conclusion: z.string().optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            conclusion: "",
        },
    })

    const options = [
        { label: "合格", value: "√" },
        { label: "见证确认", value: "▽" },
        { label: "无此项", value: "／" },
        { label: "不合格", value: "×" },
        { label: "无法检测", value: "△" },
    ]

    return (
        <div className="max-w-md mx-auto p-6">
            <Form {...form}>
                <form className="space-y-6">
                    <FormField
                        control={form.control}
                        name="conclusion"
                        render={({ field }) => (
                            <FormItem className="w-full break-inside-avoid">
                                <FormLabel>检查结论</FormLabel>
                                <FormControl>
                                    <ClearableSelect
                                        field={field}
                                        options={options}
                                        placeholder="选单项的结论"
                                        onClear={() => {
                                            // 清除选择的值
                                            form.setValue("conclusion", "")
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            {/* 显示当前值（用于调试） */}
            <div className="mt-4 p-4 border rounded">当前值: {form.watch("conclusion") || "无"}</div>
        </div>
    )
}
