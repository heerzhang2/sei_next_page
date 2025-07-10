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
import { usePrefixDataTable } from "@/report/hook/usePrefixData"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import { useFormTableInit } from "@/report/hook/useFieldArrays"
import {useSearchParams} from "next/navigation";

/**壁厚测定报告
 *这一代：@不再用import(`./components/${path}`))动态导入的思路： @还是走正规的静态导入：编译时刻已经确定了文件名，不再依赖参数拼凑导入文件名了。构建时确定依赖，优化更充分，性能好点。
  *因为有空值赋值""的，#必须用 {o?.[tag] || '／'} 来替代 {o?.[tag] ?? '／'} 否则不会显示反斜杠。
 * 可重复分项：因为默认Collapse隐藏，所以没必要加hash导航: 比如<JumpTab  /TkmsPartSummary?original=1${apds}${apdr}#TkmsPartSummary_${redId}`}>
 * */
export const ThickMsVw = ({
                              orc,
                              rep,
                              title = "壁厚测定报告",
                              subrid,
                              redId,
                              parOrc,
                              apxid,
                              useh2,
                              printMode,
                              children, unfold,
                          }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const renderUpper = usePrefixDataTable({ config: config壁厚测仪, orc, rep, slash: true })
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    //{title}这里不加上id； id需上一层的div统一做添加的。
    const render=()=><>
        <FlexibleTable columnWidths={["9.9%", "6.8%", "37%", "12.1%", "4%", "%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"TkmsInstrument"} subrid={subrid} redId={redId}>
                    {renderUpper}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'TkmsPartSummary_'+redId} columnWidths={ ["17%", "18%", "10.2%", "10.2%", "16%", "7.2%", "%"] }>
            <TableHeader>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/TkmsPartSummary?original=1${apds}${apdr}#TkmsPartSummary_${redId}`}>
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
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/TkmsPartSummary?original=1${apds}${apdr}#TkmsPartSummary_${redId}`}>
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
        <FlexibleTable columnWidths={["17%", "18%", "12%", "12%", "16%", "9%", "%"]}>
            <TableBody>
                <TableRow className="text-sm">
                    <CCell>检测标准</CCell>
                    <TableCell className="border border-gray-700" colSpan={6}>
                        GB/T 11344-2021《无损检测 超声测厚》
                        <br />
                        NB/T 47013.3-2015 《承压设备无损检测 第3部份：超声检测》
                    </TableCell>
                </TableRow>
                <TableRow id={'TkmsDiagram_'+redId}  className="border border-gray-700">
                    <TableCell colSpan={7} className="border border-gray-700">
                        <RepLink ori rep={rep} tag={"TkmsDiagram"} subrid={subrid} redId={redId}>
                            <div className="text-sm">测厚点位置示图：&nbsp;
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
        <FlexibleTable id={'TkmsMeasurement_'+redId} columnWidths={["8.7%", "7.96%", "8.7%", "7.96%", "8.7%", "7.96%", "8.7%", "7.96%", "8.7%", "7.96%", "8.7%", "%",]}>
            <TableHeader>
                <RepLink ori rep={rep} tag={"TkmsMeasurement"} subrid={subrid} redId={redId}>
                    <TableRow className="text-sm">
                        <CCell colSpan={12}>测 厚 记 录 （ 测点厚度单位：㎜）</CCell>
                    </TableRow>
                    <TableRow>
                        {new Array(6).fill(null).map((a: any, i: number) => {
                            return (
                                <React.Fragment key={i}>
                                    <CCell className="text-sm">测点编号</CCell>
                                    <CCell className="text-xs">测点厚度</CCell>
                                </React.Fragment>
                            )
                        })}
                    </TableRow>
                </RepLink>
            </TableHeader>
            <TableBody>
                {(orc.测厚表??[]).length === 0 ? (
                    <RepLink ori rep={rep} tag={"TkmsMeasurement"} subrid={subrid} redId={redId}>
                        <TableRow>
                            <CCell colSpan={12}>暂无数据</CCell>
                        </TableRow>
                    </RepLink>
                ) : (
                    (orc.测厚表 || []).map(({n1, v1,n2, v2,n3, v3,n4, v4,n5, v5,n6, v6}: any, i: number) => (
                        <JumpTab key={i}  href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/TkmsMeasurement?original=1${apds}${apdr}&from=${i}#TkmsMeasurement`}>
                            <TableRow >
                                <CCell className="break-all text-sm">{n1 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v1 || "／"}</CCell>
                                <CCell className="break-all text-sm">{n2 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v2 || "／"}</CCell>
                                <CCell className="break-all text-sm">{n3 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v3 || "／"}</CCell>
                                <CCell className="break-all text-sm">{n4 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v4 || "／"}</CCell>
                                <CCell className="break-all text-sm">{n5 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v5 || "／"}</CCell>
                                <CCell className="break-all text-sm">{n6 || "／"}</CCell>
                                <CCell className="break-all text-sm">{v6 || "／"}</CCell>
                            </TableRow>
                        </JumpTab>
                    ))
                )}
            </TableBody>
        </FlexibleTable>
        <FlexibleTable id={'TkmsConclusion_'+redId} columnWidths={["%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={"TkmsConclusion"} subrid={subrid} redId={redId}>
                    <TableRow>
                        <TableCell split={true} colSpan={6} className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <span className="block">备注：</span>
                            <span className="block indent-[2rem] text-left">{orc.记录备注 || '／'}</span>
                        </TableCell>
                    </TableRow>
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
                <span className="block text-center text-xs">FJB/JK 1050-0-2022</span>
                <div className="flex justify-between">
                    &nbsp;
                    <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
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

export const config壁厚测仪 = [
    [["设备名称", "设备名称"], ["设备编号", "设备编号"],],
    [["仪器型号", "仪器型号"], ["仪器编号", "仪器编号"],],
    [["仪器精度", "仪器精度", "mm"], ["耦合剂", "耦合剂"],],
]

export const config部位汇总 = [
    ["部位名称", "n", 125], ["材质", "c", 95], ["公称厚度mm", "t", 75], ["腐蚀裕量mm", "f", 75],
    ["表面状况", "b", 90], ["实测点数", "d", 55], ["实测最小壁厚mm", "r", 90],
] as Each_ZdSetting[]
interface ThkPartSummaryProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
// const modType = "THICK_MS"
/**可复用的： 仪器表录入页面的
 * */
export const TkmsPartSummary = ({
                                    children,
                                    show,
                                    label,
                                    rep,
                                    config = config部位汇总,
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
    const { storage, } = useStorage()
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
    {title: "壁厚测定-部位名称", url: "#TkmsPartSummary"},
    {title: "测厚点位置", url: "#TkmsDiagram"},
    {title: "测厚记录", url: "#TkmsMeasurement"},
    {title: '壁厚测定-结果', url: "#TkmsConclusion"},
];
