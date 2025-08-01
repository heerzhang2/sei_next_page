"use client"
import * as React from "react"
import {CollapsibleFormSection, } from "@/components/chub"
import {Card, CardContent, } from "@/components/ui"
import { initFormTable, useFormFramework, } from "@/report/hook/useFormFramework"
import {type InternalItemProps, RepLink, type RepVwProps} from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {CfootMensLine, } from "@/report/common/view"
import {ImageComponent} from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import {z} from "zod"
import type { UseFormReturn } from "react-hook-form"
import {useThreeColumnSubr} from "@/report/hook/useThreeColumnSubr";
import {three2TwoColumn} from "@/report/common/survey";
import {eqpTypeAllMap} from "@/dict/eqpComm";


export const PermeationVw = ({
                              orc,
                              rep,
                              title = "渗透检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode] = useThreeColumnSubr({config: config渗透测仪, orc, parentOrc: parOrc, slash: true})
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    const render=()=><>
        <FlexibleTable id={'PermInstrument_'+redId} columnWidths={ ["10.9%","24%","10.9%","23%","10.8%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"PermInstrument"} subrid={subrid} redId={redId}>
                    {upperNode}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'PermDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"PermDiagram"} subrid={subrid} redId={redId}>
                            <div className="text-sm">检测部位及缺陷位置示意图：&nbsp;
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
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/PermDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
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
        <FlexibleTable id={'PermEvaluation_'+redId} columnWidths={ ["%","14%","14%","10%","20%","7%","19%"] } className="text-sm border-collapse">
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/PermEvaluation?original=1${apds}${apdr}#PermEvaluation_${redId}`}>
                    <TableRow><CCell colSpan={7}>渗 透 检 测 结 果 评 定 表</CCell></TableRow>
                    <TableRow><CCell>部位编号</CCell><CCell>缺陷编号</CCell>
                        <CCell>缺陷位置</CCell><CCell>长度(mm)</CCell><CCell>缺陷性质</CCell>
                        <CCell className="leading-[1] p-0">评定级别</CCell><CCell>备 注</CCell></TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={"PermEvaluation"} subrid={subrid} redId={redId} hash={'PermEvaluation_'+redId}>
                    {orc?.评定表?.map((o: any, i: React.Key) => (
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
                    {!(orc?.评定表?.length > 0)  && (
                        <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                    )}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'PermConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"PermConclusion"} subrid={subrid} redId={redId} hash={'PermConclusion_'+redId}>
                    <TableRow>
                        <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <p>检测结果：</p>
                            <span className="block indent-[2rem] text-left font-bold">{orc.结果 || '／'}</span>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <CfootMensLine href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
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
                <span className="block text-center text-xs">FJB/JK-1046-1-2018</span>
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

const 部件名称选=['焊接接头' ];
const 材质选=['316L' ];
const 表面状态选=['金属光泽（原始状态）' ];
const 热处理状态选=['处理' ];
const 检测时机选=['时机' ];
const 合格级别选=['Ⅰ级' ];
const 检测方法选=['ⅡC-d' ];
const 渗透时间选=['10min' ];
const render设备类别={
    view:(orc:any, parentOrc:any)=>{
        return <>{eqpTypeAllMap.get(parentOrc?.设备类别)}</>
    },
};
const config渗透测仪 = [
    [['设备名称', '_$设备名称'], ['设备编号', {n:'设备编',t:'B'}], ['设备类别', '_$设备类别',render设备类别]],
    [['部件名称', {n:'部件',t:'l',l:部件名称选}], ['部件编号', '部件号'], ['材质', {n:'材质',t:'l',l:材质选}]],
    [['规格尺寸','规格'], ['表面状态', {n:'表面',t:'l',l:表面状态选}], ['检测比例', '检比']],
    [['热处理状态', {n:'热处',t:'l',l:热处理状态选}], ['检测时机', {n:'时机',t:'l',l:检测时机选}], ['试块型号', '试块']],
    [['检测标准', '检标准'], ['合格级别', {n:'合级别',t:'l',l:合格级别选} ], ['检测方法', {n:'检法',t:'l',l:检测方法选}]],
    [['渗透剂型号', '渗剂型'], ['清洗剂型号', '清剂型'], ['显像剂型号', '显剂型']],
    [['工件温度', '件温'], ['渗透时间', {n:'透时',t:'l',l:渗透时间选}], ['显像时间', {n:'像时',t:'l',l:渗透时间选}]],
];
export const config渗透仪概 = three2TwoColumn(config渗透测仪);

const config评定=[['部位编号','n',100], ['缺陷编号','h',90],
    ['缺陷位置','p',80, {l:['0位']}],
    ['长度（mm）','l',85], ['缺陷性质','Q',130, {l:['未焊透/整条']}],
    ['评定级别','C',55, {l:['Ⅳ级','Ⅲ级','Ⅱ级','Ⅰ级']}],
    ['备 注','m',105]
] as Each_ZdSetting[];

interface EvaluationProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const PermEvaluation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config评定,
                                    subrid,
                                    redId,modType
                                }: EvaluationProps) => {
    const { storage, } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["评定表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "评定表", config)
        return fields
    }, [subStore, config])
    const arrayFields = React.useMemo(() => {
        return [{ name: "评定表", itemTemplate:{} }]
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
        table: "评定表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: 5,
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

export const cat_Perm=[
    {title: "渗透-部位缺陷位置图", url: "#PermDiagram"},
    {title: "渗透检测结果评定表", url: "#PermEvaluation"},
];

export const perm示说选=[`检测部位详见管道单线图2#、3#、4#、5#、8#、10#焊缝。`,
];

export const perm结果选=[`所测部位未见可记录缺陷显示，安全状况等级1级。`,
];
