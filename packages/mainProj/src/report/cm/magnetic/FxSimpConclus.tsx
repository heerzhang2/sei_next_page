"use client"
import * as React from "react";
import {BlobInputList, CollapsibleFormSection} from "@/components/chub";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Label, Textarea,
} from "@/components/ui";
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import {InternalItemProps} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";

/**可重复分项目项 的结果，和备注录入：
* */
interface FxSimpConclusProps  extends InternalItemProps{
    //结果存储字段
    clc: string;
    memo?: string;
    //结果可以选择的
    clist?: string[];
    //备注也能选
    mlist?: string[];
    //替换标题文字
    ticlc?: string;
    timemo?: string;
}
/**可重复分项模式的做法： 通用的；
 * 常见的编辑器：结果 备注； 加上参数，增加可复用的特征
 * */
export const FxSimpConclus =
({  rep,
    children,
    show = false,
    label, modType, subrid,redId,
    clc, memo, clist,mlist, ticlc,timemo,
}:FxSimpConclusProps) => {
    const { storage } = useStorage()
    const subStore = storage?.[`_${modType}_${redId}`]
    const [editForm, setEditForm] = React.useState<Record<string, string>>({
        [clc]: subStore?.[clc] ?? "",
        ...(memo !== undefined ? { [memo]: subStore?.[memo] ?? "" } : {}),
    });
    const [oldValue] = React.useState<Record<string,string>>(editForm)
    const [editErr, setEditErr] = React.useState<string>()
    const onReset = () => {
        setEditForm({ ...oldValue })
    }
    // 更新表单字段
    const updateFormField = (field: string, value: any) => {
        setEditForm((prev: any) => ({ ...prev, [field]: value }))
    }
    const [render] = useFrameEditorBar({ rep, transformValues: () => ({ ...editForm }), onReset, subrid, redId, modType })
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">{label}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            <div key={0}>
                                <Card className="mt-1 gap-1 py-1">
                                    <CardContent className="space-y-1 px-2">
                                        <div className="grid grid-cols-1 gap-1">
                                            <div className="space-y-2">
                                                {memo && <>
                                                    <Label htmlFor="memo" className="select-text">
                                                        {timemo ??'记录备注'}：
                                                    </Label>
                                                    { mlist?
                                                        <BlobInputList className="w-full min-h-[10rem] resize-y"
                                                                       id="memo"
                                                                       datalist={mlist}
                                                                       value={editForm?.[memo] || ""}
                                                                       onChange={(val) => updateFormField(memo, val)}
                                                                       autoComplete="on"
                                                        />
                                                        :
                                                        <Textarea
                                                            className="min-h-[14rem] resize-y"
                                                            id="memo"
                                                            value={editForm?.[memo] || ""}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    [memo]: e.target.value,
                                                                })
                                                            }
                                                            placeholder="输入更多文字"
                                                        />
                                                    }
                                                </>}
                                                <Label htmlFor="clc" className="select-text">
                                                    {ticlc ??'检测结果'}：
                                                </Label>
                                                <BlobInputList className="w-full min-h-[8rem] resize-y"
                                                           id="clc"
                                                           datalist={clist}
                                                           value={editForm?.[clc] || ""}
                                                           onChange={(val) => updateFormField(clc, val)}
                                                           autoComplete="on"
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
