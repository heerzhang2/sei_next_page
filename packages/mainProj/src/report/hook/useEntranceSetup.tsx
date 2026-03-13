"use client"
import * as React from "react"
import { z } from "zod"
import { useStorage } from "@/report/StorageContext"
import { assertNamesUnique } from "@/report/common/eHelper"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { BlobInputList } from "@/components/chub"

/**
 * 用于 EntranceSetup 组件的通用 hook，避免重复的类似的代码
 * 提供 schema 验证、默认值和名称冲突检查功能
 */
export function useEntranceSetup(rep?: any) {
    const { storage } = useStorage()
    // 第一段：schema 定义
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        schemaFields["_tblFixed"] = z
            .string()
            .optional()
            .refine(
                (value) => {
                    if (!value) return true
                    try {
                        JSON.parse(value)
                        return true
                    } catch {
                        return false
                    }
                },
                { message: "字段必须为有效的 JSON 字符串" },
            )
        return z.object(schemaFields)
    }, [])

    // 第二段：默认值
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["_tblFixed"] = storage["_tblFixed"]
        return fields
    }, [storage])

    // 名称冲突检查函数
    const doCheckNames = React.useCallback(
        (e: React.MouseEvent, rep: any, additionalConfigs: Array<{ value: any; type?: string }> = []) => {
            const result = assertNamesUnique([
                { value: rep?.tzFields },
                ...additionalConfigs,
            ])
            if (result) {
                toast.success("完成", { description: "没冲突" })
            } else {
                toast.error("完成", { description: "冲突" })
            }
            e.preventDefault()
        },
        [],
    )

    return {
        schema,
        defaultValues,
        doCheckNames,
    }
}


interface DevToolsSectionProps {
    /** 表单控制器 */
    form: any
    /** 名称冲突检查函数 */
    onCheckNames: (e: React.MouseEvent) => void
    /** 是否显示开发工具（默认根据环境变量判断） */
    show?: boolean
    /** 自定义标题 */
    title?: string
    /** 自定义按钮文本 */
    buttonText?: string
    /** 自定义字段标签 */
    fieldLabel?: string
    /** 输入框行数 */
    rows?: number
}

/**
 * 开发工具区域组件
 * 用于在开发环境下显示调试和测试工具
 */
export function DevToolsSection({
                                    form,
                                    onCheckNames,
                                    show = process.env.NEXT_PUBLIC_APP_TEST === "true",
                                    title = "构建开发模板时的工具：校验模板的存储name冲突；",
                                    buttonText = "校验模板name唯一性",
                                    fieldLabel = "设置待测试表格的各列宽度：",
                                    rows = 2,
                                }: DevToolsSectionProps) {
    if (!show) {
        return null
    }

    return (
        <div>
            <h5>{title}</h5>
            <Button onClick={onCheckNames}>{buttonText}</Button>
            <FormField
                control={form.control}
                name="_tblFixed"
                render={({ field }) => (
                    <FormItem className="pt-2 w-full break-inside-avoid">
                        <FormLabel className="select-text">{fieldLabel}</FormLabel>
                        <FormControl className="w-full">
                            <BlobInputList rows={rows} {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
