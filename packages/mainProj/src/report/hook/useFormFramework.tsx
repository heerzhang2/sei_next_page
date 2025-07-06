"use client"

import type * as React from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, CardFooter, Form } from "@/components/ui"
import { useMutation } from "@urql/next"
import { OriginalDataMutation } from "../common/base"
import { toast } from "sonner"
import { useStorage } from "@/report/StorageContext"
import { useFieldArrays } from "./useFieldArrays"
import { useState } from "react"
import { Save } from "lucide-react"

interface UseFormFrameworkProps {
  // 接收外部传入的schema和默认值
  schema: z.ZodObject<any>
  defaultValues: Record<string, any>

  //[可选方式之一] 接收外部传入的内容渲染函数工厂
  contentRendererFactory?: (form: any, arrays?: Record<string, any>) => React.ReactNode

  // 数组字段配置
  arrayFields?: {
    name: string //每一张表格存储名；
    itemTemplate: any
  }[]

  // 其他参数
  rep?: any
  onSubmit?: (values: any) => Promise<void>
  //独立流转的：那个最终的实体存储报告
  subrid?: string
  //可重复分项
  redId?: number
  //分项报告的： 独立流转，或者非独立的可重复分项目存储 [_modType_1]: ;
  modType?: string
}
/**报告的编辑器表单框架
 * */
export function useFormFramework({
                                   schema,
                                   defaultValues,
                                   contentRendererFactory,
                                   arrayFields = [],
                                   rep,
                                   onSubmit: customOnSubmit,
                                   subrid,
                                   redId,
                                   modType,
                                 }: UseFormFrameworkProps) {
  const { storage, setStorage, setModified } = useStorage()

  // 创建表单
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  // 使用自定义 hook 处理数组字段
  const arrayControls = useFieldArrays(form.control, arrayFields)

  //用URQL mutation来保存变更数据到后端数据库的
  const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)

  //保存：处理表单提交
  const handleSubmit = async (values: any) => {
    if (customOnSubmit) {
      await customOnSubmit(values)
      return
    }
    // 默认提交处理
    console.log("表单值:", JSON.stringify(values, null, 2), "需排除掉")
    const oldStore = storage?.[`_${modType}_${redId}`]
    //这个办法是可以把内部嵌套的属性字段 设置为undefined 等同删除该键值的，做法可行。
    //存储到可重复分项的专用位置：

    // 数据清理函数：移除空字符串字段
    const cleanEmptyFields = (obj: any): any => {
      if (Array.isArray(obj)) {
        // 如果是数组，递归清理每个元素
        return obj
            .map((item) => cleanEmptyFields(item))
            .filter((item) => {
              // 如果清理后的对象为空或只包含空值，则过滤掉
              if (typeof item === "object" && item !== null) {
                const keys = Object.keys(item)
                return (
                    keys.length > 0 && keys.some((key) => item[key] !== "" && item[key] !== null && item[key] !== undefined)
                )
              }
              return item !== "" && item !== null && item !== undefined
            })
      } else if (typeof obj === "object" && obj !== null) {
        // 如果是对象，递归清理每个属性
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== "" && value !== null && value !== undefined) {
            const cleanedValue = cleanEmptyFields(value)
            // 只有清理后的值不为空才添加到结果中
            if (cleanedValue !== "" && cleanedValue !== null && cleanedValue !== undefined) {
              // 对于数组，如果清理后长度为0，则不添加
              if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                continue
              }
              // 对于对象，如果清理后没有属性，则不添加
              if (
                  typeof cleanedValue === "object" &&
                  !Array.isArray(cleanedValue) &&
                  Object.keys(cleanedValue).length === 0
              ) {
                continue
              }
              cleaned[key] = cleanedValue
            }
          }
        }
        return cleaned
      }
      return obj
    }

    // 清理表单数据
    const cleanedValues = cleanEmptyFields(values)
    console.log("清理前的表单值:", JSON.stringify(values, null, 2))
    console.log("清理后的表单值:", JSON.stringify(cleanedValues, null, 2))

    const {
      _version,
      "": _omit,
      ...RepData
    } = subrid || (modType && redId !== undefined)
        ? { ...storage, [`_${modType}_${redId}`]: { ...oldStore, ...cleanedValues } }
        : { ...storage, ...cleanedValues }

    // 直接定义更新函数，不使用 useCallback
    const update = async () => {
      return await updateOriginal({
        id: subrid ?? rep?.id,
        operationType: 1,
        version: _version,
        data: JSON.stringify(RepData),
      })
    }

    update().then((result) => {
      console.log("updateOriginalResult=应答=", result)
      if (result.error) {
        toast.error("保存失败,若断网会自动重新发送的", {
          description: result.error.toString(),
        })
        console.log("Oh no!", result.error)
      } else {
        toast.success("保存成功", {
          description: "数据已成功保存到服务器",
        })
        // 保存成功后，设置 modified 为 false
        setModified(false)
      }
    })
  }

  //同步或确认操作：处理确认按钮 - 临时保存到 storage
  const handleConfirm = () => {
    // 获取当前表单值
    const currentValues = structuredClone(form.getValues())
    // 更新 storage
    if (subrid || (modType && redId !== undefined)) {
      setStorage((prevStorage: any) => {
        const oldStore = prevStorage?.[`_${modType}_${redId}`]
        return {
          ...prevStorage,
          [`_${modType}_${redId}`]: { ...oldStore, ...currentValues },
        }
      })
    } else {
      setStorage((prevStorage: any) => ({
        ...prevStorage,
        ...currentValues,
      }))
    }
    // 设置已修改标志
    setModified(true)
  }

  // 使用contentRendererFactory创建内容渲染器
  const contentRenderer = contentRendererFactory ? contentRendererFactory(form, arrayControls) : null

  // 创建渲染函数 把@container上移给CollapsibleFormSection
  const render = (node: any) => (
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {contentRenderer}
            {node}
            <CardFooter className="flex flex-col justify-between border-t p-6 space-y-4">
              {Object.keys(form.formState.errors || {}).length > 0 && (
                  <div className="bg-red-300 px-1 py-1 rounded-md text-sm break-all">
                    报错: {JSON.stringify(form.formState.errors)}
                  </div>
              )}
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  重置
                </Button>
                <Button type="button" variant="outline" onClick={handleConfirm}>
                  确认
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "保存到后端..." : "保存"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </>
  )

  return {
    form,
    render,
    handleSubmit,
    arrayControls,
    handleConfirm,
  }
}

// 创建一个修改指示器组件
export const ModificationIndicator = () => {
  const { modified } = useStorage()
  if (!modified) return null
  return (
      <div className="fixed top-4 left-10 z-50 bg-yellow-500 border border-pink-900 text-black px-1 py-1 rounded-lg shadow-xl animate-pulse">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-spin-slow"></div>
        </div>
      </div>
  )
}
/**报告的编辑器表单-工具条
 */
interface UseFrameEditorBarProps {
  rep?: any
  values: Record<string, any>
  onVerify?: (values: any) => boolean
  onReset?: () => void
  //分项报告的： 独立流转，或者非独立的可重复分项目存储 [_modType_1]: ;
  //不是独立流转的可重复分项其它情形没有subrType【所以】不采用的useStorage()中的subrType来取代。
  modType?: string
  //独立流转的：那个最终的实体存储报告
  subrid?: string
  //可重复分项
  redId?: number
  //逻辑上优先！强调确保是根路径存储的； #针对分项控制器的特别情况的：不嵌套。
  root?: boolean
}
/**
 * 支持声明 modType && redId 或者subrid 来申明存储的实际位置转移：存储到分项数据结构中。
 * */
export function useFrameEditorBar({
                                    rep,
                                    values,
                                    onReset,
                                    onVerify,
                                    subrid,
                                    redId,
                                    modType,
                                    root,
                                  }: UseFrameEditorBarProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { storage, setStorage, setModified } = useStorage()
  //用URQL mutation来保存变更数据到后端数据库的
  const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)
  //保存：处理表单提交
  const handleSubmit = async () => {
    if (onVerify && !onVerify(values)) return
    // 默认提交处理
    console.log("表单值:", JSON.stringify(values, null, 2), "需排除掉w")

    // 数据清理函数：移除空字符串字段
    const cleanEmptyFields = (obj: any): any => {
      if (Array.isArray(obj)) {
        // 如果是数组，递归清理每个元素
        return obj
            .map((item) => cleanEmptyFields(item))
            .filter((item) => {
              // 如果清理后的对象为空或只包含空值，则过滤掉
              if (typeof item === "object" && item !== null) {
                const keys = Object.keys(item)
                return (
                    keys.length > 0 && keys.some((key) => item[key] !== "" && item[key] !== null && item[key] !== undefined)
                )
              }
              return item !== "" && item !== null && item !== undefined
            })
      } else if (typeof obj === "object" && obj !== null) {
        // 如果是对象，递归清理每个属性
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== "" && value !== null && value !== undefined) {
            const cleanedValue = cleanEmptyFields(value)
            // 只有清理后的值不为空才添加到结果中
            if (cleanedValue !== "" && cleanedValue !== null && cleanedValue !== undefined) {
              // 对于数组，如果清理后长度为0，则不添加
              if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                continue
              }
              // 对于对象，如果清理后没有属性，则不添加
              if (
                  typeof cleanedValue === "object" &&
                  !Array.isArray(cleanedValue) &&
                  Object.keys(cleanedValue).length === 0
              ) {
                continue
              }
              cleaned[key] = cleanedValue
            }
          }
        }
        return cleaned
      }
      return obj
    }

    // 清理表单数据
    const cleanedValues = cleanEmptyFields(values)
    console.log("清理前的表单值:", JSON.stringify(values, null, 2))
    console.log("清理后的表单值:", JSON.stringify(cleanedValues, null, 2))

    const oldStore = storage?.[`_${modType}_${redId}`]
    //这个办法是可以把内部嵌套的属性字段 设置为undefined 等同删除该键值的，做法可行。
    // const { _version, "":_omit, ...RepData } =(subrid || (modType && redId!==undefined))? { ...storage,  [`_${modType}_${redId}`]: {...oldStore, "仪器编号": undefined,} } : { ...storage, ...values };
    const {
      _version,
      "": _omit,
      ...RepData
    } = (subrid || (modType && redId !== undefined)) && !root
        ? { ...storage, [`_${modType}_${redId}`]: { ...oldStore, ...cleanedValues } }
        : { ...storage, ...cleanedValues }

    // 直接定义更新函数，不使用 useCallback
    const update = async () => {
      return await updateOriginal({
        id: subrid ?? rep?.id,
        operationType: 1,
        version: _version,
        data: JSON.stringify(RepData),
      })
    }
    setIsSaving(true)
    update().then((result) => {
      console.log("updateOriginalResult=应答=", result)
      if (result.error) {
        toast.error("保存失败,若断网会自动重新发送的", {
          description: result.error.toString(),
        })
        console.log("Oh no!", result.error)
      } else {
        toast.success("保存成功", {
          description: "数据已成功保存到服务器",
        })
        // 保存成功后，设置 modified 为 false
        setModified(false)
      }
      setIsSaving(false)
    })
  }

  //同步或确认操作：处理确认按钮 - 临时保存到 storage
  const handleConfirm = () => {
    if (onVerify && !onVerify(values)) return
    // 获取当前表单值: 都在外部做修改注入的。
    const currentValues = values
    // 更新 storage
    if ((subrid || (modType && redId !== undefined)) && !root) {
      setStorage((prevStorage: any) => {
        const oldStore = prevStorage?.[`_${modType}_${redId}`]
        return {
          ...prevStorage,
          [`_${modType}_${redId}`]: { ...oldStore, ...currentValues },
        }
      })
    } else {
      setStorage((prevStorage: any) => ({
        ...prevStorage,
        ...currentValues,
      }))
    }
    // 设置已修改标志
    setModified(true)
  }

  // 创建渲染函数
  const render = () => (
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          重置
        </Button>
        <Button type="button" variant="outline" onClick={handleConfirm}>
          确认
        </Button>
        <Button type="submit" disabled={isSaving} onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "保存到后端..." : "保存"}
        </Button>
      </div>
  )
  return [render]
}
