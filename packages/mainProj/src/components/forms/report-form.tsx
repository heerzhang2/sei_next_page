"use client"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PipingUnitSelector } from "@/components/piping-unit/piping-unit-selector"
import type { IPipingUnitEntity } from "@/types/piping-unit"

interface ReportFormData {
    title: string
    description: string
    units: IPipingUnitEntity[]
}

export function ReportForm() {
    const form = useForm<ReportFormData>({
        defaultValues: {
            title: "",
            description: "",
            units: [],
        },
    })

    const onSubmit = (data: ReportFormData) => {
        console.log("提交报告数据:", data)
        // 处理提交逻辑
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>创建检验报告</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>报告标题</FormLabel>
                                    <FormControl>
                                        <Input placeholder="请输入报告标题" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>报告描述</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="请输入报告描述" className="min-h-[100px]" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="units"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>选择管道单元</FormLabel>
                                    <FormControl>
                                        <PipingUnitSelector
                                            field="units"
                                            initialUnits={field.value}
                                            onSelectionChange={field.onChange}
                                            className="w-full"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline">
                                取消
                            </Button>
                            <Button type="submit">保存报告</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
