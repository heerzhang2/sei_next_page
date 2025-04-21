"use client"
import * as React from "react"
import { z } from "zod"
import { useFormFramework } from "@/report/hook/useFormFramework-with-arrays"
import { CollapsibleFormSection } from "@/components/chub"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStorage } from "@/report/StorageContext"

export default function MultiTableFormExample() {
    const { storage } = useStorage()

    // 配置常量
    const config加速度 = [
        ["加空载", "空载"],
        ["加满载", "满载"],
        ["加偏载", "偏载"],
        ["加他况", "其他载荷工况"],
    ]

    const AxyzNm = ["a", "b", "c", "d", "e", "f"]
    const AxyzCfg = [
        ["a", "X方向"],
        ["b", "Y方向"],
        ["c", "Z方向"],
        ["d", "合成加速度"],
        ["e", "测点位置"],
        ["f", "备注"],
    ]

    const itemA加速 = ["加速备注"]

    // 1. 创建动态 schema
    const schema = React.useMemo(() => {
        const schemaFields = {} as any

        // 添加普通字段
        itemA加速.forEach((namecfg) => {
            schemaFields[namecfg] = z.string().optional()
        })

        // 添加表格字段
        config加速度.forEach(([name]) => {
            const schemaTab = {} as any
            AxyzNm.forEach((field) => {
                schemaTab[field] = z.string().optional()
            })
            schemaFields[name] = z.array(z.object(schemaTab))
        })

        return z.object(schemaFields)
    }, [])

    // 2. 计算默认值
    const defaultValues = React.useMemo(() => {
        const fields = {} as any

        // 初始化普通字段
        itemA加速.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })

        // 初始化表格字段
        config加速度.forEach(([name]) => {
            // 从storage中获取数据，如果没有则创建3行空数据
            const tableData = storage[name] || []

            // 确保每个表格都有3行数据
            const rows = []
            for (let i = 0; i < 3; i++) {
                const row = tableData[i] || {}
                const newRow = {} as any

                // 确保每行都有所有字段
                AxyzNm.forEach((field) => {
                    newRow[field] = row[field] || ""
                })

                rows.push(newRow)
            }

            fields[name] = rows
        })

        return fields
    }, [storage])

    // 3. 定义数组字段配置
    const arrayFields = React.useMemo(() => {
        //有多张表格的：
        return config加速度.map(([name]) => {
            // 创建每个字段的空模板
            const itemTemplate = {} as any
            AxyzNm.forEach((field) => {
                itemTemplate[field] = ""
            })

            return {
                name,
                itemTemplate,
            }
        })
    }, [])

    // 4. 创建内容渲染器工厂函数
    const contentRendererFactory = (form: any, arrays?: Record<string, any>) => {
        // 确保每个表格都有3行
        config加速度.forEach(([name]) => {
            const tableArray = arrays![name]
            if (tableArray) {
                const currentLength = tableArray.fields.length
                if (currentLength < 3) {
                    // 如果少于3行，添加到3行
                    const template = {} as any
                    AxyzNm.forEach((field) => {
                        template[field] = ""
                    })

                    for (let i = currentLength; i < 3; i++) {
                        tableArray.append(template)
                    }
                } else if (currentLength > 3) {
                    // 如果多于3行，删除多余的
                    for (let i = currentLength - 1; i >= 3; i--) {
                        tableArray.remove(i)
                    }
                }
            }
        })

        return (
            <>
                {/* 普通文本域字段 */}
                <FormField
                    control={form.control}
                    name="加速备注"
                    render={({ field }) => (
                        <FormItem className="pt-2 w-full break-inside-avoid">
                            <FormLabel>备注：</FormLabel>
                            <FormControl className="w-full">
                                <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 使用Tabs组件来展示多个表格 */}
                <Tabs defaultValue={config加速度[0][0]} className="w-full mt-6">
                    <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${config加速度.length}, 1fr)` }}>
                        {config加速度.map(([name, title]) => (
                            <TabsTrigger key={name} value={name}>
                                {title}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {config加速度.map(([name, title]) => {
                        const tableArray = arrays![name]

                        return (
                            <TabsContent key={name} value={name} className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{title}加速度测量</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {tableArray?.fields.map((item: any, index: number) => (
                                            <Card key={item.id} className="p-4 mb-4">
                                                <CardContent className="p-0 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {AxyzCfg.map(([field, fieldTitle]) => (
                                                            <FormField
                                                                key={field}
                                                                control={form.control}
                                                                name={`${name}.${index}.${field}`}
                                                                render={({ field: formField }) => (
                                                                    <FormItem>
                                                                        <FormLabel>{`测点 ${index + 1} ${fieldTitle}`}</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...formField} placeholder={`请输入${fieldTitle}`} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </>
        )
    }

    // 5. 使用通用表单框架hook
    const { render } = useFormFramework({
        schema,
        defaultValues,
        contentRendererFactory,
        arrayFields,
        rep: { id: "example-id" },
    })

    return (
        <CollapsibleFormSection title="加速度测量表单" defaultOpen={true}>
            {render()}
        </CollapsibleFormSection>
    )
}
