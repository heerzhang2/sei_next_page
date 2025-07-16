"use client"

import * as React from "react"
import Link from "next/link"
import { FootMensLine } from "@/report/common/view"
import { FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { useFoldForList, useFoldGenerate, useSplitSubCapacity } from "@/report/hook/use-fold-gen"
import { cn } from "@/lib/utils"
import {RepLink} from "@/report/common/base";
import {JumpTab} from "@/report/common/JumpTab";
import {ImageComponent} from "@/components/shub";


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
/**通用单线图
 * */
export const PipeLineDiagram: React.FC<PipeLineDiagramProps> = (
    { orc, rep, children, v_bh,className,title,mtil }
) => {
    const lsBlockMax = useSplitSubCapacity(orc?.单图表?.length||0, 4)
    // 切分折叠区
    const { sumArea, areaContent, btnBindUses } = useFoldForList(orc?.单图表||[], lsBlockMax, false)
    // 渲染回调函数
    const frCallback = (lobj: any, arak: number, pid: number) => {
        const index=arak * lsBlockMax +pid;
        const CompH = arak === 0 && pid === 0 ? "h2" : "div"
        return (
            <div
                key={pid}
                className="mb-4 print:mb-0 print:min-h-screen print:flex print:flex-col print:justify-around print:break-before-page"
            >
                <div className="mt-4 print:mt-0">
                    {/* 标题 */}
                    <div>
                        <Link
                            href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}
                            className="block text-center"
                        >
                            <CompH className={cn(arak === 0 && pid === 0 ? "" : "hidden print:block", "text-xl mb-4")}>
                               {title ??'压力管道单线图'}
                            </CompH>
                        </Link>
                        <div className="flex justify-end print:hidden">
                            <span className="text-xs mr-4">序号{index+1}</span>
                        </div>
                        {v_bh && (
                            <div className="flex justify-end mb-4">
                                <span className="text-sm">报告编号：{rep.isp.no}</span>
                            </div>
                        )}
                    </div>
                    <FlexibleTable columnWidths={["%"]}>
                        <TableBody>
                            <TableRow id={'LineDiagram'+index}>
                                <JumpTab
                                    href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LineDiagramFile?original=1&lineIndex=${index}#LineDiagram${index}`}
                                >
                                <TableCell className="border bg-gray-50">
                                    <div className={cn( lobj?._FILE_?.url? "text-xs": "text-sm" )} >{mtil ??'缺陷附图或说明'}：&nbsp;
                                        {lobj?.m && <span className="text-sm whitespace-pre-wrap">{lobj?.m || "／"}</span>}
                                        {!(lobj?._FILE_?.url) && !lobj?.m && (
                                            <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                        )}
                                    </div>
                                    {lobj?._FILE_?.url &&
                                            <div className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">

                                                    <div className="flex justify-around items-center my-0.5">
                                                            <ImageComponent
                                                                src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${lobj?._FILE_?.url}`}
                                                                alt={lobj?._FILE_?.name || "图片"}
                                                                className={cn(
                                                                    "w-auto h-auto",
                                                                    "print:max-h-[calc(100vh-5.9rem)]",
                                                                )}
                                                            />
                                                    </div>

                                            </div>
                                    }
                                </TableCell>
                            </JumpTab>
                            </TableRow>
                        </TableBody>
                    </FlexibleTable>
                    <FootMensLine     />
                </div>
            </div>
        )
    }

    const titleCb = (arak: number) => {
        const start = arak * lsBlockMax         // 当前折叠区第一张的序号数
        const dymax = orc?.单图表?.length || 0
        const last = (arak + 1)*lsBlockMax >= dymax ? dymax : (arak + 1)*lsBlockMax
        return "单线图折叠" +(last<1? "（暂无数据）" : `${start + 1} - ${last} `)
    }
    const [renderAll] = useFoldGenerate({
        sumArea,
        btnBindUses,
        areaContent,
        callback: frCallback,
        mark: "单线图折叠",
        titleCb,
    })
    const addIdx= orc?.单图表?.length || 0;
    return (
        <div className="space-y-1">
            <div id="LineDiagram" className="text-center print:hidden">
                <RepLink ori rep={rep} tag={"LineDiagram"}>
                    <span  className="text-2xl font-bold mt-4">单线图的管理</span>
                </RepLink>
            </div>
            {renderAll}
            <div className="text-center print:hidden">
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LineDiagramFile?original=1&lineIndex=${addIdx}`}>
                    <span  className="text-xl font-bold">新增一个单线图</span>
                </JumpTab>
            </div>
            {children}
        </div>
    )
}
