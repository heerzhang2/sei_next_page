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
import {CfootMensLine,} from "@/report/common/view"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { useThreeColumnSurvey} from "@/report/hook/usePrefixData"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"

//可重复分项模式的，没有独立流转子报告的版本号，依附于主报告。 确保名称与 Projects记录 中的一致；可重复分项的name命名冲突检查是独立于主报告的。没有独立的Entrance初始化和原始记录ALL列表。
export const UltrasoundVw = ({
                              orc,
                              rep,
                              title = "焊接接头超声检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const renderUpper = useThreeColumnSurvey({ config: config超声仪概, orc, rep, slash: true })
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    //{title}这里不加上id； id需上一层的div统一做添加的。
    const render=()=><>
        <FlexibleTable id={'SoniInstrument_'+redId} columnWidths={ ["5%", "6%", "37%", "5%", "7.9%","%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"SoniInstrument"} subrid={subrid} redId={redId}>
                    {renderUpper}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'SoniEvaluation_'+redId} className="text-sm border-collapse"
                       columnWidths={ ["10%", "6%", "9%", "%", "7%", "6%", "6%", "6%", "9%", "6%", "15%"] }>
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SoniEvaluation?original=1${apds}${apdr}#SoniEvaluation_${redId}`}>
                    <TableRow><CCell colSpan={11} className="font-bold">焊 接 接 头 超 声 检 测 结 果 评 定 表</CCell></TableRow>
                    <TableRow>
                        {config部位汇总.map(([title, _2, _1], i: number) => {
                            return (
                                <CCell key={i} className={(i===1||i===4||i===5||i===6||i===7||i===9)? "leading-[1] p-0" :''}>
                                  {printMode? (i===4? <>深度<br/>mm</>: i===7? <>波幅<br/>dB</>:title): title}
                                </CCell>
                            )
                        })}
                    </TableRow>
                </JumpTab>
            </TableHeader>
            <TableBody>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SoniEvaluation?original=1${apds}${apdr}#SoniEvaluation_${redId}`}>
                    {orc?.部位表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config部位汇总.map(([_1, tag, _3], k: number) => {
                                return (
                                    <CCell key={k} className="break-all text-sm">
                                        {o?.[tag] || "／"}
                                    </CCell>
                                )
                            })}
                        </TableRow>
                    ))}
                    {!(orc?.部位表?.length > 0)  && (
                        <TableRow><CCell colSpan={11}>空的</CCell></TableRow>
                    )}
                </JumpTab>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'SoniConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"SoniConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell className="border border-gray-700">
                            检测结果：<br/>
                            <div className="min-h-[3rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                {orc?.结果 || '／'}
                            </div>
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
        title={<>
                <TComponent className="text-2xl text-center mt-4">
                    {title}
                    <span className="text-base">{apxid}</span>
                </TComponent>
                <span className="block text-center text-xs">FJB/JK 1044-0-2018</span>
            </>}
    >
        {unfold ? render() :
            <CollapseFx printMode={printMode} subrid={subrid}>
                {render()}
            </CollapseFx>
        }
    </PrintReserveLeast>
    )
}

const 检测方法选=['一次反射波法' ];
const 扫查方式选=['垂直焊缝平行扫查' ];
export const config超声仪概 = [
    [['设备名称', '_$设备名称'], ['部件名称', '部件'] ],
    [['设备编号', '设备编号'], ['部件编号', '部件编号'] ],
    [['设备类别','设备类'],['规格尺寸','规格尺寸']],
    [['材质', '材质'], ['表面状态', {n:'表面',t:'l',l:['经表面处理后']}]],
    [['热处理状态', '热处理'], ['检测时机', '检测时机']],
    [['检测部位', '检测部位'], ['坡口型式', '坡口']],
    [['检测比例',{n:'检测比',u:'%'}], ['检测标准', '标准']],
    [['合格级别', '合格级'], ['检测技术等级', '技术级']],
    [['仪器型号', '仪器型'], ['仪器编号', '仪器号']],
    [['探头型号', '探头型'], ['试块型号', '试块型']],
    [['耦 合 剂', '耦合剂'], ['耦合补偿', {n:'耦补偿',u:'dB'}]],
    [['检测方法', {n:'检测法',t:'l',l:检测方法选}], ['检测灵敏度', {n:'灵敏度',u:'dB'}]],
    [['检测面', {n:'检测面',t:'l',l:['外表面']} ], ['扫查方式', {n:'扫查式',t:'l',l:扫查方式选}]],
];
//编辑器2列；显示需改为3列的：const config= mergeToThreeColumn(config1);

export const config部位汇总=[['焊缝编号','n',110],
    ['壁厚mm','h',70],
    ['缺陷编号','f',95],
    ['缺陷位置','p',95],
    ['长度mm','L',80],
    ['深度mm','D',75],
    ['高度mm','H',75],
    ['波幅dB','b',70],
    ['缺陷类型','t',95, {t:'L',l:['未焊透/整条']} ],
    ['评定级别','c',70, {t:'H',l:['Ⅳ级','Ⅲ级','Ⅱ级','Ⅰ级']} ],
    ['备注/检测长度','m',180, {t:'B'}]
] as Each_ZdSetting[];

interface SoniEvaluationProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const SoniEvaluation = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config部位汇总,
                                    subrid,
                                    redId,modType
                                }: SoniEvaluationProps) => {
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
    }, [children, nestRenderer])
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Sonic=[
    {title: "接头超声-概要仪器", url: "#SoniInstrument"},
    {title: "接头超声评定表", url: "#SoniEvaluation"},
];

export const soni结果选=['未见超标缺陷，检测结果为1级。',
];
