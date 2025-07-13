"use client"

import * as React from "react"
import Link from "next/link"
import { FootMensLine } from "@/report/common/view"
import { FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { useFoldForList, useFoldGenerate, useSplitSubCapacity } from "@/report/hook/use-fold-gen"
import { cn } from "@/lib/utils"

// 表格列宽配置实际表5列 和才2列的：宽度可自己调节
const CLnPercents = [
    ["%", "55%"],
    ["%", "37%", "37%"],
    ["%", "25%", "25%", "25%"],
    ["%", "20%", "20%", "20%", "20%"],
]
// 字段配置
const LaySettings = [
    ["name", "管道名称"],
    ["code", "管道编号"],
    ["规格", "管道规格（mm）", 1],
    ["leng", "管道长度（m）"],
    ["level", "管道级别"],
    ["工介", "输送介质", 2],
    ["材料", "管道材料", 1],
    ["设压", "设计压力（MPa）", 1],
    ["工压", "操作压力（MPa）", 2],
    ["试压", "试验压力（MPa）", 2],
    ["设温", "设计温度（℃）", 1],
    ["工温", "操作温度（℃）", 2],
    ["start", "管道起点"],
    ["stop", "管道止点"],
    ["腐蚀", "腐蚀裕量（mm）", 1],
    ["焊数", "对接焊口数量", 1],
    ["lay", "敷设方式"],
    ["防腐材", "防腐层材料", 2],
    ["绝材", "绝热层材料", 2],
    ["绝厚", "绝热层厚度(mm)", 2],
    ["保数", "安全保护装置数量", 2],
    ["safe", "安全状况等级"],
    ["rno", "管道单元登记编码"],
]

interface PipelineCharacteristicsProps {
    orc: any
    rep: any
    children?: React.ReactNode
    v_bh?: boolean
}

export const PipelineCharacteristics: React.FC<PipelineCharacteristicsProps> = ({ orc, rep, children, v_bh }) => {
    // 重组成二维数组，每4个单元一页
    const pages = React.useMemo(() => {
        if (!orc?.单元表?.length) return []

        const pages: any[] = []
        for (let f = 0; f < orc.单元表.length; f += 4) {
            pages.push(orc.单元表.slice(f, f + 4))
        }
        return pages
    }, [orc?.单元表])

    const lsBlockMax = useSplitSubCapacity(pages.length, 2)
    // 切分折叠区
    const { sumArea, areaContent, btnBindUses } = useFoldForList(pages, lsBlockMax, false)
    // 渲染回调函数
    const frCallback = (dlPage: any, arak: number, pid: number) => {
        const pn = arak * lsBlockMax // 当前折叠区第一张的序号数
        const xsize = dlPage.length

        // 收集检验员信息
        const 检验员s: any[] = []
        for (const pp of dlPage) {
            if (pp?.sgm) {
                const men = 检验员s.find((m: any) => m.name === pp?.sgm.name)
                if (!men) 检验员s.push(pp?.sgm)
            }
        }
        const jyms = 检验员s.map((m: any, k: number) => m.name)
        const CompH = arak === 0 && pid === 0 ? "h2" : "div"
        return (
            <div
                key={pid}
                className="mb-8 print:mb-0 print:min-h-screen print:flex print:flex-col print:justify-around print:break-before-page"
            >
                <div className="mt-4 print:mt-0">
                    {/* 标题 */}
                    <div>
                        <Link
                            href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}
                            className="block text-center"
                        >
                            <CompH className={cn(arak === 0 && pid === 0 ? "" : "hidden print:block", "text-xl mb-4")}>
                                管道特性表
                            </CompH>
                        </Link>
                        {v_bh && (
                            <div className="flex justify-end mb-4">
                                <span className="text-sm">报告编号：{rep.isp.no}</span>
                            </div>
                        )}
                    </div>

                    <FlexibleTable columnWidths={CLnPercents[xsize - 1]} className="text-sm print:text-[0.75rem]">
                        <TableHeader>
                            <TableRow>
                                <TableCell className="text-center font-bold border">
                                    <span className="text-xs">项目 \ 序号</span>
                                </TableCell>
                                {dlPage.map((p: any, c: number) => {
                                    // 计算全局序号：当前单元在整个单元表中的索引位置
                                    const globalIndex = (pn + pid) * 4 + c
                                    return (
                                        <TableCell key={c} className="text-center font-bold border">
                                            <span id={`Characteristics${globalIndex}`}>{globalIndex + 1}</span>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {LaySettings.map(([field, title, where], fn: number) => (
                                <TableRow key={fn}>
                                    <TableCell className="font-medium border bg-gray-50">{title}</TableCell>
                                    {dlPage.map((p: any, c: number) => {
                                        // 计算全局序号：当前单元在整个单元表中的索引位置
                                        const globalIndex = (pn + pid) * 4 + c
                                        return (
                                            <TableCell key={c} className="border">
                                                <Link
                                                    href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Solidify?unitIndex=${globalIndex}#Solidify`}
                                                    className="block hover:bg-gray-50 p-1 rounded"
                                                >
                                                    {p?.id ? (where === 1 ? p?.svp?.[field] : where === 2 ? p?.pa?.[field] : p?.[field]) : null}
                                                </Link>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </FlexibleTable>
                    <FlexibleTable columnWidths={["%"]} className="text-sm print:text-[0.75rem]">
                        <TableBody>
                            <TableRow>
                                <TableCell className="border">
                                    <Link
                                        href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/LineDiagram#LineDiagram`}
                                        className="block"
                                    >
                                        <div>
                                            <span>备注：</span>
                                            {dlPage.map(
                                                (p: any, c: number) =>
                                                    p?.mm && (
                                                        <span key={c} className="ml-2">
                                                          {p.mm}。
                                                        </span>
                                                      ),
                                            )}
                                        </div>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </FlexibleTable>
                    <FootMensLine
                        jm={jyms}
                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
                    />
                </div>
            </div>
        )
    }

    const titleCb = (arak: number) => {
        const start = arak * (lsBlockMax * 4) // 当前折叠区第一张的序号数
        const dymax = orc?.单元表?.length || 0
        const last = (arak + 1) * (lsBlockMax * 4) >= dymax ? dymax - 1 : (arak + 1) * (lsBlockMax * 4)
        return "特性表折叠" +(last<1? "（暂无数据）" : `${start + 1} - ${last + 1} `)
    }
    const [renderAll] = useFoldGenerate({
        sumArea,
        btnBindUses,
        areaContent,
        callback: frCallback,
        mark: "特性表折叠",
        titleCb,
    })

    return (
        <div className="space-y-4">
            {pages.length <= 0 && (
                <div className="text-center print:hidden">
                    <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Solidify#Solidify`}>
                        <span id="Solidify" className="text-2xl font-bold mt-4">特性表的管道单元</span>
                    </Link>
                </div>
            )}
            <div id="Characteristics"></div>
            {renderAll}
            {children}
        </div>
    )
}
