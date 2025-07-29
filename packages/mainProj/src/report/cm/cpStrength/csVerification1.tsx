"use client"
import * as React from "react"
import {BlobInputList, CollapsibleFormSection,} from "@/components/chub"
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle, FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage,
    Label,
    Textarea,
} from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {FootMensLine,} from "@/report/common/view"
import {ImageComponent} from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import {z} from "zod"
import type { UseFormReturn } from "react-hook-form"
import {useThreeColumnSubr} from "@/report/hook/useThreeColumnSubr";
import {three2TwoColumn} from "@/report/common/survey";
import {X} from "lucide-react";
import {LongArticleContent} from "@/report/cm/cpStrength/LongArticleFx";

//耐压强度校核： 上一代没做这个模板
export const CsVerificationVw = ({
                              orc,
                              rep,
                              title = "耐压强度校核报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode] = useThreeColumnSubr({config: config强度概况, orc, parentOrc: parOrc, slash: true})
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    const render=()=><>
        <FlexibleTable id={'CpsvInstrument_'+redId} columnWidths={ ["11%","28%","12.9%","11%","9%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"CpsvInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'CpsvCalculation_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"CpsvCalculation"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <span className="block">校核参数取值说明：</span>
                            <span className="block indent-[2rem] text-left">{orc.说明 || '／'}</span>
                        </TableCell>
                    </TableRow>
                </RepLink>
                <TableRow>
                    <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                        <p>壁厚校核计算：</p>
                        <LongArticleContent orc={orc} rep={rep} subrid={subrid} redId={redId} wsPre printMode={printMode}/>
                    </TableCell>
                </TableRow>
                <RepLink ori rep={rep} tag={"CpsvConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <p>校核结果：</p>
                            <span className="block indent-[2rem] text-left">{orc.结果 || '／'}</span>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
        />
    </>

  return (
    <PrintReserveLeast reserve="6rem"
        title={
            <>
                <TComponent className="text-2xl text-center mt-4">
                    {title}
                    <span className="text-base">{apxid}</span>
                </TComponent>
                <span className="block text-center text-xs">FJB/JK 1047-0-2018</span>
                <div className="flex justify-between">
                    <span className="text-sm">单位内部编号：{orc.单位内部编号}</span>
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                </div>
            </>
    }>
        {unfold ? render() :
            <CollapseFx printMode={printMode} subrid={subrid}>
                {render()}
            </CollapseFx>
        }
    </PrintReserveLeast>
    )
}

const 部件名称选=['Φ57/Φ57开孔补强' ];

const config强度概况 = [
    [['壁厚校核部位', {n:'部件',t:'l',l:部件名称选}], ['允许(监控)使用压力', {n:'许压力',u:'Mpa'}], ['实测内径', {n:'实内径',u:'mm'}] ],
    [['实测最小壁厚', {n:'最小厚',u:'mm'}], ['材料许用应力', {n:'许应力',u:'Mpa'}],  ['腐蚀裕量', {n:'蚀裕量',u:'mm'}] ],
    [['焊接接头系数', '接头系'], ['封头形状系数', '封形系'],  ['允许(监控)使用温度', {n:'许温度',u:'℃'}] ],
    [['校核选用标准', {n:'标准',t:'l',l:['GB50316-2000' ]}],  ],
];

export const config强度核概 = three2TwoColumn(config强度概况);

const 说明选=[
    `校核压力P= 1.0 MPa；校核温度：184 ℃；取 10 材料许用应力[б]t= 103MPa；
主管外径D0=76mm；主管实测最小厚度Ttn=3.55mm； 
支管外径d0= 76mm；支管实测最小壁厚 ttn=3.51mm；
α1= 90 °，sinα1= 1 ；主管厚度减薄负偏差的附加量C1m=0.5325 mm； 支管厚度减薄负偏差的附
加量C1t=0.5265 mm；系数Y=0.4；焊接接头系数Ej取 0.6 ，腐蚀裕量C2取1.0mm`,
];

const 计算选=[
    `Φ159管：
         Pw Do                        1.0×159
Ts1= -------------------- +C2 = ------------------------------- +1.0 =2.28mm ＜T1
     2 ([σ]tEj+PwY)                2（103×0.6+1.0×0.4）
Φ133管：
 Pw Do 1.0×133
Ts1= -------------------- +C2 = ------------------------------- +1.0 =2.07mm ＜T2
2 ([σ]tEj+PwY) 2（103×0.6+1.0×0.4）
Φ108管：
           Pw Do                      1.0×108
Ts1= -------------------- +C2 = ------------------------------- +1.0 =1.87mm ＜T3
          2 ([σ]tEj+PwY)            2（103×0.6+1.0×0.4）
Φ89管：
 Pw Do 1.0×89
Ts1= -------------------- +C2 = ------------------------------- +1.0 =1.72mm ＜T4
2 ([σ]tEj+PwY) 2（103×0.6+1.0×0.4）
Φ76管：
 Pw Do 1.0×76
Ts2= -------------------- +C2 = ------------------------------- +1.0 =1.61mm ＜T5
2 ([σ]tEj+PwY) 2（103×0.6+1.0×0.4）
Φ57管：
 Pw Do 1.0×57
Ts1= -------------------- +C2 = ------------------------------- +1.0 =1.46mm ＜T6
2 ([σ]tEj+PwY) 2（103×0.6+1.0×0.4）`,
];


export const CpsvCalculation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    subrid,
                                    redId,modType
                                }: InternalItemProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        schemaFields['说明'] = z.string().optional()
        schemaFields.校核计算 = z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields['说明'] =subStore?.['说明'] ||''
        fields.校核计算 =subStore?.校核计算 ||''
        return fields
    }, [subStore])
    const { render, form, } = useFormFramework({
        schema,
        defaultValues,
        rep,
        subrid,
        redId,
        modType: modType,
    })
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                    <CardContent className="space-y-1 px-2">
                        <div className="grid grid-cols-1 gap-1">
                            <div className="space-y-2">
                               <FormField name={`说明`} control={form.control}
                                   render={({ field }) => (
                                       <FormItem className="pt-2 w-full break-inside-avoid col-span-2 @5xl:col-span-4 @5xl:row-span-2">
                                           <FormLabel className="select-text">校核参数取值说明:</FormLabel>
                                           <FormControl className="w-full">
                                               <BlobInputList datalist={说明选} {...field} autoComplete="off"/>
                                           </FormControl>
                                           <FormMessage />
                                       </FormItem>
                               )}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                    <CardContent className="space-y-1 px-2">
                        <div className="grid grid-cols-1 gap-1">
                            <div className="space-y-2">
                                <FormField name={`校核计算`} control={form.control}
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid col-span-2 @5xl:col-span-4 @5xl:row-span-2">
                                               <FormLabel className="select-text">壁厚校核计算:</FormLabel>
                                               <FormControl className="w-full">
                                                   <BlobInputList datalist={计算选} {...field} autoComplete="off"/>
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                )}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {children}
            </>
        )
    }, [children])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Optc=[
    {title: "光谱检测测点位置图", url: "#OptcDiagram"},
    {title: "光谱检测分析结果表", url: "#OptcEvaluation"},
];

export const optc结果选=[
`1、经校核，剩余厚度满足强度要求。
注：本校核不代替设计计算，不能免除设计者责任。`,
];
