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
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import {InternalItemProps, RepLink} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";
import {useUppyUpload} from "@/report/hook/useUppyUpload";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {CCell, FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {JumpTab} from "@/report/common/JumpTab";
import {FootMensLine} from "@/report/common/view";
import {ImageComponent} from "@/components/shub";
import {cn} from "@/lib/utils";
import {X, Edit, ChevronUp, ChevronDown} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import PdfOutlineAnalyzer from "@/components/pdf-outline-analyzer";
import {useEffect} from "react";
import {CollapseFx} from "@/report/common/collapse";
import {render设备类别} from "@/report/common/render";
import {input额定是} from "@/report/boiler/rarelyVary";
import {config证书概要, 许可级别选} from "@/report/power/boilInstall/orcBase";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";

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

interface ThickMsVwProps{
    //主报告实例
    rep: any;
    //分项情况的：直接使用当前分项项目专属存储做法。分离开其它的同类可重复分项
    orc?: any;
    //假如orc不是主报告整体存储的情形下，提供主报告存储数据。
    parOrc?: any;
    title?: string;
    children?: React.ReactNode
    //分项报告id
    subrid?: string;
    //分项报告里面的可重复分项的编号。
    redId?: number;
    //可重复分项目的附加后缀： 【定位】hash页面路由使用的，确保主报告中唯一性。
    apxid?: string;
    //避免pdf书签太多：
    useh2?: boolean;
    printMode?: boolean;
}
/**壁厚测定报告
 * */
export const ThickMsVw= ({orc, rep, title='壁厚测定报告',subrid,redId,parOrc,apxid,useh2,printMode,children}: ThickMsVwProps
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

