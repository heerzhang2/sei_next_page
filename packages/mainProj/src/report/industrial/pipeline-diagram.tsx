"use client"

import type * as React from "react"
import { useEffect, useState } from "react"
import { FootMensLine } from "@/report/common/view"
// import { FlexibleTable, TableBody, TableCell, TableRow } from "@/components/flexible-table"
import { useFoldForList, useFoldGenerate, useSplitSubCapacity } from "@/report/hook/use-fold-gen"
import { cn } from "@/lib/utils"
import { RepLink } from "@/report/common/base"
import { JumpTab } from "@/report/common/JumpTab"

//没用！    问题1：修复Hook调用问题 - 将useTextHeight移到组件外部
const useTextHeight = (text: string, className = "text-[0.7rem]") => {
    const [textHeight, setTextHeight] = useState<number>(0)
    useEffect(() => {
        if (!text || typeof window === "undefined") {
            setTextHeight(0)
            return
        }
        // 问题2：计算A4纸实际可用宽度
        // A4纸宽度: 210mm = 8.27英寸 = 794px (96dpi)
        // 默认边距: 通常为1英寸 = 96px，左右共192px
        // 表格边线和padding: 估算约20px
        // 实际可用宽度: 794 - 192 - 20 = 582px
        const a4UsableWidth = 582

        // 创建临时测量元素
        const measureElement = document.createElement("div")
        measureElement.style.position = "absolute"
        measureElement.style.visibility = "hidden"
        measureElement.style.whiteSpace = "pre-wrap"
        measureElement.style.width = `${a4UsableWidth}px` // 问题2：使用A4纸实际可用宽度
        measureElement.style.fontSize = "0.7rem" // 对应 text-[0.7rem]
        measureElement.style.lineHeight = "1.2" // 设置行高
        measureElement.className = className
        measureElement.textContent = text

        // 添加到DOM中进行测量
        document.body.appendChild(measureElement)
        const height = measureElement.offsetHeight
        document.body.removeChild(measureElement)

        // 转换为rem单位（假设根字体大小为16px）
        const heightInRem = height / 16
        setTextHeight(Math.ceil(heightInRem * 2) / 2) // 向上取整到0.5rem
    }, [text, className])

    return textHeight
}

// 问题1：修复Hook调用问题 - 创建单独的组件来使用Hook
const DiagramItem: React.FC<{
    lobj: any
    arak: number
    pid: number
    lsBlockMax: number
    rep: any
    title?: string
    mtil?: string
    v_bh?: boolean
    printMode?: boolean
}> = ({ lobj, arak, pid, lsBlockMax, rep, title, mtil, v_bh,printMode }
) => {
    const index = arak * lsBlockMax + pid
    const CompH = arak === 0 && pid === 0 ? "h2" : "div"
    const tlrender=<>{title ?? "压力管道单线图"}</>
    //太不准确的计算
        // const dynamicTextHeight = useTextHeight(lobj?.m || "", "text-[0.7rem]")
        // const imageMaxHeight = `calc(100vh - ${textHeight}rem)`
        // const imageMaxHeight = `calc(100vh - 2rem)`      内联样式使用的情况！
            //tailwindcss 不能用多个拼凑的！没有空格的；
    //【打印让最后人员一行吸附纸张的底部】关键是依靠设置print:h-screen以及配套的flex-shrink-0和没有flex-shrink-0的弹性元素来组合的；前提条件全部能在一张纸能打印得下，不得超出，那一个弹性的DOM可收缩。
    return (
        <div key={pid} className="print:h-screen mx-auto bg-white shadow-lg print:shadow-none flex flex-col">
            {/* 标题和内容区域 */}
            <div className="flex-shrink-0">
                {(arak === 0 && pid === 0) ?
                    <RepLink ori rep={rep} tag={"LineDiagram"}>
                        <CompH className={cn("text-center text-xl mb-2", "pt-2 print:pt-0")}>
                            {printMode? tlrender : '单线图的管理'}
                        </CompH>
                    </RepLink>
                    :
                    <CompH className={cn("text-center text-xl mb-2", "hidden print:block")}>
                        {tlrender}
                    </CompH>
                }
                <div className="flex justify-end print:hidden">
                    <span className="text-xs mr-4">序号{index + 1}</span>
                </div>
                {v_bh && (
                    <div className="flex justify-end">
                        <span className="text-sm">报告编号：{rep.isp.no}</span>
                    </div>
                )}
            </div>
            <JumpTab
                href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LineDiagramFile?original=1&lineIndex=${index}#LineDiagram${index}`}
                className="print:flex-1 print:flex print:flex-col"
            >
                <div className="flex-shrink-0">
                    {/* 说明文字区域*/}
                    {lobj?.m &&
                        <div className={cn("text-content space-y-1 border border-gray-400 px-1", lobj?._FILE_?.url ? "text-[0.7rem]" : "text-sm" )}>
                            {mtil ?? "缺陷附图或说明"}：&nbsp;
                            <span className="text-sm whitespace-pre-wrap">{lobj?.m || "／"}</span>
                        </div>
                    }
                </div>
                {/* 图片区域 */}
                {lobj?._FILE_?.url && (
                    <div className="flex-1 flex items-center justify-center border border-gray-200 bg-gray-50 print:border-gray-300 print:bg-white p-2 print:p-1 min-h-0">
                        <img
                            src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${lobj?._FILE_?.url}` || "/placeholder.svg"}
                            alt={lobj?._FILE_?.name || "图片"}
                            className={cn("max-w-full object-contain",
                                "max-h-[15cm] @md:5xl:max-h-[19cm] print:max-h-full",
                            )}
                            loading={printMode? "eager" : "lazy"}
                        />
                    </div>
                )}
                {/* 弹性高度区域，确保人员那一条在纸张底部打印 */}
                {!lobj?._FILE_?.url && (
                    <div className="flex-1 flex items-center justify-center border border-gray-400 bg-gray-50 print:bg-white p-2 print:p-1 min-h-0">
                    </div>
                )}
            </JumpTab>
            {/* 人员 */}
            <div className="flex-shrink-0 text-center text-xs text-gray-500  print:text-[10px]">
                <FootMensLine />
            </div>
        </div>
    )
}

interface PipeLineDiagramProps {
    orc: any
    rep: any
    children?: React.ReactNode
    //显示报告编号吗
    v_bh?: boolean
    //可修改的表格文字样式
    className?: string
    title?: string
    //文本说明备注的标题：
    mtil?: string
    printMode?: boolean
}
//每几个图折叠的：
const  MAX_COLL_PICS=4
/**通用单线图,
 * */
export const PipeLineDiagram: React.FC<PipeLineDiagramProps> = ({
                                                                    orc,
                                                                    rep,
                                                                    children,
                                                                    v_bh,
                                                                    className,
                                                                    title,
                                                                    mtil,
                                                                    printMode,
                                                                }) => {
    const lsBlockMax = useSplitSubCapacity(orc?.单图表?.length || 0, MAX_COLL_PICS)
    // 切分折叠区
    const { sumArea, areaContent, btnBindUses } = useFoldForList(orc?.单图表 || [], lsBlockMax, false)

    // 问题1：修复Hook调用问题 useCallback里面用hook报错 - 渲染回调函数现在使用独立组件
    const frCallback = (lobj: any, arak: number, pid: number) => {
        return (
            <DiagramItem
                key={pid}
                lobj={lobj}
                arak={arak}
                pid={pid}
                lsBlockMax={lsBlockMax}
                rep={rep}
                title={title}
                mtil={mtil}
                v_bh={v_bh}
                printMode={printMode}
            />
        )
    }

    const titleCb = (arak: number) => {
        const start = arak * lsBlockMax // 当前折叠区第一张的序号数
        const dymax = orc?.单图表?.length || 0
        const last = (arak + 1) * lsBlockMax >= dymax ? dymax : (arak + 1) * lsBlockMax
        return "单线图折叠" + (last < 1 ? "（暂无数据）" : `${start + 1} - ${last} `)
    }
    const [renderAll] = useFoldGenerate({
        sumArea,
        btnBindUses,
        areaContent,
        callback: frCallback,
        mark: "单线图折叠",
        titleCb,
    })
    const addIdx = orc?.单图表?.length || 0
    return (
        <div className="space-y-1">
            <div id="LineDiagram" className="text-center print:hidden">
                {!orc?.单图表?.length>0 &&
                    <RepLink ori rep={rep} tag={"LineDiagram"}>
                        <span className="text-2xl font-bold mt-4">单线图的管理</span>
                    </RepLink>
                }
            </div>
            {renderAll}
            <div className="text-center print:hidden">
                <JumpTab
                    href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LineDiagramFile?original=1&lineIndex=${addIdx}`}
                >
                    <span className="text-xl font-bold">新增一个单线图</span>
                </JumpTab>
            </div>
            {children}
        </div>
    )
}
