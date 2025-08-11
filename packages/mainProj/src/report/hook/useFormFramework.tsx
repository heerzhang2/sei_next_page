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
import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { Save, AlertCircle, Pencil } from "lucide-react"
import type { Each_ZdSetting } from "@/report/hook/use-table-edit"
import { useNetworkStatus } from "@/hooks/use-network-status"

// 将空字符串转为 undefined，但保留字段
const convertEmptyToUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertEmptyToUndefined(item))
    } else if (typeof obj === "object" && obj !== null) {
        const converted: any = {}
        for (const [key, value] of Object.entries(obj)) {
            if (value === "") {
                converted[key] = undefined
            } else if (value !== null && value !== undefined) {
                converted[key] = convertEmptyToUndefined(value)
            } else {
                converted[key] = value
            }
        }
        return converted
    }
    return obj === "" ? undefined : obj
}

// 数据清理函数：移除空字符串字段、undefined字段和空数组、空对象
const cleanEmptyFields = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj
            .map((item) => cleanEmptyFields(item))
            .filter((item) => {
                if (typeof item === "object" && item !== null) {
                    const keys = Object.keys(item)
                    return (
                        keys.length > 0 && keys.some((key) => item[key] !== "" && item[key] !== null && item[key] !== undefined)
                    )
                }
                return item !== "" && item !== null && item !== undefined
            })
    } else if (typeof obj === "object" && obj !== null) {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
            if (value !== "" && value !== null && value !== undefined) {
                const cleanedValue = cleanEmptyFields(value)
                if (cleanedValue !== "" && cleanedValue !== null && cleanedValue !== undefined) {
                    if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                        continue
                    }
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

// 安全地序列化错误对象，避免循环引用
const serializeErrors = (errors: any): string => {
    try {
        const cleanErrors = (obj: any, visited = new WeakSet()): any => {
            if (obj === null || typeof obj !== "object") {
                return obj
            }

            if (visited.has(obj)) {
                return "[Circular Reference]"
            }

            visited.add(obj)

            if (Array.isArray(obj)) {
                return obj.map((item) => cleanErrors(item, visited))
            }

            const cleaned: any = {}
            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith("__") || key.includes("Fiber") || key.includes("reactInternalInstance")) {
                    continue
                }

                if (typeof value === "object" && value !== null) {
                    if (value instanceof Element || value instanceof Node) {
                        cleaned[key] = "[DOM Element]"
                    } else {
                        cleaned[key] = cleanErrors(value, visited)
                    }
                } else {
                    cleaned[key] = value
                }
            }

            visited.delete(obj)
            return cleaned
        }

        const cleanedErrors = cleanErrors(errors)
        return JSON.stringify(cleanedErrors, null, 2)
    } catch (error) {
        return `序列化错误: ${error instanceof Error ? error.message : String(error)}`
    }
}

interface FormFrameworkOptions<T> {
    initialData: T
    onSave: (data: T) => Promise<void>
    debounceTime?: number
}

export function useFormFramework<T extends object>({
                                                       initialData,
                                                       onSave,
                                                       debounceTime = 500,
                                                   }: FormFrameworkOptions<T>) {
    const { storage, setStorage, offline } = useStorage()
    const [formData, setFormData] = useState<T>(initialData)
    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // 使用 ref 来避免依赖项变化导致的死循环
    const initialDataRef = useRef(initialData)
    const onSaveRef = useRef(onSave)

    // 更新 refs
    useEffect(() => {
        initialDataRef.current = initialData
        onSaveRef.current = onSave
    }, [initialData, onSave])

    // 使用 useMemo 来稳定 formData 的初始化
    const stableFormData = useMemo(() => {
        if (storage && Object.keys(storage).length > 0) {
            return storage as T
        }
        return initialDataRef.current
    }, [storage])

    // 只在 stableFormData 真正变化时更新 formData
    useEffect(() => {
        setFormData(stableFormData)
    }, [stableFormData])

    // 处理表单数据变化
    const handleChange = useCallback((key: keyof T, value: T[keyof T]) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        setIsDirty(true)
    }, [])

    // 自动保存逻辑 - 使用 ref 来避免依赖项变化
    useEffect(() => {
        if (!isDirty) return

        const handler = setTimeout(async () => {
            setIsSaving(true)
            try {
                await onSaveRef.current(formData)
                setStorage(formData)
                setIsDirty(false)
                toast.success("自动保存成功", {
                    description: offline ? "数据已暂存本地。" : "数据已同步到服务器。",
                })
            } catch (error) {
                console.error("自动保存失败:", error)
                toast.error("自动保存失败", {
                    description: "请检查网络或稍后再试。",
                })
            } finally {
                setIsSaving(false)
            }
        }, debounceTime)

        return () => {
            clearTimeout(handler)
        }
    }, [formData, isDirty, debounceTime, setStorage, offline])

    return {
        formData,
        handleChange,
        isDirty,
        isSaving,
        offline,
    }
}

interface UseFormFrameworkProps {
    schema: z.ZodObject<any>
    defaultValues: Record<string, any>
    contentRendererFactory?: (form: any, arrays?: Record<string, any>) => React.ReactNode
    arrayFields?: {
        name: string
        itemTemplate: any
    }[]
    rep?: any
    onSubmit?: (values: any) => Promise<void>
    subrid?: string
    redId?: number
    modType?: string
}

export function useFormFrameworkLegacy({
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

    // 使用 useMemo 来稳定 defaultValues
    const stableDefaultValues = useMemo(() => {
        return defaultValues
    }, [JSON.stringify(defaultValues)])

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: stableDefaultValues as any,
    })

    const arrayControls = useFieldArrays(form.control, arrayFields)
    const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)

    const handleSubmit = useCallback(
        async (values: any) => {
            if (customOnSubmit) {
                await customOnSubmit(values)
                return
            }

            console.log("表单值:", JSON.stringify(values, null, 2), "需排除掉")
            const oldStore = storage?.[`_${modType}_${redId}`]

            const valuesWithUndefined = convertEmptyToUndefined(values)
            console.log("转换空字符串为undefined后:", JSON.stringify(valuesWithUndefined, null, 2))

            const mergedStorage =
                subrid || (modType && redId !== undefined)
                    ? { ...storage, [`_${modType}_${redId}`]: { ...oldStore, ...valuesWithUndefined } }
                    : { ...storage, ...valuesWithUndefined }

            const { _version, "": _omit, ...RepData } = mergedStorage
            const cleanedRepData = cleanEmptyFields(RepData)
            console.log("清理前的RepData:", JSON.stringify(RepData, null, 2))
            console.log("清理后的RepData:", JSON.stringify(cleanedRepData, null, 2))

            const update = async () => {
                return await updateOriginal({
                    id: subrid ?? rep?.id,
                    operationType: 1,
                    version: _version,
                    data: JSON.stringify(cleanedRepData),
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
                    setModified?.(false)
                }
            })
        },
        [customOnSubmit, storage, subrid, redId, modType, rep?.id, updateOriginal, setModified],
    )

    const handleConfirm = useCallback(() => {
        const currentValues = structuredClone(form.getValues())
        const valuesWithUndefined = convertEmptyToUndefined(currentValues)

        if (subrid || (modType && redId !== undefined)) {
            setStorage((prevStorage: any) => {
                const oldStore = prevStorage?.[`_${modType}_${redId}`]
                return {
                    ...prevStorage,
                    [`_${modType}_${redId}`]: { ...oldStore, ...valuesWithUndefined },
                }
            })
        } else {
            setStorage((prevStorage: any) => ({
                ...prevStorage,
                ...valuesWithUndefined,
            }))
        }
        setModified?.(true)
    }, [form, setStorage, setModified, subrid, modType, redId])

    const contentRenderer = useMemo(() => {
        return contentRendererFactory ? contentRendererFactory(form, arrayControls) : null
    }, [contentRendererFactory, form, arrayControls])

    const render = useCallback(
        (node: any) => (
            <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {contentRenderer}
                        {node}
                        <CardFooter className="flex flex-col justify-between border-t p-6 space-y-4">
                            {Object.keys(form.formState.errors || {}).length > 0 && (
                                <div className="bg-red-300 px-1 py-1 rounded-md text-sm break-all">
                                    报错: {serializeErrors(form.formState.errors)}
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
        ),
        [form, handleSubmit, contentRenderer, handleConfirm],
    )

    return {
        form,
        render,
        handleSubmit,
        arrayControls,
        handleConfirm,
    }
}

export const ModificationIndicator = () => {
    const { modified } = useStorage()
    const gQLstatus = useNetworkStatus()

    return (
        <div className="fixed top-4 left-10 z-50">
            {!gQLstatus.isOnline && (
                <div className="relative bg-amber-500/80 border border-amber-900/80 rounded-lg p-3">
                    <AlertCircle className="absolute top-0 left-0 w-6 h-6 text-amber-500 animate-pulse" style={{ zIndex: 2 }} />
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 text-sm font-medium text-amber-800 z-10">离线</span>
                </div>
            )}
            {modified && (
                <div className="bg-yellow-500 border border-pink-900 text-black px-0 py-0 @5xl:px-1 @5xl:py-1 rounded-lg animate-spin-slow">
                    <Pencil className="w-3 h-3 text-red-500 animate-spin" />
                </div>
            )}
        </div>
    )
}

interface UseFrameEditorBarProps {
    rep?: any
    values: Record<string, any>
    onVerify?: (values: any) => boolean
    onReset?: () => void
    modType?: string
    subrid?: string
    redId?: number
    root?: boolean
}

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
    const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)

    const handleSubmit = useCallback(async () => {
        if (onVerify && !onVerify(values)) return

        console.log("表单值:", JSON.stringify(values, null, 2), "需排除掉w")

        const oldStore = storage?.[`_${modType}_${redId}`]
        const valuesWithUndefined = convertEmptyToUndefined(values)
        console.log("转换空字符串为undefined后:", JSON.stringify(valuesWithUndefined, null, 2))

        const mergedStorage =
            (subrid || (modType && redId !== undefined)) && !root
                ? { ...storage, [`_${modType}_${redId}`]: { ...oldStore, ...valuesWithUndefined } }
                : { ...storage, ...valuesWithUndefined }

        const { _version, "": _omit, ...RepData } = mergedStorage
        const cleanedRepData = cleanEmptyFields(RepData)
        console.log("清理前的RepData:", JSON.stringify(RepData, null, 2))
        console.log("清理后的RepData:", JSON.stringify(cleanedRepData, null, 2))

        const update = async () => {
            return await updateOriginal({
                id: subrid ?? rep?.id,
                operationType: 1,
                version: _version,
                data: JSON.stringify(cleanedRepData),
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
                setModified?.(false)
            }
            setIsSaving(false)
        })
    }, [onVerify, values, storage, modType, redId, subrid, root, rep?.id, updateOriginal, setModified])

    const handleConfirm = useCallback(() => {
        if (onVerify && !onVerify(values)) return

        const valuesWithUndefined = convertEmptyToUndefined(values)

        if ((subrid || (modType && redId !== undefined)) && !root) {
            setStorage((prevStorage: any) => {
                const oldStore = prevStorage?.[`_${modType}_${redId}`]
                return {
                    ...prevStorage,
                    [`_${modType}_${redId}`]: { ...oldStore, ...valuesWithUndefined },
                }
            })
        } else {
            setStorage((prevStorage: any) => ({
                ...prevStorage,
                ...valuesWithUndefined,
            }))
        }
        setModified?.(true)
    }, [onVerify, values, setStorage, setModified, subrid, modType, redId, root])

    const render = useCallback(
        () => (
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
        ),
        [onReset, handleConfirm, isSaving, handleSubmit],
    )

    return [render]
}

export const initFormTable = (subStore: any, table: string, config: Each_ZdSetting[]): any => {
    const fields = {} as any
    const tableData = subStore?.[table] || []
    fields[table] = tableData.map((item: any) => {
        const normalizedItem = {} as any
        config.forEach(([_, tag, __, ___, park]) => {
            if (park) {
                if (!normalizedItem[park]) normalizedItem[park] = {}
                normalizedItem[park][tag] = item?.[park]?.[tag] !== undefined ? item[park][tag] : ""
            } else {
                normalizedItem[tag] = item?.[tag] !== undefined ? item[tag] : ""
            }
        })
        return normalizedItem
    })
    return fields
}
