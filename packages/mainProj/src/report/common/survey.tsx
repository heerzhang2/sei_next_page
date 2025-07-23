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
    //在某一个行位置遣返注入某个分段的描述，断开布局的，配置某一行的序号插入描述Dom，基数1的。
    comment?: Record<number, any>
}

export const DeviceSurveyD = ({ children, show, label, config, itemA, rep,comment}: DeviceSurveyDProps) => {
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
    const [renderEditor] = usePrefixDataEdit({ config: config || [], form, comment})

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

interface DeviceSurveyFxProps extends DeviceSurveyDProps {
    modType?: string
}
/**支持可重复分项的，但是不支持modType为空的 普通 情形。
 * 兼容位于主报告，兼容可独立流转子报告； 允许编辑器2列的但报告展示需改为3列的mergeToThreeColumn()；
* */
export const DeviceSurveyFx = ({children, show, label, config, itemA, rep,subrid,redId,modType,verId}: DeviceSurveyFxProps) => {
    //分项目：modType有的，但是subrType却不一定有的： 处于独立流转分项编辑才有的。
    const { storage, subrType, parrepfs } = useStorage()
    if(!modType || redId===undefined){
        return null
        //throw new Error(`可重复分项才能用`);
    }

    //【必然的前提】可重复分项都必须是对象类型。
    const subStore=storage?.[`_${modType}_${redId}`] || {};           //有可能可独立流转子报告的
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

    // 计算默认值： 从存储恢复的
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        //"_$"开头的表示主报告的data存储中。  @ 可重复项目内嵌的字段不可能被其它地方交叉去引用的！
        config?.forEach(([[desc, name, cb], add2p]: any) => {
            const [desc2, name2, cb2] = add2p || []
            if (typeof name === "string" && !name?.startsWith("_$")) fields[name] = subStore[name] ?? ""
            else if (typeof name === "object" && name.n && !name.r && !name.n.startsWith("_$"))
                fields[name.n] = subStore[name.n] ?? ""
            if (typeof name2 === "string" && name2 && !name2.startsWith("_$")) fields[name2] = subStore[name2] ?? ""
            else if (typeof name2 === "object" && name2.n && !name2.r && !name2.n.startsWith("_$"))
                fields[name2.n] = subStore[name2.n] ?? ""
        })
        //subStore当中的；替换掉storage的；
        itemA?.forEach((name) => {
            if(name.startsWith("_$")){
                const nname=name.substring(2, name.length);
                fields[nname] =(subrType ? parrepfs?.[nname] : storage?.[nname]) ?? ""
            }
            else
                fields[name] = subStore[name] ?? ""
        })

        return fields
    }, [config, itemA,subStore, storage,parrepfs])

    // 使用通用表单框架hook
    const { render, form } = useFormFramework({
        schema: fullSchema,
        defaultValues,
        //contentRendererFactory :不再使用回调函数
        rep,
        redId,
        subrid,
        modType,
    })

    // 将 usePrefixDataEdit 移到组件顶层
    const [renderEditor] = usePrefixDataEdit({ config: config || [], form })

    //替代原本的contentRendererFactory()的位置; 创建内容渲染器函数，但不再调用 hooks
    const content = (
        <>
            {children}
            {renderEditor}
        </>
    )

    return (
        <CollapsibleFormSection title={label ?? "一、设备概况"} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

/**
 * 将原配置的每行最多2列合并为每组最多3列的新配置
 * @param {Array} originalConfig 原配置数组
 * @returns {Array} 新配置数组（每组最多3列）
 */
export function mergeToThreeColumn(originalConfig: any[][][]) {
    // 步骤1：提取所有列到一维数组
    const allColumns = [];
    for (const row of originalConfig) {
        // 遍历原配置的每一行，将行内的所有列加入总数组
        allColumns.push(...row);
    }

    // 步骤2：按每3列一组分组
    const newConfig = [];
    for (let i = 0; i < allColumns.length; i += 3) {
        // 截取当前组的3列（或剩余列）
        const group = allColumns.slice(i, i + 3);
        newConfig.push(group);
    }

    return newConfig;
}
