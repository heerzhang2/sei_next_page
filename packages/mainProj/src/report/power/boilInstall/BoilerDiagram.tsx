"use client"
import * as React from "react";
import {CollapsibleFormSection} from "@/components/chub";
import {Badge, Card, CardContent, CardFooter, CardHeader, CardTitle,Label,Textarea} from "@/components/ui";
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import {InternalItemProps, RepLink} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";
import {useUppyUpload} from "@/report/hook/useUppyUpload";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {JumpTab} from "@/report/common/JumpTab";
import {FootMensLine} from "@/report/common/view";
import {ImageComponent} from "@/components/shub";


interface ProjectItem {
    简图说明: string
    _FILE_S简图?: string
}
//锅炉简图
export const itemA简图=['简图说明','_FILE_S简图',];
/**保留 编辑常见的范式；
 * 复杂的表单的确不采用useForm真不方便，编辑器简单的还可以对付。
 * */
export const BoilerDiagram =
({  rep,
    children,
    show = true,
    label,
}:InternalItemProps) => {
    const {storage,setStorage,modified,setModified} =useStorage();
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
    const [render] = useFrameEditorBar({ rep, values: { ...editForm }, onReset })
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
                                            <Label htmlFor="page" className="select-text">
                                                说明：
                                            </Label>
                                            <Textarea
                                                rows={20}
                                                id="page"
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

interface BoilerDiagramVwProps{
    orc: any;
    rep: any;
    title?: string;
    children?: React.ReactNode
}
/**锅炉结构简图
 * */
export const BoilerDiagramVw= ({ orc, rep, title='1.2锅炉结构简图', children}: BoilerDiagramVwProps
) => {
    return (<>
        <PrintReserveLeast reserve="6rem"
                           title={<>
                               <h2 id={"BoilerDiagram"} className="text-2xl text-center mt-4">{title}</h2>
                               <div className="flex justify-between">
                                   <span className="text-sm">工程名称：{orc?.工程名称}</span>
                                   <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                               </div>
                           </>}>
            <FlexibleTable columnWidths={["62%", "%"]} className="text-sm">
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={2} className="border border-gray-700">
                            <RepLink ori rep={rep} tag={'BoilerDiagram'}>
                              <div>
                                {orc.简图说明 &&
                                    <span className="text-sm whitespace-pre-wrap">
                                        {orc.简图说明 || '／'}
                                    </span>
                                }

                                {!(orc?._FILE_S简图?.length>0) && !orc.简图说明 && <span className="text-center">空的，进入上传吧</span>}
                              </div>
                            </RepLink>
                            {orc?._FILE_S简图?.map(({name, url}: any, i: number) => {
                                return <div key={i} className="break-inside-avoid-page">
                                    {i>0 && <hr/>}
                                    <JumpTab key={i} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/BoilerDiagram?#BoilerDiagram_pf${i}`}>
                                        <div className="flex justify-around items-center my-0.5">
                                            {url && (
                                                <ImageComponent
                                                    src={`${process.env.NEXT_PUBLIC_OSS_ENDP}${url}`}
                                                    alt={url || "图片"}
                                                    className="w-auto h-auto"
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
        </PrintReserveLeast>
    </>)
};
