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
import { ImageComponent } from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { useThreeColumnSurvey} from "@/report/hook/usePrefixData"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import {mergeToThreeColumn} from "@/report/common/survey";


export const MagneticVw = ({
                              orc,
                              rep,
                              title = "磁粉检测报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children,unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const renderUpper = useThreeColumnSurvey({ config: config磁粉概要, orc, rep, slash: true })
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    //{title}这里不加上id； id需上一层的div统一做添加的。
    const render=()=><>
        <FlexibleTable id={'MangInstrument_'+redId} columnWidths={ ["5%", "5%", "25%", "5%", "4%","22%", "6%","5%", "%"] } className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"MangInstrument"} subrid={subrid} redId={redId}>
                    {renderUpper}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["%"]}>
            <TableBody>
                <TableRow id={'MangDiagram_'+redId}  className="border border-gray-700">
                    <TableCell  className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"MangDiagram"} subrid={subrid} redId={redId} printMode={printMode}>
                            <div className="text-sm">检测部位、缺陷位置示意图：&nbsp;
                                {orc?.点图说明 && <span className="whitespace-pre-wrap">{orc.点图说明 || "／"}</span>}
                                {!(orc?._FILE_S部位?.length > 0) && !orc?.点图说明 && (
                                    <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                )}
                            </div>
                        </RepLink>
                        {orc?._FILE_S部位?.map(({ name, url }: any, i: number) => {
                            return (
                                <div key={i} className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                    {i > 0 && <hr />}
                                    <JumpTab
                                        key={i} printMode={printMode}
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/MangDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
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
        <FlexibleTable id={'MangPartSummary_'+redId} className="text-sm border-collapse"
                       columnWidths={ ["17%", "18%", "10.2%", "10.2%", "16%", "7.2%", "%"] }>
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/MangPartSummary?original=1${apds}${apdr}#MangPartSummary_${redId}`}>
                    <TableRow>
                        {config磁粉评定.map(([title, _2, _1], i: number) => {
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
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/MangPartSummary?original=1${apds}${apdr}#MangPartSummary_${redId}`}>
                    {orc?.部位表?.map((o: any, i: React.Key) => (
                        <TableRow key={i}>
                            {config磁粉评定.map(([_1, tag, _3], k: number) => {
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
        <FlexibleTable id={'MangConclusion_'+redId} columnWidths={["17%", "%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"MangConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <CCell>检测结果：</CCell>
                        <CCell>{orc.结果 || '／'}</CCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <CfootMensLine href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
        />
    </>

  return (
    <PrintReserveLeast
        reserve="6rem"
        title={
            <>
                <TComponent className="text-2xl text-center mt-4">
                    {title}
                    <span className="text-base">{apxid}</span>
                </TComponent>
                <span className="block text-center text-xs">FJB/JK 1045-0-2018</span>
                <div className="flex justify-between">
                    &nbsp;
                    <span className="text-sm @3xl:mr-4">报告编号：{rep?.isp.no}</span>
                </div>
            </>
        }
    >
        {unfold ? render() :
            <CollapseFx printMode={printMode} subrid={subrid}>
                {render()}
            </CollapseFx>
        }
    </PrintReserveLeast>
    )
}

const 设备类别选=['GC2','工艺管道' ];
const 材质选=['20' ];
const 表面状态选=['经表面处理后' ];
const 热处理状态选=['处理' ];
const 规格尺寸选=['见管道特性表' ];
const 检测标准选=["NB/T47013.4-2015" ];
const 灵敏度试片选=['A1:30/100' ];
const 检测时机选=['宏观检验后' ];
const 合格级别选=['Ⅰ级' ];
const 检测方法选=['连续法','湿法/连续法' ];
const 磁粉类型选=['非荧光磁粉' ];
const 磁悬液选=['低粘度油基' ];
const 磁化方法选=['磁轭法' ];
const 提升力选=['≥45N' ];

export const config磁粉仪概 = [
    [["设备名称", "_$设备名称"], ['设备编号', {n:'设备编',t:'l',l:['见特性表']}], ],
    [['设备类别', {n:'设备类',t:'l',l:设备类别选}], ["部件名称", "部件"], ],
    [["部件编号", "部件号"], ['材质', {n:'材质',t:'l',l:材质选}] ],
    [['规格尺寸',{n:'规格',t:'l',l:规格尺寸选}], ['表面状态', {n:'表面',t:'l',l:表面状态选}], ],
    [['热处理状态', {n:'热处',t:'l',l:热处理状态选}], ['检测标准', {n:'检标准',t:'l',l:检测标准选}], ],
    [['检测比例', {n:'检比例',t:'l',l:['27.3%（抽查）']} ], ['灵敏度试片', {n:'灵试',t:'l',l:灵敏度试片选}] ],
    [['检测时机', {n:'时机',t:'l',l:检测时机选}], ['合格级别', {n:'合级别',t:'l',l:合格级别选} ], ],
    [['检测方法', {n:'检法',t:'l',l:检测方法选}], ['磁粉类型', {n:'粉类',t:'l',l:磁粉类型选}] ],
    [['磁悬液', {n:'悬液',t:'l',l:磁悬液选}], ['磁化方法', {n:'磁化法',t:'l',l:磁化方法选}] ],
    [['提升力/磁化电流', {n:'升力',t:'l',l:提升力选}], ['施加方法','施法'],],
    [['电流类型', {n:'电类',t:'l',l:["交流" ]}] , ]
]
//编辑器2列；显示需改为3列的：
export const config磁粉概要 = mergeToThreeColumn(config磁粉仪概);

//配置第四个位置的{ t: type, l: list, u: unit, s: size }
export const config磁粉评定=[['部位编号','n',120],
    ['缺陷编号','h',90],
    ['缺陷位置','p',80, {t:'B',l:['0位']}],
    ['长度(mm)','l',85],
    ['缺陷性质','Q',120, {t:'B',l:['未焊透/整条']}],
    ['评定级别','C',55, {t:'B',l:['Ⅳ级','Ⅲ级','Ⅱ级','Ⅰ级']}],
    ['备 注','m',105] ] as Each_ZdSetting[];

interface ThkPartSummaryProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}

export const MangPartSummary = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config磁粉评定,
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
    {title: "磁粉检测部位缺陷示意图", url: "#MangDiagram"},
    {title: "磁粉检测评定表", url: "#MangPartSummary"},
];

export const mang示说选=['见单线图','对单线图中1-6 号焊缝外表面进行100%磁粉检测，未见超标缺陷。',
];
