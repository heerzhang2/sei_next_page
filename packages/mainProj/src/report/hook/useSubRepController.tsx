"use client"

import * as React from "react"
import { useStorage } from "../StorageContext"
import { Card, CardContent, CardFooter } from "@/components/ui"
import { ProjectListFormField } from "@/component/project-list-form"
import { useCallback, useState, useRef } from "react"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { undefined } from "zod"
import { type EditorAreaConfig, subrType2ProjTitle } from "@/report/common/eHelper"

const suffixToRemove = "_Controller"
export const findNodeIndex = <T extends { node: { id: string } }>(arr: T[], targetId: string): number => {
    return arr.findIndex((item) => {
        const node = item.node
        return node && node.id === targetId
    })
}

/**可重复的分项控制：
 * 特殊路由 的 当前分项报告的各个分项在子报告 控制
 * 新增加分项枪击确认保存后爆出hook错误了：因为右半边页面这回仅仅过render？路由没动啊。
 * */
export function useSubRepController(
    recordPrintList: EditorAreaConfig[],
    modelkey: string,
    rep: any,
    callback: (store: any, index: number) => React.ReactNode,
    subrid?: string,
) {
    const router = useRouter()
    const searchParams = useSearchParams()
    // const currentRedId = searchParams.get("redId") || "0"
    const { storage, setStorage, setModified } = useStorage()
    const [formData, setFormData] = useState({ projectId: storage?.["_" + modelkey] ?? [] })

    const formDataRef = useRef(formData)
    formDataRef.current = formData

    const projTitles = subrType2ProjTitle(recordPrintList, modelkey)
    const title = projTitles?.[0] ?? ""
    const renderProjectTitle = (index: number) => {
        if (!callback) throw new Error(`${modelkey}:没定义分项标签回调`)
        return (
            <div>
                <div className="font-medium">{callback(storage, index)}</div>
                <div className="text-sm text-gray-500">项目 {index}</div>
            </div>
        )
    }

    const onItemChanged = useCallback(
        (ids: any) => {
            setFormData((prev) => ({ ...prev, projectId: ids }))
        },
        [], // No dependencies needed with functional update
    )

    const onReset = () => {
        setFormData({ projectId: storage?.["_" + modelkey] ?? [] })
    }

    const canDeleteItem = useCallback(
        (pid: number) => {
            const key = `_${modelkey}_${pid}`
            //不能用return (storage?.[key] === undefined)
            return !storage?.[key]
        },
        [modelkey, storage],
    )

    const subrepidx = React.useMemo(() => {
        if (subrid) {
            const flsReps = rep?.isp?.reps?.edges?.filter(({ node: srep }: any) => {
                return srep?.modeltype === modelkey
            })
            const ifind = findNodeIndex(flsReps, subrid)
            return ifind ?? undefined
        } else return 0 //本地的分项不管有没有id都要加前缀1； localIdx?.length>0 ? 0: undefined;
    }, [subrid, modelkey, rep])

    const pathname = usePathname()
    //替换掉URL的action==='_Controller'部分；原本是router.push(`?${params.toString()}`)
    const switchRedId = (newRedId: number) => {
        const newUrlp = pathname.slice(0, -suffixToRemove.length)
        const params = new URLSearchParams(searchParams.toString())
        params.set("redId", String(newRedId))
        //params.set("original", "1")       router.push(`?${params.toString()}`)
        const hash = `_${modelkey}${subrepidx! >= 0 ? "_" + (subrepidx! + 1) : ""}-${newRedId}`
        router.push(newUrlp + `?${params.toString()}#${hash}`)
    }

    const onProjectClick = useCallback(
        (index: number) => {
            switchRedId(index)
        },
        [modelkey, storage],
    )

    const onSubProjDelete = useCallback(
        (index: number) => {
            const key = `_${modelkey}_${index}`
            setStorage((prevStorage: any) => ({
                ...prevStorage,
                [key]: undefined,
            }))
            setModified(true)
        },
        [modelkey, storage],
    )

    const [render] = useFrameEditorBar({
        root: true,
        rep,
        transformValues: (storage) => ({
            ["_" + modelkey]: formDataRef.current.projectId,
        }),
        onReset,
        subrid,
    })

    const view = (
        <div className="my-auto content-center" style={{ height: `calc(100vh - 6rem)` }}>
            <Card className="py-1 gap-2 mt-4">
                <CardContent className="p-0 space-y-1">
                    <ProjectListFormField
                        renderTitle={renderProjectTitle}
                        value={formData.projectId}
                        onChange={onItemChanged}
                        canDeleteItem={canDeleteItem}
                        onProjectClick={onProjectClick}
                        onDeleteItem={onSubProjDelete}
                        title={`${title ? title + "-" : ""}可重复分项控制器`}
                    />
                </CardContent>
                <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2 mb-8">
                    {render()}
                    <span>注意：分项的项目数据内容还未清空的就无法删除</span>
                </CardFooter>
            </Card>
        </div>
    )
    return { view }
}
