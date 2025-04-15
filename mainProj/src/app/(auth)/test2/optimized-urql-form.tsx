"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "urql"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { toast } from "sonner" // 导入 sonner 的 toast 函数
// import { toast } from "@/components/ui/use-toast"

// GraphQL 变更操作
const SUBMIT_FORM_MUTATION = `
  mutation SubmitForm($input: FormInput!) {
    submitForm(input: $input) {
      id
      status
      message
      # 其他返回字段
    }
  }
`

// 动态表单组件
export default function DynamicForm({ formFields, initialData = {} }) {
  // 创建动态 schema
  const generateSchema = () => {
    const schemaFields = {}

    formFields.forEach((field) => {
      // 根据字段类型设置不同的验证规则
      switch (field.type) {
        case "text":
          schemaFields[field.name] = field.required
            ? z.string().min(1, { message: `${field.label}不能为空` })
            : z.string().optional()
          break
        case "select":
          schemaFields[field.name] = field.required
            ? z.string().min(1, { message: `请选择${field.label}` })
            : z.string().optional()
          break
        // 可以添加更多字段类型
        default:
          schemaFields[field.name] = z.string().optional()
      }
    })

    return z.object(schemaFields)
  }

  const formSchema = generateSchema()
  type FormValues = z.infer<typeof formSchema>

  // 设置表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  // URQL mutation
  const [mutationResult, executeMutation] = useMutation(SUBMIT_FORM_MUTATION)
  const { fetching, error, data } = mutationResult
  //FormValues直接映射到FormInput字段模型？
  // 表单提交处理
  const onSubmit = async (values: FormValues) => {
    try {
      // 执行 GraphQL 变更
      const result = await executeMutation({
        input: values,
      })

      if (result.error) {
        toast({
          title: "提交失败",
          description: result.error.message,
          variant: "destructive",
        })
        return
      }

      // 成功处理
      toast({
        title: "提交成功",
        description: "表单数据已成功保存",
      })

      // 可以在这里处理返回的数据
      console.log("返回数据:", result.data)

      // 如果需要，可以重置表单
      // form.reset()
    } catch (err) {
      toast({
        title: "提交错误",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      })
    }
  }

  // 渲染表单字段
  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input {...formField} placeholder={field.placeholder || `请输入${field.label}`} className="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Select onValueChange={formField.onChange} value={formField.value || ""}>
                      <SelectTrigger className="w-full pr-8">
                        <SelectValue placeholder={field.placeholder || `请选择${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* 清除按钮 */}
                    {formField.value && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          form.setValue(field.name, "")
                        }}
                        className="absolute right-8 top-0 h-full flex items-center pr-2"
                        aria-label="清除选择"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      // 可以添加更多字段类型的渲染逻辑

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {formFields.map(renderField)}

          <Button type="submit" disabled={fetching} className="w-full">
            {fetching ? "提交中..." : "提交表单"}
          </Button>
        </form>
      </Form>

      {/* 显示提交后的数据 */}
      {data && (
        <div className="mt-6 p-4 border rounded-md bg-slate-50">
          <h3 className="font-medium mb-2">提交结果:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(data.submitForm, null, 2)}</pre>
        </div>
      )}

      {/* 显示错误信息 */}
      {error && (
        <div className="mt-6 p-4 border rounded-md bg-red-50 text-red-800">
          <h3 className="font-medium mb-2">错误:</h3>
          <p>{error.message}</p>
        </div>
      )}
    </div>
  )
}


//
"use client"

import { Provider, createClient } from "urql"
import DynamicForm from "./optimized-urql-form"

// 创建 URQL 客户端
const client = createClient({
  url: "/api/graphql", // 您的 GraphQL 端点
})

// 表单字段定义
const formFields = [
  {
    name: "name",
    label: "姓名",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "电子邮件",
    type: "text",
    required: true,
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    required: true,
    options: [
      { label: "合格", value: "√" },
      { label: "见证确认", value: "▽" },
      { label: "无此项", value: "／" },
      { label: "不合格", value: "×" },
      { label: "无法检测", value: "△" },
    ],
  },
  // 可以添加更多字段
]

// 初始数据（可选）
const initialData = {
  name: "",
  email: "",
  status: "",
}

export default function FormPage() {
  return (
      <Provider value={client}>
        <div className="container mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6">动态表单示例</h1>
          <DynamicForm formFields={formFields} initialData={initialData} />
        </div>
      </Provider>
  )
}
