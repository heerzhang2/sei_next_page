"use client"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, CardFooter, Form } from "@/components/ui"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStorage } from "@/report/StorageContext"
import { useMutation } from "@urql/next"
import { OriginalDataMutation } from "@/report/common/base"
import { toast } from "sonner"

interface UseMultiTableFormProps {
  config: [string, string][]
  fieldConfig: [string, string][]
  fieldNames: string[]
  textFields: string[]
  rep?: any
}

export function useMultiTableForm({ config, fieldConfig, fieldNames, textFields, rep }: UseMultiTableFormProps) {
  const { storage } = useStorage()

  // 1. 创建动态 schema
  const schema = React.useMemo(() => {
    const schemaFields = {} as any

    // 添加普通字段
    textFields.forEach((namecfg) => {
      schemaFields[namecfg] = z.string().optional()
    })

    // 添加表格字段
    config.forEach(([name]) => {
      const schemaTab = {} as any
      fieldNames.forEach((field) => {
        schemaTab[field] = z.string().optional()
      })
      schemaFields[name] = z.array(z.object(schemaTab))
    })

    return z.object(schemaFields)
  }, [config, fieldNames, textFields])

  // 2. 计算默认值
  const defaultValues = React.useMemo(() => {
    const fields = {} as any

    // 初始化普通字段
    textFields.forEach((name) => {
      fields[name] = storage[name] ?? ""
    })

    // 初始化表格字段
    config.forEach(([name]) => {
      // 从storage中获取数据，如果没有则创建3行空数据
      const tableData = storage[name] || []

      // 确保每个表格都有3行数据
      const rows = []
      for (let i = 0; i < 3; i++) {
        const row = tableData[i] || {}
        const newRow = {} as any

        // 确保每行都有所有字段
        fieldNames.forEach((field) => {
          newRow[field] = row[field] || ""
        })

        rows.push(newRow)
      }

      fields[name] = rows
    })

    return fields
  }, [storage, config, fieldNames, textFields])

  // 创建表单
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // 设置mutation
  const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    console.log("表单值:", JSON.stringify(values, null, 2))
    const { _version, ...RepData } = { ...storage, ...values }

    const update = async () => {
      return await updateOriginal({
        id: rep?.id,
        operationType: 1,
        version: _version,
        data: JSON.stringify(RepData),
      })
    }

    update().then((result) => {
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

  // 渲染表单 - 卡片布局
  const renderCardLayout = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 @container">
        {/* 普通文本域字段 */}
        {textFields.map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="pt-2 w-full break-inside-avoid">
                <FormLabel>{fieldName}：</FormLabel>
                <FormControl className="w-full">
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* 使用Tabs组件来展示多个表格 */}
        <Tabs defaultValue={config[0][0]} className="w-full mt-6">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${config.length}, 1fr)` }}>
            {config.map(([name, title]) => (
              <TabsTrigger key={name} value={name}>
                {title}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.map(([name, title]) => (
            <TabsContent key={name} value={name} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{title}加速度测量</CardTitle>
                </CardHeader>
                <CardContent>
                  {[0, 1, 2].map((index) => (
                    <Card key={index} className="p-4 mb-4">
                      <CardContent className="p-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {fieldConfig.map(([field, fieldTitle]) => (
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
          ))}
        </Tabs>

        <CardFooter className="flex justify-end space-x-4 border-t p-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            重置
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "提交中..." : "提交表单"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )

  // 渲染表单 - 表格布局
  const renderTableLayout = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 @container">
        {/* 普通文本域字段 */}
        {textFields.map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem className="pt-2 w-full break-inside-avoid">
                <FormLabel>{fieldName}：</FormLabel>
                <FormControl className="w-full">
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* 使用Tabs组件来展示多个表格 */}
        <Tabs defaultValue={config[0][0]} className="w-full mt-6">
          <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${config.length}, 1fr)` }}>
            {config.map(([name, title]) => (
              <TabsTrigger key={name} value={name}>
                {title}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.map(([name, title]) => (
            <TabsContent key={name} value={name} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{title}加速度测量</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>测点</TableHead>
                        {fieldConfig.map(([_, fieldTitle]) => (
                          <TableHead key={fieldTitle}>{fieldTitle}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[0, 1, 2].map((index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">测点 {index + 1}</TableCell>

                          {fieldConfig.map(([field]) => (
                            <TableCell key={field}>
                              <FormField
                                control={form.control}
                                name={`${name}.${index}.${field}`}
                                render={({ field: formField }) => (
                                  <FormItem className="space-y-0">
                                    <FormControl>
                                      <Input {...formField} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <CardFooter className="flex justify-end space-x-4 border-t p-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
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
    renderCardLayout,
    renderTableLayout,
    handleSubmit,
  }
}
