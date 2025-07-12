"use client"

import * as React from "react"
import { Button } from "@/components/ui"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui"
import { ChevronDown, ChevronUp } from "lucide-react"

/**
 * 从独立流转的分项返回主报告链接
 */
export function useMainRepUrlOr(rep: any) {
    const urlMainRep = React.useMemo(() => {
        const isMain = rep?.id === rep?.isp?.report?.id // 是不是在主报告中：嵌入式的分项
        const { node: mainRep } = rep?.isp?.reps?.edges?.find(({ node: { id } }: any) => id === rep?.isp?.report?.id) || {
            node: null,
        }

        // isMain = false 独立的分项报告
        const urlMainRep = mainRep
            ? `/report/${mainRep?.modeltype}/ver/${mainRep?.modelversion}/${mainRep?.id}/ALL`
            : `/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`

        return urlMainRep
    }, [rep])

    return { urlMainRep }
}

/**
 * 建议多少个为好的？被限制于MAX_ZDAREA_BLOCK=30个最多的可点击折叠列表
 * @param blockMax: 预计是 几个 拆分的。
 */
export function useSplitSubCapacity(srepIdsLen: number, blockMax: number) {
    const size = React.useMemo(() => {
        const MAX_ZDAREA_BLOCK = 30
        const sumArea = srepIdsLen > 0 ? Math.ceil(srepIdsLen / blockMax) : 1

        if (sumArea > MAX_ZDAREA_BLOCK) {
            return Math.ceil(srepIdsLen / MAX_ZDAREA_BLOCK)
        } else {
            return blockMax
        }
    }, [srepIdsLen, blockMax])

    return size
}

/**
 * 单线图，特性表，太多的，可折叠显示
 */
export function useFoldForList(list: any[], blockMax: number, viewALL: boolean, hidden?: boolean) {
    const all = React.useMemo(() => {
        const MAX_ZDAREA_BLOCK = 30
        const sumArea = list?.length > 0 ? Math.ceil(list?.length / blockMax) : 1

        if (sumArea > MAX_ZDAREA_BLOCK) {
            throw new Error("超过设计折叠区数")
        }

        const areaContent: any[] = []
        for (let i = 0; i < sumArea; i++) {
            areaContent[i] = list?.slice(i * blockMax, (i + 1) * blockMax)
        }

        return { sumArea, areaContent }
    }, [list, blockMax])

    // 创建折叠状态管理
    const [openStates, setOpenStates] = React.useState<boolean[]>(() => {
        const initialStates = new Array(all.sumArea).fill(false)
        if (!hidden) initialStates[0] = true // 默认第一个展开
        return initialStates
    })

    const toggleOpen = React.useCallback((index: number) => {
        setOpenStates((prev) => {
            const newStates = [...prev]
            newStates[index] = !newStates[index]
            return newStates
        })
    }, [])

    // 如果viewALL为true，全部展开
    React.useEffect(() => {
        if (viewALL) {
            setOpenStates(new Array(all.sumArea).fill(true))
        }
    }, [viewALL, all.sumArea])

    const btnBindUses = React.useMemo(() => {
        return openStates.map((isOpen, index) => [
            isOpen,
            {
                onClick: () => toggleOpen(index),
                "aria-expanded": isOpen,
            },
        ])
    }, [openStates, toggleOpen])

    return { ...all, btnBindUses }
}

/**
 * 折叠渲染回调类型
 */
export type FoldRenderCallback = (dlPage: any, arak: number, pid: number) => React.ReactNode

/**
 * 较为通用的抽象组件：队列的折叠
 */
export function useFoldGenerate({
                                    sumArea,
                                    btnBindUses,
                                    areaContent,
                                    callback,
                                    mark,
                                    zeroDisp,
                                }: {
    sumArea: number
    btnBindUses: any[]
    areaContent: any[][]
    callback: FoldRenderCallback
    mark?: string
    zeroDisp?: boolean
}) {
    const render = React.useMemo(
        () => (
            <div className="space-y-4 print:space-y-0">
                {Array.from({ length: sumArea }, (_, ak) => {
                    const [isDisplay, bindBtn] = btnBindUses[ak] || [false, {}]

                    return (<React.Fragment key={ak}>
                        <Collapsible open={isDisplay} onOpenChange={() => bindBtn.onClick?.()}
                                     className="print:hidden"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" className="w-full justify-between print:hidden bg-transparent">
                                  <span className="@5xl:ml-[28rem]">{mark ?? "可折叠区"}{ak + 1}</span>
                                    {isDisplay ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-4">
                                {areaContent[ak]?.map((one: any, m: number) => (
                                    <div key={m}>{callback(one, ak, m)}</div>
                                ))}

                                {zeroDisp && !areaContent[ak] && <div>{callback(undefined, 0, 0)}</div>}
                            </CollapsibleContent>
                        </Collapsible>
                        <div className="hidden print:block">
                            {areaContent[ak]?.map((one: any, m: number) => (
                                <div key={m}>{callback(one, ak, m)}</div>
                            ))}

                            {zeroDisp && !areaContent[ak] && <div>{callback(undefined, 0, 0)}</div>}
                        </div>
                    </React.Fragment>)
                })}
            </div>
        ),
        [sumArea, btnBindUses, areaContent, callback, mark, zeroDisp],
    )

    return [render]
}

/**
 * 某些页面可折叠的：非列表多个页面的情况
 */
export function useFolder(callback: () => React.ReactNode, mark: any, hidden?: boolean) {
    const [isOpen, setIsOpen] = React.useState(!hidden)

    const render = React.useMemo(
        () => (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between print:hidden mb-4 bg-transparent">
                        <span>{mark ?? "可折叠区"}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>{callback()}</CollapsibleContent>
            </Collapsible>
        ),
        [isOpen, callback, mark],
    )

    return [render]
}
