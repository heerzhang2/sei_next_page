"use client"

import { useFieldArray } from "react-hook-form"
import type { Control } from "react-hook-form"

interface ArrayField {
  name: string
  itemTemplate: any
}

/**最多支持 字段数=8，也就是8张表的；
 * 自定义 Hook 用于处理多个字段数组
 * 这个 Hook 遵循 React Hooks 规则，在顶层调用所有需要的 useFieldArray
 */
export function useFieldArrays(control: Control<any>, arrayFields: ArrayField[] = []) {
  if(arrayFields.length>8)  throw new Error(`表数超限`);
  // 创建一个对象来存储所有数组控制器
  const arrayControls: Record<string, any> = {}

  // 为每个字段单独调用 useFieldArray
  // 这样确保所有 hooks 都在顶层被调用

  // 字段 0
  const fieldArray0 = useFieldArray({
    control,
    name: arrayFields[0]?.name || "",
  })
  arrayControls[arrayFields[0]?.name] = fieldArray0

  // 字段 1
  const fieldArray1 = useFieldArray({
    control,
    name: arrayFields[1]?.name || "",
  })
  arrayControls[arrayFields[1]?.name] = fieldArray1

  // 字段 2
  const fieldArray2 = useFieldArray({
    control,
    name: arrayFields[2]?.name || "",
  })
  arrayControls[arrayFields[2]?.name] = fieldArray2

  // 字段 3
  const fieldArray3 = useFieldArray({
    control,
    name: arrayFields[3]?.name || "",
  })
  arrayControls[arrayFields[3]?.name] = fieldArray3

  // 字段 4
  const fieldArray4 = useFieldArray({
    control,
    name: arrayFields[4]?.name || "",
  })
  arrayControls[arrayFields[4]?.name] = fieldArray4

  // 字段 5
  const fieldArray5 = useFieldArray({
    control,
    name: arrayFields[5]?.name || "",
  })
  arrayControls[arrayFields[5]?.name] = fieldArray5

  // 字段 6
  const fieldArray6 = useFieldArray({
    control,
    name: arrayFields[6]?.name || "",
  })
  arrayControls[arrayFields[6]?.name] = fieldArray6

  // 字段 7
  const fieldArray7 = useFieldArray({
    control,
    name: arrayFields[7]?.name || "",
  })
  arrayControls[arrayFields[7]?.name] = fieldArray7

  // 如果需要支持更多字段，可以继续添加...
  if(arrayFields.length === 0)  return {}
  else return arrayControls
}

/*
  {
    const arrayField=arrayFields[1]
    const { fields, append, remove, move, insert } = useFieldArray({
      control: form.control,
      name: arrayField?.name || "",
    })
    if(arrayField?.name)
        arrayControls[arrayField.name] = { fields, append, remove, move, insert }
  }
* */