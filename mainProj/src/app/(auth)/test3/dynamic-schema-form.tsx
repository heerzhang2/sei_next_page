"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// 创建一个通用的动态表单组件
// TBaseSchema 是基础字段类型
// TDynamicFields 是动态字段类型
type DynamicFormProps<TBaseSchema extends z.ZodRawShape, TDynamicFields extends z.ZodRawShape> = {
  // 基础字段定义
  baseSchema: TBaseSchema
  // 动态字段定义 - 这些是代码中预定义的，但需要动态添加到表单中
  dynamicFields?: TDynamicFields
  // 默认值
  defaultValues?: Partial<z.infer<z.ZodObject<TBaseSchema & TDynamicFields>>>
  // 提交处理函数
  onSubmit: (values: z.infer<z.ZodObject<TBaseSchema & TDynamicFields>>) => void
  // 字段配置 - 定义每个字段如何渲染
  fieldConfigs: {
    [K in keyof (TBaseSchema & TDynamicFields)]?: {
      label: string
      placeholder?: string
      type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "custom"
      options?: { label: string; value: string }[] // 用于select类型
      component?: React.ComponentType<any> // 用于自定义组件
    }
  }
}

export function DynamicForm<TBaseSchema extends z.ZodRawShape, TDynamicFields extends z.ZodRawShape = {}>({
  baseSchema,
  dynamicFields = {} as TDynamicFields,
  defaultValues,
  onSubmit,
  fieldConfigs,
}: DynamicFormProps<TBaseSchema, TDynamicFields>) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 动态合并基础schema和动态字段
  const fullSchema = z.object({
    ...baseSchema,
    ...dynamicFields,
  })

  // 创建表单
  const form = useForm<z.infer<typeof fullSchema>>({
    resolver: zodResolver(fullSchema),
    defaultValues: defaultValues as any,
  })

  // 处理表单提交
  const handleSubmit = async (values: z.infer<typeof fullSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
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

  // 渲染表单字段
  const renderField = (name: string, config: any) => {
    switch (config.type) {
      case "text":
      case "email":
      case "password":
        return (
          <FormField
            key={name}
            control={form.control}
            name={name as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.label}</FormLabel>
                <FormControl>
                  <Input type={config.type} placeholder={config.placeholder || `Enter ${config.label}`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "textarea":
        return (
          <FormField
            key={name}
            control={form.control}
            name={name as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={config.placeholder || `Enter ${config.label}`}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "select":
        return (
          <FormField
            key={name}
            control={form.control}
            name={name as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.label}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={config.placeholder || `Select ${config.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "checkbox":
        return (
          <FormField
            key={name}
            control={form.control}
            name={name as any}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{config.label}</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )

      case "custom":
        const CustomComponent = config.component
        return (
          <FormField
            key={name}
            control={form.control}
            name={name as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{config.label}</FormLabel>
                <FormControl>
                  <CustomComponent {...field} placeholder={config.placeholder} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {Object.entries(fieldConfigs).map(([name, config]) => renderField(name, config))}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "提交表单"}
        </Button>
      </form>
    </Form>
  )
}
