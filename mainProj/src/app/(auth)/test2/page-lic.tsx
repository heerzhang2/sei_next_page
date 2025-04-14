"use client"

import React, {useEffect} from "react"
import { useState } from "react"
import {LineColumn, MemoDatesInput} from "@/components/chub"
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

export default function FormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 动态合并基础schema和动态字段
  const fullSchema = z.object({
    fullName: z.string().min(2, { message: "姓名至少需要2个字符" }),
    email: z.string().email({ message: "请输入有效的电子邮件地址" }),
    department: z.string().min(1, { message: "请选择一个部门的" }),
    bio: z.string().optional(),
    急联人: z.boolean().refine((val) => val === true, {
      message: "您必须同意条款和条件",
    }),
    price: z.string().optional(),
    // 中文字段名示例
    测试字段1: z.string().optional(),
  })
  const defaultValues={
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
  }
  //formState: { errors },
  const form = useForm<z.infer<typeof fullSchema>>({
    resolver: zodResolver(fullSchema),
    defaultValues: defaultValues as any,
  })
  // 显示JSON结果
  const [jsonResult, setJsonResult] = useState<string>("")
  const onSubmit = (values: any) => {
    console.log("表单值:", values)
    // 模拟API调用
    setTimeout(() => {
      // 这里是您需要的JSON数据
      const jsonData = JSON.stringify(values, null, 2)
      setJsonResult(jsonData)
      setIsSubmitting(false)

      // 在实际应用中，您可以在这里调用您的API
      console.log("提交的数据:", jsonData)
    }, 1000)
    // 这里可以处理表单提交逻辑
  }
  //不能加async values）=> { await onSubmit }
  const handleSubmit =async (values: z.infer<typeof fullSchema>) => {
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


  return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">员工信息表单</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <CardContent className="space-y-6">
                <h3 className="text-lg font-medium">基本信息</h3>
                <LineColumn width={300}>
                   <FormField
                        key={'fullName'}
                        control={form.control}
                        name={'fullName' as any}
                        render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>fullName</FormLabel>
                              <FormControl    className="w-full">
                                <Input type='text' placeholder={ `Enter fullName`} {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                   />
                    <FormField
                        key={"address"}
                        control={form.control}
                        name={"address" as any}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>地---址</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={`Enter 地---址`}
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  <FormField
                      key={"department"}
                      control={form.control}
                      name={"department" as any}
                      render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>"部门"</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value} >
                                <SelectTrigger  className="w-full">
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                    <FormField
                        key={"email"}
                        control={form.control}
                        name={"email" as any}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>邮箱</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder={`Enter 邮箱`} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  <FormField
                      key={"importantDates"}
                      control={form.control}
                      name={"importantDates" as any}
                      render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>重要日期www</FormLabel>
                            <FormControl>
                              <MemoDatesInput   {...field}
                                 id="importantDates"
                                  rows={2}
                                  placeholder="输入重要日期"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </LineColumn>

                <h3 className="text-lg font-medium pt-4">其他信息</h3>
                <LineColumn width={300}>
                  <FormField
                      key={"急联人"}
                      control={form.control}
                      name={"急联人" as any}
                      render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>紧急联系人 我同意所有条款和条件</FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                      )}
                  />

                </LineColumn>

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
          </Form>
        </Card>
      </div>
  )
}
