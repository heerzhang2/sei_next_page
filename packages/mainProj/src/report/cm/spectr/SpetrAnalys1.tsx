"use client"
import * as React from "react"
import { CollapsibleFormSection } from "@/components/chub"
import { Card, CardContent } from "@/components/ui"
import { initFormTable, useFormFramework } from "@/report/hook/useFormFramework"
import { type InternalItemProps, RepLink, type RepVwProps } from "@/report/common/base"
import { useStorage } from "@/report/StorageContext"
import { PrintReserveLeast } from "@/components/print-reserve-least"
import { CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow } from "@/components/flexible-table"
import { JumpTab } from "@/report/common/JumpTab"
import {FootMensLine} from "@/report/common/view"
import { ImageComponent } from "@/components/shub"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { CollapseFx } from "@/report/common/collapse"
import { type Each_ZdSetting, useTableEdit } from "@/report/hook/use-table-edit"
import { z } from "zod"
import type { UseFormReturn } from "react-hook-form"
import { useThreeColumnSubr } from "@/report/hook/useThreeColumnSubr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, AlertTriangle } from "lucide-react"
import { useFieldArray } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

const MAX_ELMS_SIZE=12;
const WIDTH_YSN=[
    [13, 17, 40, ],     //小于3个 化学 元素：
    [12, 14, 50, ],     //小于6个元素的：
    [10, 12, 58, ],     //小于9个元素的：
    [5.5, 9, 69, ],      //超多个的元素的：
];
export const SpetrAnalysVw = ({
                                  orc,
                                  rep,
                                  title = "光谱分析报告",
                                  subrid,
                                  redId,
                                  parOrc,
                                  apxid,
                                  useh2,
                                  printMode,
                                  children,
                                  unfold,
                              }: RepVwProps) => {
    const TComponent = useh2 ? "h2" : "div"
    const [upperNode] = useThreeColumnSubr({ config: config光析仪概, orc, parentOrc: parOrc, slash: true })
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    const elsSize = orc?.元素?.length || 0
    //纯粹动态的 config评定 配置表：  # 新改动元素符号的要保存后才会同步左边页面的。
    const { configNew, fixedWidth } = React.useMemo(() => {
        const addings = new Array(elsSize || 1).fill(null).map((_, w: number) => {
            const title = orc?.元素?.[w];
            return [title, title, 55] as Each_ZdSetting
        })
        const configNew = [...config评定.slice(0, 2), ...addings, ...config评定.slice(2)]
        const likePct = WIDTH_YSN[elsSize > 8 ? 3 : elsSize > 5 ? 2 : elsSize > 2 ? 1 : 0]
        const ysEach = likePct[2] / (elsSize || 1)
        const fixedWidth = [likePct[0] + "%", likePct[1] + "%"]
        for (let e = 0; e < (elsSize || 1); e++) {
            fixedWidth.push(ysEach + "%")
        }
        fixedWidth.push("%") //剩下都算是备注那列的 100%--；
        return { configNew, fixedWidth }
    }, [elsSize, orc?.元素, config评定])

    const render = () => (
        <>
            <FlexibleTable id={"SpetInstrument_" + redId} columnWidths={ ["9.3%", "32%", "10.9%", "9.3%", "9%", "%"] } className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={"SpetInstrument"} subrid={subrid} redId={redId} hash={"SpetInstrument_" + redId}>
                        {upperNode}
                    </RepLink>
                </TableBody>
            </FlexibleTable>
            <FlexibleTable columnWidths={["%"]}>
                <TableBody>
                    <TableRow id={"SpetDiagram_" + redId} className="border border-gray-700">
                        <TableCell className="border border-gray-700">
                            <RepLink ori rep={rep} tag={"SpetDiagram"} subrid={subrid} redId={redId}>
                                <div className="text-sm">
                                    检测部位图：&nbsp;
                                    {orc?.点图说明 && <span className="whitespace-pre-wrap">{orc.点图说明 || "／"}</span>}
                                    {!(orc?._FILE_S部位?.length > 0) && !orc?.点图说明 && (
                                        <span className="block m-4 text-xl text-center">空的，进入上传吧</span>
                                    )}
                                </div>
                            </RepLink>
                            {orc?._FILE_S部位?.map(({ name, url }: any, i: number) => {
                                return (
                                    <div key={i} className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                        {i > 0 && <hr className="my-[1px] border-blue-900" />}
                                        <JumpTab
                                            key={i}
                                            href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SpetDiagram?original=1${apds}${apdr}#FxDiagram_pf${i}`}
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
            {!(elsSize > 0) ? (
                <RepLink ori rep={rep} tag={"SpetElementSet"} subrid={subrid} redId={redId}>
                    <p className={"text-xl font-bold text-center w-full"}>空的，必须首先确定元素集合！</p>
                </RepLink>
            ) : (
                <FlexibleTable id={"SpetChemicCompo_" + redId} columnWidths={ fixedWidth } className="text-sm border-collapse">
                    <TableHeader>
                        <RepLink ori rep={rep} tag={"SpetElementSet"} subrid={subrid} redId={redId}>
                            <TableRow>
                                <CCell rowSpan={2}>序号</CCell>
                                <CCell rowSpan={2}>标称材质</CCell>
                                <CCell colSpan={elsSize || 1}>元素及含量（％）</CCell>
                                <CCell rowSpan={2}>备注</CCell>
                            </TableRow>
                            <TableRow>
                                {configNew.map(([title, _2, _1], i: number) => {
                                    if (i <= 1 || i >= 2 + (elsSize || 1)) return null
                                    return <CCell key={i}>{title}</CCell>
                                })}
                            </TableRow>
                        </RepLink>
                    </TableHeader>
                    <TableBody>
                        <RepLink ori rep={rep} tag={"SpetChemicCompo"} subrid={subrid} redId={redId} hash={"SpetChemicCompo_" + redId}>
                            {orc?.含量表?.map((o: any, i: React.Key) => (
                                <TableRow key={i}>
                                    {configNew.map(([_1, tag, _3], k: number) => {
                                        return (
                                            <CCell key={k} className="break-all text-sm">
                                                {o?.[tag] || "／"}
                                            </CCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                            {!(orc?.含量表?.length > 0) && (
                                <TableRow>
                                    <CCell colSpan={elsSize+3}>空的</CCell>
                                </TableRow>
                            )}
                        </RepLink>
                    </TableBody>
                </FlexibleTable>
            )}
            <FlexibleTable id={"SpetConclusion_" + redId} columnWidths={["%"]} className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={"SpetConclusion"} subrid={subrid} redId={redId} hash={"SpetConclusion_" + redId}>
                        <TableRow>
                            <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                                <span className="block">备注：</span>
                                <span className="block indent-[2rem] text-left">{orc.备注 || '／'}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                                <p>分析结果：</p>
                                <span className="block indent-[2rem] text-left">{orc.结果 || "／"}</span>
                            </TableCell>
                        </TableRow>
                    </RepLink>
                </TableBody>
            </FlexibleTable>
            <FootMensLine cap='检测' href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}/>
        </>
    )

    return (
        <PrintReserveLeast
            reserve="6rem"
            title={
                <>
                    <TComponent className="text-2xl text-center mt-4">
                        {title}
                        <span className="text-base">{apxid}</span>
                    </TComponent>
                    <span className="block text-center text-xs">FJB/JK-10523-0-2016</span>
                    <div className="flex justify-between">
                        <span className="text-sm">单位内部编号：{parOrc.单位内部编号}</span>
                        <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                    </div>
                </>
            }
        >
            {unfold ? (
                render()
            ) : (
                <CollapseFx printMode={printMode} subrid={subrid}>
                    {render()}
                </CollapseFx>
            )}
        </PrintReserveLeast>
    )
}

const 部件名称选 = ["工艺管道"]
const 仪器型号选 = ["PMI-MASTER Pro2"]
const 取样方法选 = ["光谱"]

/**原来的第一项：使用单位； ？？
 * */
export const config光析仪概 = [
    [
        ["设备名称", "_$设备名称"],
        ["部件名称", { n: "部件", t: "l", l: 部件名称选 }],
    ],
    [
        ["仪器型号", { n: "仪器型", t: "l", l: 仪器型号选 }],
        ["仪器编号", "仪器编"],
    ],
    [
        ["执行标准", {n:"检标准",l:['GB/T 4336-2016'] }],
        ["取样方法", { n: "取样", t: "l", l: 取样方法选 }],
    ],
]

const config评定 = [
    ["序号", "n", 70],
    ["标称材质", "b", 90, { l: ["20"] }],
    ["备注", "m", 110, { l: ["Φ108弯头"] }],
] as Each_ZdSetting[]

// 常用元素选项
const 常用元素选项 = [
    "C", "Si", "Mn", "P", "S", "Cr", "Ni", "Mo", "Cu", "Al", "Ti", "V", "Nb", "W",
    "Co", "Fe", "Mg", "Ca", "Zn", "Pb", "Sn", "As", "Sb", "Bi", "N", "O", "Cd",
]

// 禁止输入的元素
const 禁止元素 = ["n", "b", "m"]

interface SpetChemicCompoProps extends InternalItemProps {
    config?: Each_ZdSetting[]
}
export const SpetChemicCompo = ({
                                   children,
                                   show,
                                   label,
                                   rep,
                                   config = config评定,
                                   subrid,
                                   redId,
                                   modType,
                               }: SpetChemicCompoProps) => {
    const { storage } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const elsSize = subStore?.元素?.length || 0
    const configNew = React.useMemo(() => {
        const addings = new Array(elsSize || 1).fill(null).map((_, w: number) => {
            const title = subStore?.元素?.[w];
            return [title, title, 55] as Each_ZdSetting
        })
        const configNew = [...config.slice(0, 2), ...addings, ...config.slice(2)]
        return configNew
    }, [elsSize, subStore?.元素, config])
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        configNew.forEach(([t, field, s, o, park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["含量表"] = z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [configNew])
    const defaultValues = React.useMemo(() => {
        const fields = initFormTable(subStore, "含量表", configNew)
        return fields
    }, [subStore, configNew])
    const arrayFields = React.useMemo(() => {
        return [{ name: "含量表", itemTemplate: {} }]
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
        config: configNew,
        table: "含量表",
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

//录入元素表 ，但是'n','b','m'三个除外。
export const SpetElementSet = ({ children, show, label, rep, subrid, redId, modType }: InternalItemProps) => {
    const { storage } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]

    // 检查初始数据长度是否超过12个
    const initialDataError = React.useMemo(() => {
        const initialElements = subStore?.元素 || []
        if (initialElements.length > MAX_ELMS_SIZE) {
            return `检测到数据异常：当前元素数量为 ${initialElements.length} 个，超过了最大限制 ${MAX_ELMS_SIZE} 个。请删除多余的元素。`
        }
        return null
    }, [subStore?.元素])

    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        schemaFields["元素"] = z
            .array(
                z
                    .string()
                    .min(1, "元素名称不能为空")
                    .refine((value) => !禁止元素.includes(value), {
                        message: `不允许输入元素: ${禁止元素.join(", ")}`,
                    }),
            )
            .max(MAX_ELMS_SIZE, `最多只能添加${MAX_ELMS_SIZE}个元素`)
        return z.object(schemaFields)
    }, [])

    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        const initialElements = subStore?.元素 || []
        fields.元素 = initialElements
        return fields
    }, [subStore])

    const arrayFields = React.useMemo(() => {
        return [{ name: "元素", itemTemplate: "" }]
    }, [])

    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema,
        defaultValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "元素",
    })

    // 添加元素
    const handleAddElement = useCallback(() => {
        if (fields.length < MAX_ELMS_SIZE) {
            append("")
        }
    }, [append, fields.length])

    // 删除元素
    const handleRemoveElement = useCallback(
        (index: number) => {
            remove(index)
        },
        [remove],
    )

    // 快速添加常用元素
    const handleQuickAdd = useCallback(
        (element: string) => {
            if (fields.length < MAX_ELMS_SIZE && !form.getValues("元素").includes(element)) {
                // 检查是否为禁止元素
                if (禁止元素.includes(element.toLowerCase())) {
                    return
                }
                append(element)
            }
        },
        [append, fields.length, form],
    )

    const elementEditor = React.useMemo(() => {
        return (
            <div className="space-y-4">
                {/* 初始数据错误警告 */}
                {initialDataError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{initialDataError}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">元素设置 ({fields.length}/{MAX_ELMS_SIZE})</h5>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddElement}
                        disabled={fields.length >= MAX_ELMS_SIZE}
                        className="flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        添加元素
                    </Button>
                </div>

                {/* 禁止元素提示 */}
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <p>
                        注意：禁止输入以下元素：<span className="font-mono text-red-500">{禁止元素.join(", ")}</span>
                    </p>
                </div>

                {/* 常用元素快速添加 */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">常用元素快速添加：</p>
                    <div className="flex flex-wrap gap-1">
                        {常用元素选项.map((element) => {
                            const isAdded = form.watch("元素")?.includes(element)
                            const isForbidden = 禁止元素.includes(element.toLowerCase())
                            const canAdd = fields.length < MAX_ELMS_SIZE && !isAdded && !isForbidden
                            return (
                                <Button
                                    key={element}
                                    type="button"
                                    variant={isAdded ? "secondary" : isForbidden ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => handleQuickAdd(element)}
                                    disabled={!canAdd}
                                    className="h-8 px-4 text-sm"
                                    title={isForbidden ? "禁止添加此元素" : undefined}
                                >
                                    {element}
                                </Button>
                            )
                        })}
                    </div>
                </div>

                {/* 元素列表 */}
                <div className="space-y-2">
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>暂无元素，请添加元素</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Input {...form.register(`元素.${index}`)} placeholder={`元素 ${index + 1}`} className="h-8" />
                                        {Array.isArray(form.formState.errors.元素) && form.formState.errors.元素[index]?.message && (
                                            <p className="text-xs text-red-500 mt-1">{String(form.formState.errors.元素[index]?.message)}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveElement(index)}
                                        className="h-8 w-8 p-0 flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 错误信息 */}
                {form.formState.errors.元素?.root?.message && (
                    <p className="text-sm text-red-500">{String(form.formState.errors.元素.root.message)}</p>
                )}
            </div>
        )
    }, [fields, form, handleAddElement, handleRemoveElement, handleQuickAdd, initialDataError])

    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardContent className="px-4 py-4">{elementEditor}</CardContent>
                </Card>
                {children}
            </>
        )
    }, [elementEditor, children])

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

export const cat_Spet = [{ title: "光谱分析-元素含量表", url: "#SpetChemicCompo" }]

export const spet示说选 = [`详见单线图。`]

export const spet结果选 = [`所测样品化学成份符合20 (GB/T 8163-2008) 的要求`]
