"use client"

import React, {useEffect} from "react"
import { MemoDatesInput} from "@/components/chub"
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
  // 动态合并基础schema和动态字段fullSchema:不能假如表单中不存在但是验证报错的字段，否则提交不会出错全都没提示的。
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
   // 处理表单提交
    async function onSubmit(values: any) {
        console.log("表单值:", values)
        // 模拟API调用 - form.formState.isSubmitting 会在这个Promise完成后变为false
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

  return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">员工信息表单</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CardContent className="space-y-6 @container">
               <h3 className="text-lg font-medium">基本信息</h3>

                <div  className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4" >
                   <FormField
                        key={'fullName'}
                        control={form.control}
                        name={'fullName' as any}
                        render={({ field }) => (
                            <FormItem className="w-full break-inside-avoid">
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
                            <FormItem className="w-full break-inside-avoid">
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
                          <FormItem className="w-full break-inside-avoid">
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
                            <FormItem className="w-full break-inside-avoid">
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
                          <FormItem className="w-full break-inside-avoid">
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
                </div>

              </CardContent>
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
        </Card>
      </div>
  )
}
