"use client"

import type * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { FootMensLine } from "@/report/common/view"
import { FlexibleTable, TableBody, TableCell, TableRow } from "@/components/flexible-table"
import { useFoldForList, useFoldGenerate, useSplitSubCapacity } from "@/report/hook/use-fold-gen"
import { cn } from "@/lib/utils"
import { RepLink } from "@/report/common/base"
import { JumpTab } from "@/report/common/JumpTab"
import { ImageComponent } from "@/components/shub"

interface PipeLineDiagramProps {
    orc: any
    rep: any
    children?: React.ReactNode
    v_bh?: boolean
    //可修改的表格文字样式
    className?: string
    title?: string
    mtil?: string
}

// 问题1：修复Hook调用问题 - 将useTextHeight移到组件外部
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
}> = ({ lobj, arak, pid, lsBlockMax, rep, title, mtil, v_bh }) => {
    const index = arak * lsBlockMax + pid
    const CompH = arak === 0 && pid === 0 ? "h2" : "div"

    // 问题1：现在可以安全地在组件顶层调用Hook
    const dynamicTextHeight = useTextHeight(lobj?.m || "", "text-[0.7rem]")

    // 方案1：使用用户设置的文本高度，方案2：使用动态计算的高度
    const textHeight = lobj?.tH || dynamicTextHeight || 4 // 问题3：使用tH字段

    // 计算图片可用高度：总高度 - 标题高度 - 文本高度 - 页脚高度 - 边距
    // const imageMaxHeight = `calc(100vh - 6rem - ${textHeight}rem - 3rem - 2rem)`
    // const imageMaxHeight = `calc(100vh - 2rem)`      内联样式使用的情况！
    const imageMaxHeight = `calc(100vh-2rem)`

    return (
        <div
            key={pid}
            className="mb-4 print:mb-0 print:h-screen print:max-h-screen print:flex print:flex-col print:justify-start print:break-before-page print:overflow-hidden"
        >
            <div className="mt-4 print:mt-0 print:flex-1 print:flex print:flex-col">
                {/* 标题区域 - 固定高度 */}
                <div className="print:flex-shrink-0">
                    <Link
                        href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}
                        className="block text-center"
                    >
                        <CompH className={cn(arak === 0 && pid === 0 ? "" : "hidden print:block", "text-xl mb-4")}>
                            {title ?? "压力管道单线图"}
                        </CompH>
                    </Link>
                    <div className="flex justify-end print:hidden">
                        <span className="text-xs mr-4">序号{index + 1}</span>
                    </div>
                    {v_bh && (
                        <div className="flex justify-end mb-4">
                            <span className="text-sm">报告编号：{rep.isp.no}</span>
                        </div>
                    )}
                </div>

                {/* 主要内容区域 - 可伸缩 */}
                <div className="print:flex-1 print:flex print:flex-col print:min-h-0">
                    <FlexibleTable columnWidths={["%"]} className="print:flex-1 print:flex print:flex-col">
                        <TableBody className="print:flex-1 print:flex print:flex-col">
                            <TableRow id={"LineDiagram" + index} className="print:flex-1 print:flex print:flex-col">
                                <JumpTab
                                    href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LineDiagramFile?original=1&lineIndex=${index}#LineDiagram${index}`}
                                    className="print:flex-1 print:flex print:flex-col"
                                >
                                    <TableCell className="border bg-gray-50 print:flex-1 print:flex print:flex-col print:p-2">
                                        {/* 说明文字区域 - 固定高度 */}
                                        <div
                                            className={cn(lobj?._FILE_?.url ? "text-[0.7rem]" : "text-sm", "print:flex-shrink-0")}
                                            style={{
                                                // 方案1：使用用户设置的高度
                                                height: lobj?.tH ? `${lobj.tH}rem` : undefined, // 问题3：使用tH字段
                                                // 方案2：使用动态计算的高度（如果没有用户设置）
                                                minHeight: !lobj?.tH ? `${dynamicTextHeight}rem` : undefined,
                                            }}
                                        >
                                            {mtil ?? "缺陷附图或说明"}：&nbsp;
                                            {lobj?.m && <span className="text-sm whitespace-pre-wrap">{lobj?.m || "／"}</span>}
                                            {!lobj?._FILE_?.url && !lobj?.m && (
                                                <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                            )}
                                        </div>

                                        {/* 图片区域 - 可伸缩 */}
                                        {lobj?._FILE_?.url &&
                                            <div className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                                <div className="flex justify-around items-center my-0.5">
                                                    <ImageComponent
                                                        src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${lobj?._FILE_?.url}`}
                                                        alt={lobj?._FILE_?.name || "图片"}
                                                        className={cn(
                                                            "print:max-h-full"
                                                            // "print:h-["+imageMaxHeight+"]", "print:max-h-[calc(100vh-5.9rem)]"
                                                        )}
                                                        divClass={cn(
                                                            "print:h-["+imageMaxHeight+"]",
                                                            // "print:h-[calc(100vh-2rem)]",
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        }
                                        {/*{lobj?._FILE_?.url && (*/}
                                        {/*    <div className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden print:flex-1 print:flex print:items-center print:justify-center print:min-h-0">*/}
                                        {/*        <div className="flex justify-around items-center my-0.5 print:max-h-full print:w-full print:h-full">*/}
                                        {/*            <ImageComponent*/}
                                        {/*                src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${lobj?._FILE_?.url}`}*/}
                                        {/*                alt={lobj?._FILE_?.name || "图片"}*/}
                                        {/*                className={cn(*/}
                                        {/*                    "w-auto max-w-full",*/}
                                        {/*                    "print:max-w-full print:object-contain",*/}
                                        {/*                    "print:h-["+imageMaxHeight+"]",*/}
                                        {/*                )}*/}
                                        {/*                // style={{*/}
                                        {/*                //     // 方案1和方案2：动态设置图片最大高度*/}
                                        {/*                //     maxHeight: imageMaxHeight,*/}
                                        {/*                // }}*/}
                                        {/*                //"w-auto h-auto",*/}
                                        {/*                //     "print:max-h-[calc(100vh-5.9rem)]",*/}
                                        {/*            />*/}
                                        {/*        </div>*/}
                                        {/*    </div>*/}
                                        {/*)}*/}
                                    </TableCell>
                                </JumpTab>
                            </TableRow>
                        </TableBody>
                    </FlexibleTable>
                </div>

                {/* 页脚区域 - 固定高度 */}
                <div className="print:flex-shrink-0">
                    <FootMensLine />
                </div>
            </div>
        </div>
    )
}

/**通用单线图
 * */
export const PipeLineDiagram: React.FC<PipeLineDiagramProps> = ({
                                                                    orc,
                                                                    rep,
                                                                    children,
                                                                    v_bh,
                                                                    className,
                                                                    title,
                                                                    mtil,
                                                                }) => {
    const lsBlockMax = useSplitSubCapacity(orc?.单图表?.length || 0, 4)
    // 切分折叠区
    const { sumArea, areaContent, btnBindUses } = useFoldForList(orc?.单图表 || [], lsBlockMax, false)

    // 问题1：修复Hook调用问题 - 渲染回调函数现在使用独立组件
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
                <RepLink ori rep={rep} tag={"LineDiagram"}>
                    <span className="text-2xl font-bold mt-4">单线图的管理</span>
                </RepLink>
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
