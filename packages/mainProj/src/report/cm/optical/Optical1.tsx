"use client"
import * as React from "react"
import {CollapsibleFormSection, } from "@/components/chub"
import {Card, CardContent, } from "@/components/ui"
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


export const OpticalVw = ({
                              orc,
                              rep,
                              title = "光谱检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode] = useThreeColumnSubr({config: config光谱测仪, orc, parentOrc: parOrc, slash: true})
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    const render=()=><>
        <FlexibleTable id={'OptcInstrument_'+redId} columnWidths={ ["11%","28%","12.9%","11%","9%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"OptcInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'OptcEvaluation_'+redId} columnWidths={ ["12%","29%","12%","11%","11%","6%","%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/OptcEvaluation?original=1${apds}${apdr}#OptcEvaluation_${redId}`}>
                    <TableRow>
                        <CCell rowSpan={2}>序号</CCell><CCell rowSpan={2}>检测部位</CCell><CCell rowSpan={2}>试件规格</CCell>
                        <CCell colSpan={2}>设计材质</CCell>
                        <CCell rowSpan={2}>检查数量</CCell><CCell rowSpan={2}>分析结果</CCell>
                    </TableRow>
                    <TableRow><CCell>母材</CCell><CCell>焊材</CCell></TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/OptcEvaluation?original=1${apds}${apdr}#OptcEvaluation_${redId}`}>
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
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'OptcDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"OptcDiagram"} subrid={subrid} redId={redId}>
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
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/OptcDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
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
        <FlexibleTable id={'OptcConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"OptcConclusion"} subrid={subrid} redId={redId}>
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

const 部件名称选=['工艺管道' ];
const 仪器型号选=['X-MET5000' ];
const 取样方法选=['光谱' ];

export const config光谱测仪 = [
    [['设备名称', '_$设备名称'],  ['部件名称', {n:'部件',t:'l',l:部件名称选}]],
    [['仪器型号',{n:'仪器型',t:'l',l:仪器型号选}], ['仪器编号', '仪器编'] ],
    [['执行标准', '检标准'],  ['取样方法', {n:'取样',t:'l',l:取样方法选}]],
];

const 焊材选=['20','不明'];
export const config评定=[['序号','n',80],['检测部位','B',180],['试件规格','G',90],
    ['母材','c',70,{t:'l',l:焊材选}],
    ['焊材','h',70,{t:'l',l:焊材选}], ['检查数量','s',55],
    ['分析结果','r',90, {t:'l',l:['符合要求']} ]
] as Each_ZdSetting[];


interface OptcEvaluationProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const OptcEvaluation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config评定,
                                    subrid,
                                    redId,modType
                                }: OptcEvaluationProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["部位表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "部位表", config)
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        return [{ name: "部位表", itemTemplate:{} }]
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

export const cat_Optc=[
    {title: "光谱检测测点位置图", url: "#OptcDiagram"},
    {title: "光谱检测分析结果表", url: "#OptcEvaluation"},
];

export const optc示说选=['见光谱检测附图。',
];
