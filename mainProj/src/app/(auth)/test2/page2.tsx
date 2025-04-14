"use client"

import { cn } from "@/lib/utils"

import React, {useEffect} from "react"
import { useState } from "react"
import {LineColumn, MemoDatesInput} from "@/components/chub"
import { FormField } from "@/components/shub"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";

// 定义表单数据类型
interface FormData {
  [key: string]: any
}

// 定义验证错误类型
interface FormErrors {
  [key: string]: string
}

export default function FormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 动态合并基础schema和动态字段
  const fullSchema = z.object({
    name: z.string().min(2, { message: "姓名至少需要2个字符" }),
    email: z.string().email({ message: "请输入有效的电子邮件地址" }),
    role: z.string().min(1, { message: "请选择一个角色" }),
    bio: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
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
    agreeToTerms: false,
  }
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
                  <FormField id="fullName" label="姓名" required error={errors.fullName}>
                    <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        aria-invalid={!!errors.fullName}
                    />
                  </FormField>

                  <FormField id="email" label="邮箱" required error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        aria-invalid={!!errors.email}
                    />
                  </FormField>

                  <FormField id="phone" label="电话" required error={errors.phone}>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        aria-invalid={!!errors.phone}
                    />
                  </FormField>
                </LineColumn>

                <h3 className="text-lg font-medium pt-4">职位信息</h3>
                <LineColumn width={300}>
                  <FormField id="department" label="部门" required error={errors.department}>
                    <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                      <SelectTrigger id="department" aria-invalid={!!errors.department}>
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
                  </FormField>

                  <FormField id="position" label="职位" required error={errors.position}>
                    <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleChange("position", e.target.value)}
                        aria-invalid={!!errors.position}
                    />
                  </FormField>

                  <FormField id="startDate" label="入职日期" required error={errors.startDate}>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        aria-invalid={!!errors.startDate}
                    />
                  </FormField>
                </LineColumn>

                <LineColumn width={300}>
                  <FormField id="salary" label="薪资" error={errors.salary}>
                    <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => handleChange("salary", e.target.value)}
                        aria-invalid={!!errors.salary}
                    />
                  </FormField>

                  <FormField id="employmentType" label="雇佣类型" error={errors.employmentType}>
                    <Select
                        value={formData.employmentType}
                        onValueChange={(value) => handleChange("employmentType", value)}
                    >
                      <SelectTrigger id="employmentType">
                        <SelectValue placeholder="选择雇佣类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullTime">全职</SelectItem>
                        <SelectItem value="partTime">兼职</SelectItem>
                        <SelectItem value="contract">合同工</SelectItem>
                        <SelectItem value="intern">实习生</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                </LineColumn>
                <FormField id="importantDates" label="重要日期" error={errors.importantDates}>
                  <MemoDatesInput
                      id="importantDates"
                      value={formData.importantDates}
                      onChange={(value) => handleChange("importantDates", value)}
                      rows={2}
                      width="100%"
                      placeholder="输入重要日期"
                  />
                </FormField>

                <h3 className="text-lg font-medium pt-4">其他信息</h3>
                <LineColumn width={300}>
                  <FormField id="address" label="地址" error={errors.address}>
                    <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        aria-invalid={!!errors.address}
                    />
                  </FormField>

                  <FormField id="急联人" label="紧急联系人" error={errors.急联人}>
                    <Input
                        id="急联人"
                        value={formData.急联人}
                        onChange={(e) => handleChange("急联人", e.target.value)}
                        aria-invalid={!!errors.急联人}
                    />
                  </FormField>
                </LineColumn>

                <FormField id="skills" label="技能和资质" error={errors.skills}>
                  <Textarea
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => handleChange("skills", e.target.value)}
                      aria-invalid={!!errors.skills}
                  />
                </FormField>

                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleChange("agreeToTerms", checked === true)}
                  />
                  <label
                      htmlFor="agreeToTerms"
                      className={cn(
                          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                          errors.agreeToTerms && "text-red-500",
                      )}
                  >
                    我同意所有条款和条件
                  </label>
                </div>
                {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

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
