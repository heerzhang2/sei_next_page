"use client"
import * as React from "react";
import {CollapsibleFormSection} from "@/components/chub";
import {Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle,Label,Textarea} from "@/components/ui";
import {cn} from "@/lib/utils";
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { useStorage } from "@/report/StorageContext"
import { SmartTruncatedText } from "@/components/smart-truncated-text"
import { Edit, X, } from "lucide-react"
import {InternalItemProps} from "@/report/common/base";


//const itemA = ['证书说明' ];
/**保留 编辑常见的范式；
* */
export const CertMemo =
    (
        {
            rep,
            children,
            show = true,
            label,
        }:InternalItemProps
    ) => {
    const { storage } = useStorage()
    const [content, setContent] = React.useState<string>(storage?.['证书说明'] ?? "")
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
        setContent(storage?.['证书说明'] ?? "")
    }

    const [render] = useFrameEditorBar({ rep, values: { ['证书说明']: content }, onReset })

    const isAnyEditing = editingIndex !== null || isAddingNew || isInserting

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            证书说明的编辑器
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
                                                    <SmartTruncatedText
                                                        maxLines={1}
                                                        text={content}
                                                        uniqueKey={`project-${0}-ml`}
                                                        containerClassName="w-full"
                                                    />
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
