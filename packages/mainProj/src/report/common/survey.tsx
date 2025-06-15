"use client"
import * as React from "react"
import type { InternalItemProps } from "./base"
import { useStorage } from "../StorageContext"
import { z } from "zod"
import { useFormFramework } from "@/report/hook/useFormFramework"
import { CollapsibleFormSection } from "@/components/chub"
import { usePrefixDataEdit } from "@/report/hook/usePrefixData"

interface DeviceSurveyDProps extends InternalItemProps {
    label: string
    config?: any[]
    itemA?: string[]
}

export const DeviceSurveyD = ({ children, show, label, config, itemA, rep }: DeviceSurveyDProps) => {
    const { storage } = useStorage()

    // 创建动态 schema
    const fullSchema = React.useMemo(() => {
        const schemaFields = {} as any
        const surveyItems = [] as any

        config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            const [desc2, name2, cb2] = add2p || []
            if (typeof name === "string" && !name?.startsWith("_$")) surveyItems.push({ name, cb })
            else if (typeof name === "object" && name.n && !name.r && !name.n.startsWith("_$"))
                surveyItems.push({ name: name.n, cb })
            if (typeof name2 === "string" && name2 && !name2.startsWith("_$")) surveyItems.push({ name: name2, cb: cb2 })
            else if (typeof name2 === "object" && name2.n && !name2.r && !name2.n.startsWith("_$"))
                surveyItems.push({ name: name2.n, cb: cb2 })
        })

        const itemA设备概况: string[] = itemA ? [...itemA] : []

        // 初始化存储字段
        surveyItems.forEach(({ name, cb }: any) => {
            if (cb?.names) itemA设备概况.push(...cb?.names)
            else itemA设备概况.push(name)
        })

        itemA设备概况.forEach((namecfg) => {
            schemaFields[namecfg] = z.string().optional()
        })

        return z.object(schemaFields)
    }, [config, itemA])

    // 计算默认值
    const defaultValues = React.useMemo(() => {
        const fields = {} as any

        config?.forEach(([[desc, name, cb], add2p]: any) => {
            const [desc2, name2, cb2] = add2p || []
            if (typeof name === "string" && !name?.startsWith("_$")) fields[name] = storage[name] ?? ""
            else if (typeof name === "object" && name.n && !name.r && !name.n.startsWith("_$"))
                fields[name.n] = storage[name.n] ?? ""
            if (typeof name2 === "string" && name2 && !name2.startsWith("_$")) fields[name2] = storage[name2] ?? ""
            else if (typeof name2 === "object" && name2.n && !name2.r && !name2.n.startsWith("_$"))
                fields[name2.n] = storage[name2.n] ?? ""
        })

        itemA?.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })

        return fields
    }, [config, itemA, storage])

    // 使用通用表单框架hook
    const { render, form } = useFormFramework({
        schema: fullSchema,
        defaultValues,
        //contentRendererFactory :不再使用回调函数
        rep,
    })

    // 将 usePrefixDataEdit 移到组件顶层
    const [renderEditor] = usePrefixDataEdit({ config: config || [], form })

    //替代原本的contentRendererFactory()的位置; 创建内容渲染器函数，但不再调用 hooks
    const content = (
        <>
            资料审查设备概况除在台账业务信息中可修改外还需修改的部分:
            {renderEditor}
            {children}
        </>
    )

    return (
        <CollapsibleFormSection title={label ?? "一、设备概况"} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}
