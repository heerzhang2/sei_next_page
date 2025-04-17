"use client"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, CardFooter, Form } from "@/components/ui"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect } from "react"

// 1. 定义正确的 schema
const formSchema = z.object({
  field1: z.string(),
  // 定义数组对象的 schema，每个对象有多个字段
  field2: z.array(
    z.object({
      a: z.string().optional(),
      b: z.string().optional(),
      c: z.string().optional(),
      d: z.string().optional(),
      e: z.string().optional(),
      f: z.string().optional(),
    }),
  ),
})

// 类型推断
type FormValues = z.infer<typeof formSchema>

export function useFixedArrayForm() {
  // 默认值示例 - 固定3行
  const defaultValues: FormValues = {
    field1: "",
    field2: [
      { a: "", b: "", c: "" },
      { a: "", b: "", c: "" },
      { a: "", b: "", c: "" },
    ],
  }

  // 创建表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 使用 useFieldArray 来处理数组字段
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "field2",
  })

  // 确保始终有3行
  useEffect(() => {
    const currentLength = fields.length
    if (currentLength < 3) {
      // 如果少于3行，添加到3行
      for (let i = currentLength; i < 3; i++) {
        append({ a: "", b: "", c: "" })
      }
    } else if (currentLength > 3) {
      // 如果多于3行，删除多余的
      for (let i = currentLength - 1; i >= 3; i--) {
        remove(i)
      }
    }
  }, [fields.length, append, remove])

  // 提交处理
  const onSubmit = (values: FormValues) => {
    console.log("提交的值:", values)
    // 这里可以处理表单提交逻辑
  }

  // 渲染表单
  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 普通字段 */}
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>字段1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 固定3行的表格形式数组对象字段 */}
        <div className="space-y-4">
          <FormLabel className="text-lg font-medium">多字段表格</FormLabel>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>字段A</TableHead>
                <TableHead>字段B</TableHead>
                <TableHead>字段C</TableHead>
                <TableHead>字段d</TableHead>
                <TableHead>字段e</TableHead>
                <TableHead>字段f</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">行 {index + 1}</TableCell>

                  {/* 字段 a */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`field2.${index}.a`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input {...field} placeholder="请输入字段A" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* 字段 b */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`field2.${index}.b`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input {...field} placeholder="请输入字段B" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* 字段 c */}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`field2.${index}.c`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input {...field} placeholder="请输入字段C" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  {/* 字段 d */}
                  <TableCell>
                    <FormField
                        control={form.control}
                        name={`field2.${index}.d`}
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input {...field} placeholder="请输入字段d" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </TableCell>

                  {/* 字段 e */}
                  <TableCell>
                    <FormField
                        control={form.control}
                        name={`field2.${index}.e`}
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input {...field} placeholder="请输入字段e" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </TableCell>

                  {/* 字段 f */}
                  <TableCell>
                    <FormField
                        control={form.control}
                        name={`field2.${index}.f`}
                        render={({ field }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input {...field} placeholder="请输入字段f" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </TableCell>


                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <CardFooter className="flex justify-end space-x-4 border-t p-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            重置
          </Button>
          <Button type="submit">提交</Button>
        </CardFooter>
      </form>
    </Form>
  )

  return {
    form,
    renderForm,
    fields,
  }
}
