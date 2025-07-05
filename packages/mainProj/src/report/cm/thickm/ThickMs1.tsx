"use client"
import * as React from "react";
import {CollapsibleFormSection} from "@/components/chub";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Collapsible, CollapsibleContent, CollapsibleTrigger,
    Label,
    Textarea
} from "@/components/ui";
import {useFormFramework, useFrameEditorBar} from "@/report/hook/useFormFramework"
import {InternalItemProps, RepLink, RepVwProps} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";
import {useUppyUpload} from "@/report/hook/useUppyUpload";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {JumpTab} from "@/report/common/JumpTab";
import {FootMensLine, tail测仪器} from "@/report/common/view";
import {ImageComponent} from "@/components/shub";
import {cn} from "@/lib/utils";
import {X, Edit, ChevronUp, ChevronDown} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import PdfOutlineAnalyzer from "@/components/pdf-outline-analyzer";
import {useCallback, useEffect} from "react";
import {CollapseFx} from "@/report/common/collapse";
import {render设备类别} from "@/report/common/render";
import {input额定是} from "@/report/boiler/rarelyVary";
import {config证书概要, 许可级别选} from "@/report/power/boilInstall/orcBase";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {Each_ZdSetting, useTableEdit} from "@/report/hook/use-table-edit";
import {z} from "zod";
import type {UseFormReturn} from "react-hook-form";
import {instrumentOption} from "@/report/common/Instrument";

//可以支持非规定中的子模板，衍生可重复分项项目存储设计目的，广义上的存储拆分和编制的做法；modelkey预期的分解个数数量不应太多的。
const modelkey="THICK_MS";
interface ProjectItem {
    简图说明: string
    _FILE_S简图?: string
}
//锅炉简图
export const itemA简图=['简图说明','_FILE_S简图',];
/**保留 编辑常见的范式；
 * 复杂的表单的确不采用useForm真不方便，编辑器简单的还可以对付。
 * */
export const ThickMs =
({  rep,
    children,
    show = true,
    label,
}:InternalItemProps) => {
    const {storage,setStorage,modified,setModified} =useStorage();
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid") ?? undefined
    const redId = Number(searchParams!.get("redId")) ?? undefined
    //原本editForm一表的其中一行对象。 但是这里改成非表格的模式：减少一层存储组织嵌套了。
    const initialState=()=>(
        {
            简图说明:  storage?.简图说明 ?? "",
        }  as ProjectItem
    );
    const [editForm, setEditForm] = React.useState<ProjectItem>(()=>initialState())
    //const [content, setContent]=React.useState<string>(storage?.[''] ??)不是列表对象的编辑输入可以省略掉:不需要从editForm传递给setContent{某一个表行的记录对象再倒腾一次}。
    const [content, ] = React.useState<ProjectItem>(()=>initialState())
    const [editErr, setEditErr] = React.useState<string>()
    // 更新表单字段
    const updateFormField = (field: keyof ProjectItem, value: any) => {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }
    const onReset = () => {
        //_FILE_S简图 : 特例对待的！ 必须保证一致性同步未见系统的数据，避免丢失文件管理者。_FILE_S简图：提取单独，自动确认的。
        setEditForm(content)
    }
    const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
        setStorage({...storage, '_FILE_S简图': upfile});
        !modified && setModified(true);
    }, [storage, modified,setStorage,setModified]);
    const [uploadDom]=useUppyUpload({ repId:rep?.id!,
        maxFile:5, onFinish, storeObj: storage?._FILE_S简图 ,liveDays:10, hash:"BoilerDiagram_pf"
    });
    //不是列表对象的编辑输入可以省略掉:不需要从editForm传递给setContent {某一个表行的记录对象再倒腾一次}。
    const [render] = useFrameEditorBar({ rep, values: { ...editForm }, onReset,subrid,redId,modType:"THICK_MS"})
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            &nbsp;  <Badge variant="secondary">这里共 {storage?._FILE_S简图?.length || 0} 个图</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            {/* 编辑表单 */}
                            <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                                <CardContent className="space-y-1 px-2">
                                    <div className="grid grid-cols-1 gap-1">
                                        <div className="space-y-2">
                                            <Label htmlFor="memojt" className="select-text">
                                                说明：
                                            </Label>
                                            <Textarea
                                                rows={20}
                                                id="memojt"
                                                value={editForm.简图说明}
                                                onChange={(e) => updateFormField("简图说明", e.target.value)}
                                                placeholder="输入更多文字"
                                            />
                                            {editErr && <p className="text-sm text-red-600">{editErr}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* 新增按钮和表单 */}
                            锅炉简图：
                            {uploadDom}
                            {children}
                        </div>
                        <span>注意：附件上传不能用重置按钮来撤销。</span>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
                {children}
            </div>
        </CollapsibleFormSection>
    )
}

/**壁厚测定报告
 * */
export const ThickMsVw= ({orc, rep, title='壁厚测定报告',subrid,redId,parOrc,apxid,useh2,printMode,children}: RepVwProps
) => {
    const TComponent=useh2? "h2":"div"
    const renderUpper=usePrefixDataTable({config: config壁厚测仪, orc, rep, slash:true});
        //{title}这里不加上id； id需上一层的div统一做添加的。
    return (<>
        <PrintReserveLeast reserve="6rem"
                           title={<>
                               <TComponent className="text-2xl text-center mt-4">{title}
                                   <span className="text-base">{apxid}</span>
                               </TComponent>
                               <div className="flex justify-between">
                                   <span className="text-sm">工程名称：{orc?.工程名称}</span>
                                   <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                               </div>
                           </>}>
            <CollapseFx printMode={printMode} subrid={subrid}>
                <FlexibleTable  columnWidths={["9.9%","6.8%","37%","12.1%","4%","%"]} className="text-sm border-collapse">
                    <TableBody>
                        <RepLink ori rep={rep} tag={'ThkmsInstrument'} subrid={subrid} redId={redId}>
                            {renderUpper}
                        </RepLink>

                        <RepLink ori rep={rep} tag={'ThkmsInstrument'} subrid={subrid} redId={redId}>
                            <TableRow className="border border-gray-700">
                                <CCell>仪器编号</CCell>
                                <TableCell  className="border border-gray-700">
                                    <div>
                                        {orc?.仪器编号 || '／'}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </RepLink>
                        <TableRow className="border border-gray-700">
                            <TableCell colSpan={2} className="border border-gray-700">
                                <RepLink ori rep={rep} tag={'BoilerDiagram'}>
                                    <div>
                                        {orc?.简图说明 &&
                                            <span className="text-sm whitespace-pre-wrap">
                                        {orc.简图说明 || '／'}
                                    </span>
                                        }

                                        {!(orc?._FILE_S简图?.length>0) && !orc?.简图说明 && <span className="block m-4 text-xl text-center">空的，进入上传吧</span>}
                                    </div>
                                </RepLink>
                                {orc?._FILE_S简图?.map(({name, url}: any, i: number) => {
                                    return <div key={i} className="break-inside-avoid-page pb-[1px] pt-[1px] overflow-hidden">
                                        {i>0 && <hr/>}
                                        <JumpTab key={i} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/BoilerDiagram?#BoilerDiagram_pf${i}`}>
                                            <div className="flex justify-around items-center my-0.5">
                                                {url && (
                                                    <ImageComponent
                                                        src={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${url}`}
                                                        alt={url || "图片"}
                                                        className={cn(
                                                            "w-auto h-auto",
                                                            i>0 ? "print:max-h-[calc(100vh-2.5rem)]" : "print:max-h-[calc(100vh-5.9rem)]",
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </JumpTab>
                                    </div>
                                }) }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </FlexibleTable>

                    <FlexibleTable id="Instrument" columnWidths={["17%","18%","12%","12%","16%","9%","%"]}>

                        <TableHeader>
                            <RepLink ori rep={rep} tag={'TkmsPartSummary'} subrid={subrid} redId={redId}>
                            <TableRow>
                                {config部位汇总.map(([title,_2,_1], i:number) => {
                                    return <CCell key={i} className="text-sm">{title}</CCell>;
                                }) }
                            </TableRow>
                            </RepLink>
                        </TableHeader>

                        <TableBody>
                            <RepLink ori rep={rep} tag={'TkmsPartSummary'} subrid={subrid} redId={redId}>
                            {orc.部位表?.map((o: any, i: React.Key) => (
                                <TableRow key={i}>
                                    {config部位汇总.map(([_1,tag,_3], k:number) => {
                                        return <CCell key={k} className="break-all text-sm">{o?.[tag]}</CCell>;
                                    }) }
                                </TableRow>
                            ))}
                            </RepLink>
                        </TableBody>

                    </FlexibleTable>

                <FootMensLine cap='监检' href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}/>
            </CollapseFx>
        </PrintReserveLeast>
    </>)
};


export const config壁厚测仪 = [
    [['设备名称', '设备名称'], ['设备编号', '设备编号']],
    [['仪器型号', '仪器型号'], ['仪器编号', '仪器编号']],
    [['仪器精度','仪器精度', 'mm'], ['耦合剂','耦合剂']],
];

//const itemA = ['仪器编号' ];
/**保留 编辑常见的范式；
 * 兼容分项 可重复分项，独立流转的分项：没法使用context直接局部化修改，框架左右俩个展示和编辑器分离的组装页面，不是同一个父辈组件的无法继承和拆分context
 * */
export const ThkmsInstrument =
    (
        {
            rep,
            children,
            show = true,
            label,
        }:InternalItemProps
) => {
    const { storage, parrepfs } = useStorage()
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid") ?? undefined
    const redId = Number(searchParams!.get("redId")) ?? undefined
    //存储重新定向到：可重复分项，或者独立流转的分项报告当中的某个分项。
    const subStore=storage?.[`_${modelkey}_${redId}`];

    const [content, setContent] = React.useState<string>(subStore?.['仪器编号'] ?? "")
    const [editingIndex, setEditingIndex] = React.useState<number | null>(0)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [isInserting, setIsInserting] = React.useState(false)
    const [insertPosition, setInsertPosition] = React.useState<number | null>(0)
    const [editForm, setEditForm] = React.useState<string>("")
    const [editErr, setEditErr] = React.useState<string>()

    // 保存编辑
    const saveEdit = () => {
        if (editingIndex !== null) {
            setContent(editForm)
            setEditingIndex(null)
            setEditErr("")
        }
    }
    // 开始编辑
    const startEdit = (index: number) => {
        setEditingIndex(index)
        setEditForm(content)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
    }
    // 取消编辑
    const cancelEdit = () => {
        setEditingIndex(null)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
        setEditErr("")
    }

    // 更新表单字段
    const updateFormField = (value: string) => {
        setEditForm(value)
    }
    React.useEffect(() => {
        startEdit(0)
    }, [])

    // 渲染编辑表单
    const renderEditForm = (item: string, type: "edit" | "add" | "insert" = "edit") => (
        <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
            {(type === "add" || type === "insert") && (
                <CardHeader className="pb-0">
                    <CardTitle>{type === "add" ? "长文本的加个分段" : `在第 ${insertPosition! + 1} 项前插入内容`}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="space-y-1 px-2">
                <div className="grid grid-cols-1 gap-1">
                    <div className="space-y-2">
                        <Label htmlFor="page" className="select-text">
                            说明：
                        </Label>
                        <Textarea
                            rows={20}
                            id="page"
                            value={item || ""}
                            onChange={(e) => updateFormField(e.target.value)}
                            placeholder="输入更多文字"
                        />
                        {editErr && <p className="text-sm text-red-600">{editErr}</p>}
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        取消
                    </Button>
                    <Button onClick={saveEdit}>
                        确认修改
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const onReset = () => {
        setContent(subStore?.['仪器编号'] ?? "")
    }
    const [render] = useFrameEditorBar({ rep, values: { ['仪器编号']: content }, onReset,subrid,redId,modType:"THICK_MS"})
    const isAnyEditing = editingIndex !== null || isAddingNew || isInserting

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            仪器编号的编辑器
                            <Badge variant="secondary">共 {content.length} 个字</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            <div key={0}>
                                {/* 项目展示行 */}
                                <div
                                    className={cn(
                                        "flex items-center justify-between py-1 @md:px-3 rounded-lg border transition-colors",
                                        editingIndex === 0 ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                    )}
                                >
                                    <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                                        <div className="col-span-2 text-sm text-black min-w-0">
                                            {content}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-0 ml-0 flex-col gap-4 @md:gap-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(0)}
                                            disabled={isAnyEditing}
                                            className="@md:size-9 px-1 has-[>svg]:px-1"
                                            aria-label="修改"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* 编辑表单 */}
                                {editingIndex === 0 && renderEditForm(editForm, "edit")}
                            </div>
                            {/* 新增按钮和表单 */}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
                {children}
            </div>
        </CollapsibleFormSection>
    )
}

// const config仪器表=[['测量设备名称','n',140],['规格型号','t',120],['测量设备编号','i',142],
//     ['性能状态-开机后','o',55,{t:'s',l:instrumentOption}],
//     ['性能状态-关机前','f',55,{t:'s',l:instrumentOption}]
// ] as Each_ZdSetting[];
export const config部位汇总=[['部位名称','n',125],['材质','c',95],['公称厚度mm','t',75],['腐蚀裕量mm','f',75],
    ['表面状况','b',90],['实测点数','d',55],['实测最小壁厚mm','r',90]] as Each_ZdSetting[];
interface ThkPartSummaryProps  extends InternalItemProps{
    config?: Each_ZdSetting[];
}

const modType="THICK_MS";
/**可复用的： 仪器表录入页面的
 * */
export const TkmsPartSummary = ({children, show, label, rep,config=config部位汇总,
                                   subrid, redId, }: ThkPartSummaryProps) => {
    const {storage,setStorage,subrType,modified,setModified} =useStorage();
    const subStore=storage?.[`_${modType}_${redId}`];
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        config.forEach(([t,field,s,o,park]) => {
            schemaTab[field] = z.string().optional()
        })
        schemaFields["部位表"]= z.array(z.object(schemaTab))
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["部位表"]= subStore?.["部位表"]
        return fields
    }, [subStore])
    const arrayFields =React.useMemo(() => {
        const itemTemplate = {} as any
        config.forEach(([t,field,s]) => {
            itemTemplate[field] = ""
        })
        return [ {name:"部位表", itemTemplate,} ]
    }, [])

    const headview=<h5>{label}：</h5>;
    const tailview=<>
        {tail测仪器}
    </>;
    const onConfirm = useCallback((form: UseFormReturn<any, any, any>) => handleConfirm(), [])
    const { render,handleConfirm,form,arrayControls } = useFormFramework({schema, defaultValues, arrayFields, rep,
        subrid, redId, modType:modType,
    })
    const [nestRenderer]=useTableEdit({form,arrayControls, config: config, table:'部位表',onConfirm,
        externalData: subStore,defFixedLay:true, headview,tailview, pageSize:10
    });
    const content = React.useMemo(() => {
            return (
                <>
                    <Card className="py-1 gap-1">
                        <CardContent className="px-1">
                            {nestRenderer}
                        </CardContent>
                    </Card>
                    {children}
                </>
            )
        },
        [children,nestRenderer],
    )
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(content)}
    </CollapsibleFormSection>;
};
