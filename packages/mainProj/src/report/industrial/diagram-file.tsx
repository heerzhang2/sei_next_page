"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
    Textarea,
} from "@/components/ui"
import {BlobInputList, CollapsibleFormSection} from "@/components/chub"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { useCallback, useState, useEffect } from "react"
import { toast } from "sonner"
import {useUppyUpload} from "@/report/hook/useUppyUpload";


//只能存储于主报告:单元表 单图表[{_FILE_ , "m": 说明},]；
interface EditorItem {
    //保留单元表，    ？扩展功能。
    单元表: IPipingUnitEntity[]
    单图表: IPipingUnitEntity[]
}
//编辑区域功能独立出来：避免混乱。只做图片上传的。
export const LineDiagramFile =
({  rep,
     children,
     show = false,
     label='单线图-文件上传',
 }:InternalItemProps) => {
    const searchParams = useSearchParams()
    const lineIndexParam = searchParams?.get("lineIndex") // 从URL获取单线图序号
    const {storage,setStorage,modified,setModified} =useStorage();

    //原本editForm一表的其中一行对象。 但是这里改成非表格的模式：减少一层存储组织嵌套了。
    const initialState=()=>(
        {
           m:  subStore?.[memo] ?? "",
        }  as any
    );
    const [editForm, setEditForm] = React.useState<any>(()=>initialState())
    //const [content, setContent]=React.useState<string>(storage?.[''] ??)不是列表对象的编辑输入可以省略掉:不需要从editForm传递给setContent{某一个表行的记录对象再倒腾一次}。
    const [content, ] = React.useState<any>(()=>initialState())
    const [editErr, setEditErr] = React.useState<string>()
    // 当前选中的单元索引
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const currentUnits = storage.单图表 || []
    // 根据lineIndex参数自动选择单元
    useEffect(() => {
        if (lineIndexParam && currentUnits.length > 0) {
            const index = Number.parseInt(lineIndexParam, 10)
            // 验证索引是否有效
            if (index >= 0 && index < currentUnits.length) {
                setSelectedIndex(index)
                // setMemoText(currentUnits[index].mm || "")
                console.log(`自动选择单元: 序号${index + 1}, 编码${currentUnits[index].code}`)
            } else {
                console.warn(`无效的单元索引: ${index}, 当前单元总数: ${currentUnits.length}`)
                toast.error(`无效的单元序号: ${index + 1}`)
            }
        }
    }, [lineIndexParam, currentUnits])

    // 更新表单字段
    const updateFormField = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }))
    }
    const onReset = () => {
        //_FILE_ 单线图，不能重置的：保证一致性同步未见系统的数据，避免丢失文件管理者。自动确认的。
        setEditForm(content)
    }
    //依赖项必须加上， 否则：可能同一个上传文件，被保存给到多个分项的存储对象。
    const onFinish = React.useCallback(async(upfile: any, del:boolean) => {
        // setStorage({...storage, [pic]: upfile});
        if(selectedIndex>=0){
            setStorage((prevStorage : any) =>{
                const oldStore=storage.单图表?.[selectedIndex];
                storage.单图表?.slice()
                return ({
                    ...prevStorage,
                    单图表: [] {...oldStore, [pic]: upfile}
                })
            })
        }
        setStorage((prevStorage : any) =>{
            const oldStore=prevStorage?.[`_${modType}_${redId}`];
            return ({
                ...prevStorage,
                [`_${modType}_${redId}`]: {...oldStore, [pic]: upfile}
            })
        })
        !modified && setModified(true);
    }, [selectedIndex, storage, modified]);

    //【特殊】导航hash:"FxDiagram_pf"是给右边的编辑器用的，而通常的hash都是配合用于左边的著内容列表做的导航。
    const [uploadDom]=useUppyUpload({ repId:rep?.id!,
        maxFile:1, onFinish,
        storeObj: selectedIndex>=0? storage.单图表?.[selectedIndex]._FILE_ || [] :[],
        liveDays:10, hash:"FxDiagram_pf"
    });
    //不是列表对象的编辑输入可以省略掉:不需要从editForm传递给setContent {某一个表行的记录对象再倒腾一次}。
    const [render] = useFrameEditorBar({ rep, values: { ...editForm }, onReset,})
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
                                                           value={editForm?.m || ""}
                                                           onChange={(val) => updateFormField("m", val)}
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
                        <span>注意：所有文件上传不能用重置按钮来撤销，需手动删除。</span>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
                {children}
            </div>
        </CollapsibleFormSection>
    )
}
