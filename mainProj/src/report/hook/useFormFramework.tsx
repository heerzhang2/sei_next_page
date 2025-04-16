"use client"
//人辅助电脑去写代码的
import type * as React from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, CardFooter, Form } from "@/components/ui"
import { useMutation } from "@urql/next"
import { OriginalDataMutation } from "../common/base"
import { toast } from "sonner"
import { useStorage } from "@/report/StorageContext"

interface UseFormFrameworkProps {
  // 接收外部传入的schema和默认值
  schema: z.ZodObject<any>
  defaultValues: Record<string, any>

  // 接收外部传入的内容渲染函数工厂
  // 现在接收form作为参数，这样可以使用真实的form对象
  contentRendererFactory: (form: any) => React.ReactNode

  // 其他参数
  rep?: any
  onSubmit?: (values: any) => Promise<void>
}

export function useFormFramework({
                                   schema,
                                   defaultValues,
                                   contentRendererFactory,
                                   rep,
                                   onSubmit: customOnSubmit,
                                 }: UseFormFrameworkProps) {
  const { storage } = useStorage()

  // 创建表单
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  // 设置mutation
  const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (customOnSubmit) {
      await customOnSubmit(values)
      return
    }

    // 默认提交处理
    console.log("表单值:", JSON.stringify(values, null, 2))
    const { _version, ...RepData } = { ...storage, ...values }

    updateOriginal({
      id: rep?.id,
      operationType: 1,
      version: _version,
      data: JSON.stringify(RepData),
    }).then((result) => {
      console.log("updateOriginalResult=应答=", result)
      if (result.error) {
        toast.error("保存失败", {
          description: result.error.toString(),
        })
        console.log("Oh no!", result.error)
      } else {
        toast.success("保存成功", {
          description: "数据已成功保存到服务器",
        })
      }
    })
  }

  // 使用contentRendererFactory创建内容渲染器
  const contentRenderer = contentRendererFactory(form)

  // 创建渲染函数
  const render = () => (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 @container">
          {contentRenderer}
          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              重置
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "提交中..." : "提交表单"}
            </Button>
          </CardFooter>
        </form>
      </Form>
  )

  return {
    form,
    render,
    handleSubmit,
  }
}
