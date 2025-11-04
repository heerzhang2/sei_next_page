"use client"
import * as React from "react";
import {BlobInputList, CollapsibleFormSection} from "@/components/chub";
import {
    Badge,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Label,
} from "@/components/ui";
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import {InternalItemProps, RepLink} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";
import {useUppyUpload} from "@/report/hook/useUppyUpload";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {JumpTab} from "@/report/common/JumpTab";
import {FootMensLine} from "@/report/common/view";
import {ImageComponent} from "@/components/shub";
import {cn} from "@/lib/utils";

/*上传图+说明;
* */
interface FxDiagramProps  extends InternalItemProps{
    //_FILE_S简图     _FILE_简图
    pic: string;
    memo: string;
    maxFile?: number;
    dlist?: string[];
}

// interface ProjectItem {
//     简图说明: string
//     _FILE_S简图?: string
// }
/**保留 编辑常见的范式；
 * 复杂的表单的确不采用useForm真不方便，编辑器简单的还可以对付。
 * */
export const FxDiagram = ({
                              rep,
                              children,
                              show = false,
                              label, maxFile=1, memo, pic, modType, subrid,redId,dlist
                          }:FxDiagramProps) => {
    const {storage,setStorage,subrType,modified,setModified} =useStorage();
    const subStore=storage?.[`_${modType}_${redId}`];

    const initialState=()=>({
        [memo]:  subStore?.[memo] ?? "",
    } as any);

    const [editForm, setEditForm] = React.useState<any>(()=>initialState())
    const [content, ] = React.useState<any>(()=>initialState())
    const [editErr, setEditErr] = React.useState<string>()

    const updateFormField = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }))
    }

    const onReset = () => {
        setEditForm(content)
    }
    //依赖项必须加上， 否则：可能同一个上传文件，被保存给到多个分项的存储对象。
    const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
        // setStorage({...storage, [pic]: upfile});
        setStorage((prevStorage : any) =>{
            const oldStore=prevStorage?.[`_${modType}_${redId}`];
            return ({
                ...prevStorage,
                [`_${modType}_${redId}`]: {...oldStore, [pic]: upfile}
            })
        })
        !modified && setModified(true);
    }, [modType,redId, storage, modified,pic, setStorage,setModified]);

    //【特殊】导航hash:"FxDiagram_pf"是给右边的编辑器用的，而通常的hash都是配合用于左边的著内容列表做的导航。
    const [uploadDom]=useUppyUpload({ repId:rep?.id!,
        maxFile:maxFile, onFinish,
        storeObj: subStore?.[pic] || [],
        liveDays: 10, hash:"FxDiagram_pf", maxSize:9999
    });
    //不是列表对象的编辑输入可以省略掉:不需要从editForm传递给setContent {某一个表行的记录对象再倒腾一次}。
    const [render] = useFrameEditorBar({
        rep,
        transformValues: () => ({ [memo]: editForm?.[memo] || "" }),
        onReset,
        subrid,
        redId,
        modType
    })
    // const [render] = useFrameEditorBar({ rep, values: { ['仪器编号']: content }, onReset,subrid,redId,modType:"THICK_MS"})

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            &nbsp;  <Badge variant="secondary">这里共 {subStore?.[pic]?.length || 0} 个图</Badge>
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
                                            <BlobInputList className="w-full min-h-[8rem] resize-y"
                                                   id="memojt"
                                                   datalist={dlist}
                                                   value={editForm?.[memo] || ""}
                                                   onChange={(val) => updateFormField(memo, val)}
                                                   placeholder="输入更多文字"
                                            />
                                            {editErr && <p className="text-sm text-red-600">{editErr}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* 新增按钮和表单 */}
                            {label}的图：
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


interface FxDiagramVwProps{
    orc: any;
    rep: any;
    title?: string;
    children?: React.ReactNode
    tag?: string;
}
/** #还 未 用？
 * 简图 ，可复用性？
 * */
export const FxDiagramVw= ({ orc, rep, title='1.2锅炉结构简图', children,tag='FxDiagram'}: FxDiagramVwProps
) => {
    return (<>
        <PrintReserveLeast reserve="6rem"
                           title={<>
                               <h2 id={tag} className="text-2xl text-center mt-4">{title}</h2>
                               <div className="flex justify-between">
                                   <span className="text-sm">工程名称：{orc?.工程名称}</span>
                                   <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                               </div>
                           </>}>
            <FlexibleTable columnWidths={["62%", "%"]} className="text-sm">
                <TableBody>
                    <TableRow className="border border-gray-700">
                        <TableCell colSpan={2} className="border border-gray-700">
                            <RepLink ori rep={rep} tag={tag}>
                              <div>
                                {orc.简图说明 &&
                                    <span className="text-sm whitespace-pre-wrap">
                                        {orc.简图说明 || '／'}
                                    </span>
                                }

                                {!(orc?._FILE_S简图?.length>0) && !orc.简图说明 && <span className="block m-4 text-xl text-center">空的，进入上传吧</span>}
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
        </PrintReserveLeast>
    </>)
};
