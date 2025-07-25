"use client"
import * as React from "react"
import {BlobInputList, CollapsibleFormSection} from "@/components/chub"
import {Card, CardContent, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableHeader, TableRow,TableCell } from "@/components/flexible-table"
import { FootMensLine,} from "@/report/common/view"
import { useCallback } from "react"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"

//耐压试验: 可选分项， 但不是可重复的分项：
export const HydrostaticTestVw = ({
                              orc, rep, title = "耐压试验报告",
                              parOrc, printMode, children,
                          }: RepVwProps) => {
  return (
    <PrintReserveLeast reserve="6rem"
        title={<>
                <h2 id={'HydrostaticTest'} className="text-2xl text-center mt-4 mb-2">
                    {title}
                </h2>
       </>}
    >
        <FlexibleTable  className="text-sm border-collapse"
                       columnWidths={ ["5%", "%", "30%", "16%", "22%"] }>
            <TableHeader>
                <TableRow>
                    <CCell className="text-xs leading-[1] p-0">序号</CCell>
                    {config耐压试验.map(([title, _2, _1], i: number) => {
                        return (
                            <CCell key={i} className={(i===5)? "text-xs leading-[1] p-0" :''}>
                                {title}
                            </CCell>
                        )
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={"HydrostaticTest"}>
                    {orc?.耐压验表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            <CCell>{i+1}</CCell>
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
                        <TableRow><CCell colSpan={5}>空的</CCell></TableRow>
                    )}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"HydrostaticTest"}>
                    <TableRow>
                        <TableCell split={true} colSpan={6} className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <span className="block">试验结果：</span>
                            <span className="block indent-[2rem] text-left">{orc.耐压验结 || '／'}</span>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine />
    </PrintReserveLeast>
    )
}

export const config耐压试验=[['单位内编号','n',120],
    ['试验介质','m',80, {t:'B',l:['水','油'],s:1}],
    ['试验压力','P',85, {u:'MPa'}],
    ['试验日期','d',120, {t:'M'}]
] as Each_ZdSetting[];
interface ThkPartSummaryProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const itemA耐压验 = ['耐压验结', "耐压验表"];
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
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["耐压验表"] = z.array(z.object(schemaTab))
        schemaFields['耐压验结'] = z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(storage, "耐压验表", config)
        fields['耐压验结'] = storage['耐压验结'] ?? ""
        return fields
    }, [storage, config])
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
        externalData: storage,
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
                <Card className="py-1 mb-2 gap-1 m-auto">
                    <CardHeader>
                        <CardTitle>耐压试验结果</CardTitle>
                    </CardHeader>
                    <CardContent className="px-1">
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                            <FormField name={`耐压验结`} control={form.control}
                                render={({ field }) => (
                                    <FormItem className="pt-2 w-full break-inside-avoid col-span-2 @5xl:col-span-4 @5xl:row-span-2">
                                        <FormLabel className="select-text">试验结果:</FormLabel>
                                        <FormControl className="w-full">
                                            <BlobInputList datalist={["合格。" ]} {...field} autoComplete="on"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                            )}/>
                        </div>
                    </CardContent>
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
