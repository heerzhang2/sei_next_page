"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import {FootMensLine} from "@/report/common/view";
import {FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import { useFoldForList, useFoldGenerate, useSplitSubCapacity } from "@/report/hook/use-main-rep-url"

// 表格列宽配置实际表5列 和才2列的：宽度可自己调节
const CLnPercents=[["%","55%"], ["%","37%","37%"],
    ["%","25%","25%","25%"], ["%","20%","20%","20%","20%"]];
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
}

export const PipelineCharacteristics: React.FC<PipelineCharacteristicsProps> = ({ orc, rep, children }) => {
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

        return (
            <div key={pid} className="mb-8 print:mb-0">
                {/* 标题 */}
                <div className="print:break-before-page print:mt-0 mt-4">
                    <Link
                        href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}
                        className="block text-center"
                    >
                        <h2 className="text-2xl font-bold mb-4">管道特性表</h2>
                    </Link>

                    <div className="flex justify-end mb-4">
                        <span className="text-sm">报告编号：{rep.isp.no}</span>
                    </div>
                </div>

                {/* 主要特性表 */}
                    <FlexibleTable columnWidths={ CLnPercents[xsize-1] }>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="text-center font-bold border">
                                    <span className="text-xs">项目 \ 序号</span>
                                </TableCell>
                                {dlPage.map((p: any, c: number) => (
                                    <TableCell key={c} className="text-center font-bold border">
                                        <span id={`Characteristics${(pn + pid) * 4 + c}`}>{(pn + pid) * 4 + c + 1}</span>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {LaySettings.map(([field, title, where], fn: number) => (
                                <TableRow key={fn}>
                                    <TableCell className="font-medium border bg-gray-50">{title}</TableCell>
                                    {dlPage.map((p: any, c: number) => (
                                        <TableCell key={c} className="border">
                                            <Link
                                                href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Solidify?ppcode=${p?.code}#Solidify`}
                                                className="block hover:bg-gray-50 p-1 rounded"
                                            >
                                                { p?.id?
                                                    where === 1 ? p?.svp?.[field] : where === 2 ? p?.pa?.[field] : p?.[field]
                                                    : null
                                                }
                                            </Link>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </FlexibleTable>

                {/* 备注和签名表 */}
                    <FlexibleTable columnWidths={["%","45%"]}>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={2} className="border">
                                    <Link
                                        href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/LineDiagram#LineDiagram`}
                                        className="block"
                                    >
                                        <div>
                                            <strong>备注：</strong>
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
                            <TableRow>
                                <TableCell className="border w-1/2">
                                    <Link
                                        href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/LineDiagram#LineDiagram`}
                                        className="block"
                                    >
                                        <div className="flex justify-between items-start h-full">
                                            <div>
                                                <span className="font-medium">检验：</span>
                                                {检验员s.map((m: any, k: number) => (
                                                    <span key={k} className="ml-2">
                            {m.name}
                          </span>
                                                ))}
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">日期</div>
                                                <div>2022-12-31</div>
                                            </div>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className="border w-1/2">
                                    <div className="flex justify-between items-start h-full">
                                        <div>
                                            <span className="font-medium">审核：</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">日期</div>
                                            <div>2021-01-31</div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </FlexibleTable>
            </div>
        )
    }

    const [renderAll] = useFoldGenerate({
        sumArea,
        btnBindUses,
        areaContent,
        callback: frCallback,
        mark: "特性表折叠",
    })

    return (
        <div className="space-y-4">
            {pages.length <= 0 && (
                <div className="text-center print:hidden">
                    <Link href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Solidify#Solidify`}>
                        <h2 id="Solidify" className="text-2xl font-bold mt-4">
                            管道特性表的单元选择
                        </h2>
                    </Link>
                </div>
            )}

            <div id="Characteristics"></div>
            {renderAll}
            {children}
        </div>
    )
}
