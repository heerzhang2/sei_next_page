"use client"
import * as React from "react"
import { CollapsibleFormSection } from "@/components/chub"
import { Card, CardContent, } from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {CfootMensLine, FootMensLine,} from "@/report/common/view"
import { ImageComponent } from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { useThreeColumnSurvey} from "@/report/hook/usePrefixData"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import {mergeToThreeColumn} from "@/report/common/survey";

//耐压试验: 可选分项， 但不是可重复的分项：
export const HydrostaticTestVw = ({
                              orc,
                              rep,
                              title = "耐压试验报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`

  return (
    <PrintReserveLeast
        reserve="6rem"
        title={
            <>
                <h2 id={'HydrostaticTest'} className="text-2xl text-center mt-4">
                    {title}
                    <span className="text-base">{apxid}</span>
                </h2>
                <span className="block text-center text-xs">FJB/JK 1045-0-2018</span>
                <div className="flex justify-between">
                    &nbsp;
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                </div>
            </>
        }
    >
        <FlexibleTable  className="text-sm border-collapse"
                       columnWidths={ ["17%", "18%", "10.2%", "10.2%", "16%", "7.2%", "%"] }>
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/MangPartSummary?original=1${apds}${apdr}#MangPartSummary_${redId}`}>
                    <TableRow>
                        {config耐压试验.map(([title, _2, _1], i: number) => {
                            return (
                                <CCell key={i} className={(i===5)? "text-xs leading-[1] p-0" :''}>
                                    {title}
                                </CCell>
                            )
                        })}
                    </TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={"HydrostaticTest"}>
                    {orc?.耐压验表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config耐压试验.map(([_1, tag, _3], k: number) => {
                                return (
                                    <CCell key={k} className="break-all text-sm">
                                        {o?.[tag] || "／"}
                                    </CCell>
                                )
                            })}
                        </TableRow>
                    ))}
                    {!(orc?.耐压验表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["17%", "%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"HydrostaticTest"}>
                    <TableRow>
                        <CCell>检测结果：</CCell>
                        <CCell>{orc.结果 || '／'}</CCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine />
    </PrintReserveLeast>
    )
}


export const config耐压试验=[['单位内编号','n',120],
    ['试验介质','m',80, {t:'B',l:['水','油']}],
    ['试验压力','P',85, {u:'MPa'}],
    ['试验日期','d',120, {t:'M'}]
] as Each_ZdSetting[];

interface ThkPartSummaryProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}

export const HydrostaticTest = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config耐压试验,
                                    subrid,
                                    redId,modType
                                }: ThkPartSummaryProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["耐压验表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "耐压验表", config)
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {} as any
        return [{ name: "耐压验表", itemTemplate }]
    }, [])

    const headview = <h5>{label}：</h5>
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })

    const [nestRenderer] = useTableEdit({
        form,
        arrayControls,
        config: config,
        table: "耐压验表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: 10,
    })
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-1">{nestRenderer}</CardContent>
                </Card>
                {children}
            </>
        )
    }, [children, nestRenderer])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Magne=[
    {title: "磁粉检测-概要仪器", url: "#MangInstrument"},
    {title: "检测部位缺陷示意图", url: "#MangDiagram"},
    {title: "磁粉检测评定表", url: "#MangPartSummary"},
    {title: '磁粉检测-检测结果', url: "#MangConclusion"},
];

export const mang示说选=['见单线图','对单线图中1-6 号焊缝外表面进行100%磁粉检测，未见超标缺陷。',
];
