"use client"
import * as React from "react"
import { CollapsibleFormSection } from "@/components/chub"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from "@/components/ui"
import { initFormTable, useFormFramework, useFrameEditorBar } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import { FootMensLine, tail测仪器 } from "@/report/common/view"
import { ImageComponent } from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import {usePrefixDataTable, useThreeColumnSurvey} from "@/report/hook/usePrefixData"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import { groupArray } from "@/report/tools"
import { useFormTableInit } from "@/report/hook/useFieldArrays"
import {getRepUnqIndexByNo} from "@/report/common/editor";
import {useSearchParams} from "next/navigation";
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
                              children,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const renderUpper = useThreeColumnSurvey({ config: config磁粉概要, orc, rep, slash: true })
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    //{title}这里不加上id； id需上一层的div统一做添加的。
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
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                </div>
            </>
        }
    >
        <CollapseFx printMode={printMode} subrid={subrid}>
            <FlexibleTable columnWidths={ ["5%", "5%", "25%", "5%", "4%","22%", "6%","5%", "%"] } className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={"MangInstrument"} subrid={subrid} redId={redId}>
                        {renderUpper}
                    </RepLink>
                </TableBody>
            </FlexibleTable>
            <FlexibleTable columnWidths={["%"]}>
                <TableBody>
                    <TableRow id={'TkmsDiagram_'+redId}  className="border border-gray-700">
                        <TableCell  className="border border-gray-700">
                            <RepLink ori rep={rep} tag={"TkmsDiagram"} subrid={subrid} redId={redId}>
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
                                            key={i}
                                            href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/TkmsDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
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
            <FlexibleTable id={'MangPartSummary_'+redId} columnWidths={ ["17%", "18%", "10.2%", "10.2%", "16%", "7.2%", "%"] }>
                <TableHeader>
                    <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/MangPartSummary?original=1${apds}${apdr}#MangPartSummary_${redId}`}>
                        <TableRow>
                            {config部位汇总.map(([title, _2, _1], i: number) => {
                                return (
                                    <CCell key={i} className="text-sm">
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
                            <TableRow><CCell colSpan={7}>空的</CCell></TableRow>
                        )}
                    </JumpTab>
                </TableBody>
            </FlexibleTable>

            <FlexibleTable id={'TkmsConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={"TkmsConclusion"} subrid={subrid} redId={redId}>
                        <TableRow>
                            <TableCell split={true} colSpan={6} className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                                <p>检测结果：</p>
                                <span className="block indent-[2rem] text-left">{orc.检测结果 || '／'}</span>
                            </TableCell>
                        </TableRow>
                    </RepLink>
                </TableBody>
            </FlexibleTable>

            <FootMensLine cap="检验"
                href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}
            />
        </CollapseFx>
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


export const config部位汇总 = [
    ["部位名称", "n", 125], ["材质", "c", 95], ["公称厚度mm", "t", 75], ["腐蚀裕量mm", "f", 75],
    ["表面状况", "b", 90], ["实测点数", "d", 55], ["实测最小壁厚mm", "r", 90],
] as Each_ZdSetting[]

//配置第四个位置的{ t: type, l: list, u: unit, s: size }
export const config磁粉评定=[['部位编号','n',120],['缺陷编号','h',90],
    ['缺陷位置','p',80, {t:'B',l:['0位']}],
    ['长度（mm）','l',85],['缺陷性质','Q',120, {t:'B',l:['未焊透/整条']}],
    ['评定级别','C',55, {t:'B',l:['Ⅳ级','Ⅲ级','Ⅱ级','Ⅰ级']}],
    ['备 注','m',105] ] as Each_ZdSetting[];

interface ThkPartSummaryProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
// const modType = "THICK_MS"
/**可复用的： 仪器表录入页面的
 * */
export const MangPartSummary = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config磁粉评定,
                                    subrid,
                                    redId,modType
                                }: ThkPartSummaryProps) => {
    const { storage, setStorage, subrType, modified, setModified } = useStorage()
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
    const tailview = <>{tail测仪器}</>
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
        tailview,
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
/**方便：用户分块跳行的布局输入。 一次录入6组。
 * 不再用groupArray(orc.测厚表 || [], 6).map((group, groupIndex) => (
* */
export const config测厚表 = [
    ["点1编号", "n1", 100],
    ["点1厚度", "v1", 50],
    ["点2编号", "n2", 100],
    ["点2厚度", "v2", 50],
    ["点3编号", "n3", 100],
    ["点3厚度", "v3", 50],
    ["点4编号", "n4", 100],
    ["点4厚度", "v4", 50],
    ["点5编号", "n5", 100],
    ["点5厚度", "v5", 50],
    ["点6编号", "n6", 100],
    ["点6厚度", "v6", 50],
] as Each_ZdSetting[]
const pageSize=10;
export const TkmsMeasurement = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config测厚表,
                                    subrid,
                                    redId,
                                    modType,
                                }: ThkPartSummaryProps) => {
    const { storage, setStorage, subrType, modified, setModified } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const { schema, defaultValues, arrayFields } = useFormTableInit(subStore, "测厚表", config)
    const searchParams = useSearchParams()
    const tblIdx =searchParams!.get("from")
    const toPage =Math.floor((Number(tblIdx)??0 )/pageSize) ??0
    const headview = <span className={"text-xs"}>
        测厚记录表格,每6个点为一组进行录入。
    </span>
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType,
    })
    const [nestRenderer] = useTableEdit({
        form,
        arrayControls,
        config: config,
        table: "测厚表",
        onConfirm,
        externalData: subStore,
        defFixedLay: true,
        headview,
        pageSize: pageSize,
        toPage,
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

   //旧模板允许的 ？可能并没有测厚表的录入的; 而是使用的说明，参考图片： 参见单线图
   // <BlobInputList  value={inp?.参见图 ||''} datalist={['详见管道单线图']} onListChange={v => setInp({ ...inp, 参见图: v || undefined}) } />
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

interface ConclusionItem {
    检测结果: string
    记录备注?: string
}
export const TkmsConclusion = ({ rep, children, show = false, label, subrid, redId, modType }: InternalItemProps) => {
    const { storage } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const [editForm, setEditForm] = React.useState<ConclusionItem>({
        检测结果: subStore?.["检测结果"] ?? "",
        记录备注: subStore?.["记录备注"],
    })
    const [oldValue] = React.useState<ConclusionItem>(editForm)
    const [editErr, setEditErr] = React.useState<string>()
    const onReset = () => {
        setEditForm({ ...oldValue })
    }
    const [render] = useFrameEditorBar({ rep, values: { ...editForm }, onReset, subrid, redId, modType })
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">检测结果的编辑器</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            <div key={0}>
                                <Card className="mt-1 gap-1 py-1">
                                    <CardContent className="space-y-1 px-2">
                                        <div className="grid grid-cols-1 gap-1">
                                            <div className="space-y-2">
                                                <Label htmlFor="page" className="select-text">
                                                    记录备注：
                                                </Label>
                                                <Textarea
                                                    className="min-h-[14rem] resize-y"
                                                    id="page"
                                                    value={editForm.记录备注 || ""}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            记录备注: e.target.value,
                                                        })
                                                    }
                                                    placeholder="输入更多文字"
                                                />
                                                <Label htmlFor="page" className="select-text">
                                                    检测结果：
                                                </Label>
                                                <Textarea
                                                    className="min-h-[10rem] resize-y"
                                                    id="page"
                                                    value={editForm.检测结果 || ""}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            检测结果: e.target.value,
                                                        })
                                                    }
                                                    placeholder="输入更多文字"
                                                />
                                                {editErr && <p className="text-sm text-red-600">{editErr}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
                {children}
            </div>
        </CollapsibleFormSection>
    )
}

export const cat_Thickms=[
    {title: "测量部位名称", url: "#TkmsPartSummary"},
    {title: "测厚点位置", url: "#TkmsDiagram"},
    {title: "测 厚 记 录", url: "#TkmsMeasurement"},
    {title: '检测结果', url: "#TkmsConclusion"},
];
