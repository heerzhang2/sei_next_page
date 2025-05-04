"use client"

import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { useTableEditor } from "@/report/hook/use-table-editor"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCallback } from "react"
import { useStorage } from "@/report/StorageContext"

const baseSchema = z.object({
  products: z
      .array(
          z.object({
            id: z.string().optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            stock: z.string().optional(),
          }),
      )
      .optional()
      .default([]),
})

export type Each_ZdSetting = [
  n1: string, // 字段标题名
  f2: string, // 数据库标签
  l3: number, // 布局的像素宽度
  extend?: any, // 扩充配置解析对象： 编辑器的: { t日期, u单位, l预定列表, s框的大小 ；  cb:？,}}
  park?: string, // 对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；
]

export default function TableEditorExample() {
  // Example configuration
  const config: Each_ZdSetting[] = [
    ["ID", "id", 20],
    ["名称", "name", 50],
    ["描述", "description", 90],
    ["价格", "price", 40],
    ["库存", "stock", 60],
  ]

  const tableDefvals = [
    { id: "1", name: "产品1", description: "这是产品1的描述", price: "100", stock: "50" },
    { id: "2持续和", name: "产品2", description: "这是产品2的描述这儿77童是产品2的描述", price: "200", stock: "30" },
    { id: "3", name: "这是产品3的描述", description: "这是产品3的描述", price: "150", stock: "20" },
    { id: "4和续", name: "产品2", description: "", price: "200", stock: "这是产品2的描述30" },
    { id: "5hh", name: "产品3", description: "这是产品3的描述", price: "150", stock: "20和规范5555化" },
    { id: "6", name: "产品3", description: "这述", price: "这是产品2的描述150", stock: "20" },
    { id: "7续", name: "这是产品3的描述这是产品3的描述", description: "这是产品2的描述", price: "200", stock: "30" },
    { id: "8的h", name: "产品3", description: "这是产品3的描述", price: "150", stock: "20" },
    { id: "9", name: "产风格非官方品3", description: "这是的描述", price: "150体育体育", stock: "20" },
  ]

  const form = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      products: tableDefvals,
    },
  })

  const { fields, append, remove, move, insert } = useFieldArray({
    control: form.control,
    name: "products",
  })

  const { storage, setStorage, modified, setModified } = useStorage()

  // 创建一个处理外部数据变更的回调
  const handleExternalDataChange = useCallback(
      (newData) => {
        // 更新 form 的值，但只在数据真正变化时
        if (newData.products) {
          const currentProducts = form.getValues("products")
          const isEqual = JSON.stringify(currentProducts) === JSON.stringify(newData.products)

          if (!isEqual) {
            form.setValue("products", newData.products)
          }
        }
      },
      [form],
  )

  // 添加自定义样式配置
  const [renderTable] = useTableEditor({
    config,
    table: "products",
    headview: <h2 className="text-xl font-bold mb-4">产品列表</h2>,
    tailview: <div className="mt-4 text-sm text-muted-foreground">总共 {fields.length} 条记录</div>,
    defFixedLay: true,
    defaultV: tableDefvals,
    styleConfig: {
      tableSeparation: "gap-4", // 增加表格间距
    },
    externalData: storage, // 传递外部数据
    onExternalDataChange: handleExternalDataChange, // 传递外部数据变更回调
  })

  // 提交表单，这里可以做最终的数据保存
  const handleSubmit = useCallback(() => {
    const values = form.getValues()
    console.log("提交数据:", values)
    // 可以在这里发送到服务器
  }, [form])

  // 修改 handleConfirm 函数，添加防抖
  const handleConfirm = useCallback(() => {
    // 获取当前表单值
    const currentValues = form.getValues()

    // 检查是否真的有变化
    const isEqual = JSON.stringify(storage) === JSON.stringify(currentValues)
    if (!isEqual) {
      // 更新 storage
      setStorage((prevStorage) => ({
        ...prevStorage,
        ...currentValues,
      }))

      // 设置已修改标志
      setModified(true)
    }
  }, [form, setStorage, setModified, storage])

  return (
      <div className="container mx-auto p-4">
        <FormProvider {...form}>
          <form className="space-y-8 @container">
            {renderTable(form, { products: { fields, append, remove, move, insert } })}

            <div className="mt-8">
              <Button type="button" onClick={handleSubmit}>
                保存所有更改
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
  )
}
