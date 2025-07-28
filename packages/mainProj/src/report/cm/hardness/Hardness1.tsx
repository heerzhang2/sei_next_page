"use client"
import * as React from "react"
import {CollapsibleFormSection, InputDatalist} from "@/components/chub"
import {Card, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage, Separator,} from "@/components/ui"
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
import {three2TwoColumn} from "@/report/common/survey";
import {useThreeColumnSubr} from "@/report/hook/useThreeColumnSubr";


export const HardnessVw = ({
                              orc,
                              rep,
                              title = "硬度检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode,_S] = useThreeColumnSubr({config: config硬度测仪, orc, parentOrc: parOrc, slash: true,split:[5]})
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    //{title}这里不加上id； id需上一层的div统一做添加的。
    const render=()=><>
        <FlexibleTable id={'HardInstrument_'+redId} columnWidths={ ["13.6%","25%","12.9%","18%","9%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"HardInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                    <TableRow>
                        <CCell>试验环境条件</CCell><CCell>{orc?.环境}</CCell>
                        <CCell>检测标准</CCell><CCell colSpan={3}>GB/T17394.1-2014《金属材料里氏硬度试验第1部分试验方法》</CCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'HardDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"HardDiagram"} subrid={subrid} redId={redId}>
                            <div className="text-sm">测点位置示意图：&nbsp;
                                {orc?.点图说明 && <span className="whitespace-pre-wrap">{orc.点图说明 || "／"}</span>}
                                {!(orc?._FILE_S部位?.length > 0) && !orc?.点图说明 && (
                                    <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                )}
                            </div>
                        </RepLink>
                        {orc?._FILE_S部位?.map(({ name, url }: any, i: number) => {
                            return (
                                <div key={i} className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                    {i > 0 && <hr className="my-[1px] border-blue-900"/>}
                                    <JumpTab
                                        key={i}
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/HardDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
                                    >
                                        <div className="flex justify-around items-center my-0.5">
                                            {url && (
                                                <ImageComponent
                                                    src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${url}`}
                                                    alt={url || "图片"}
                                                    className={cn(
                                                        "w-auto h-auto",
                                                        i > 0 ? "print:max-h-[calc(100vh-2.5rem)]" : "print:max-h-[calc(100vh-5.9rem)]",
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </JumpTab>
                                </div>
                            )
                        })}
                    </TableCell>
                </TableRow>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'HardEvaluation_'+redId} columnWidths={ ["17%","11%","11%","11%","%","11%","11%","11%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/HardEvaluation?original=1${apds}${apdr}#HardEvaluation_${redId}`}>
                    <TableRow>
                        <CCell rowSpan={2}>试验部位编号</CCell><CCell colSpan={3}>硬度值(单位: {orc?.单位??'HB'} )</CCell>
                        <CCell rowSpan={2}>试验部位编号</CCell><CCell colSpan={3}>硬度值(单位: {orc?.单位??'HB'} )</CCell>
                    </TableRow>
                    <TableRow><CCell>母材</CCell><CCell>热影响区</CCell><CCell>焊缝</CCell><CCell>母材</CCell><CCell>热影响区</CCell><CCell>焊缝</CCell>
                    </TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/HardEvaluation?original=1${apds}${apdr}#HardEvaluation_${redId}`}>
                    {orc?.部位表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config评定.map(([_1, tag, _3], k: number) => {
                                return (
                                    <CCell key={k} className="break-all text-sm">
                                        {o?.[tag] || "／"}
                                    </CCell>
                                )
                            })}
                        </TableRow>
                    ))}
                    {!(orc?.部位表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'HardConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"HardConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <span className="block">备注：</span>
                            <span className="block indent-[2rem] text-left">{orc.备注 || '／'}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <p>检测结果：</p>
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

const render试材质={
    view:(orc:any, parentOrc:any)=>{
        return <span>试样材质/标准</span>
    },
    t: '试样材质/标准水电费',
};
export const 现场结果选=["符合要求","不符合要求"];
const 部件名称选=['工艺管道' ];
const 仪器型号选=['MH660' ];
const 冲击装置选=['D' ];
const 试样材质选=['20' ];
const 热处理选=['原始状态' ];
const 耦合方式选=['刚性支承' ];
const 冲击方向选=['水平' ];
const config硬度测仪 = [
    [['设备名称', '_$设备名称'],  ['部件名称', {n:'部件',t:'l',l:部件名称选}] ],
    [['测量仪器名称', '仪器名'],  ['测量仪器编号', '仪器编'] ],
    [['测量仪器型号',{n:'仪器型',t:'l',l:仪器型号选}], ['冲击装置类型',{n:'冲击',t:'l',l:冲击装置选}], ['检测日期',{n:'测日',t:'d'}] ],
    [[render试材质,{n:'材质',t:'l',l:试样材质选}], ['热处理状态',{n:'热处',t:'l',l:热处理选}], ['表面状态','表面'] ],
    [['试验温度', {n:'温度',u:'℃'}], ['耦合方式',{n:'耦合',t:'l',l:耦合方式选}], ['冲击方向', {n:'冲向',t:'l',l:冲击方向选}] ],
    //这底下若加 ['检测标准',{n:'环境',r:'ld'}] ，正式报告的列数与位置分配{1+2,1+2列数}不符合正常输出！，#只能另外拆开额外区分处理了。
    [['试验环境条件',{n:'环境',t:'l',l:现场结果选}] ]
];

//编辑器需改为2列的：
export const config硬度仪 = three2TwoColumn(config硬度测仪);

export const config评定=[ ['试验部位编号1','n1',90],['母材','M1',60],['热影响区','R1',60], ['焊缝','f1',60],
    ['试验部位编号2','n2',90],['母材','M2',60],['热影响区','R2',60], ['焊缝','f2',60]
] as Each_ZdSetting[];

interface HardEvaluationProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const HardEvaluation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config评定,
                                    subrid,
                                    redId,modType
                                }: HardEvaluationProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["部位表"] = z.array(z.object(schemaTab))
        schemaFields['单位'] = z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "部位表", config)
        fields['单位'] = subStore?.['单位'] ?? ""
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        const itemTemplate = {} as any
        return [{ name: "部位表", itemTemplate }]
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
        table: "部位表",
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
                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
{/*                        <FormField name={`单位`} control={form.control} render={({ field }) => (
                            <FormHybridSelect field={field} label='硬度值的单位:' options={["HB"]} autoComplete="on"/>
                        )}/>*/}
                        <FormField name={`单位`} control={form.control}
                           render={({ field }) => (
                               <FormItem className="pt-2 w-full break-inside-avoid col-span-1">
                                   <FormLabel className="select-text">硬度值的单位:</FormLabel>
                                   <FormControl className="w-full">
                                       <InputDatalist datalist={["HB"]} {...field} autoComplete="on"/>
                                       {/*<BlobInputList {...field} rows={1} datalist={["HB"]} autoComplete="on"/>*/}
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                        )}/>
                    </div>
                    <Separator className="my-2"/>
                    <CardContent className="px-1">{nestRenderer}</CardContent>
                </Card>
                {children}
            </>
        )
    }, [form, children, nestRenderer])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Hard=[
    {title: "硬度检测测点位置图", url: "#HardDiagram"},
    {title: "硬度检测分析结果表", url: "#HardEvaluation"},
];

export const hard示说选=['见硬度检测附图。',
];
