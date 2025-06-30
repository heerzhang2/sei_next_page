"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, X } from "lucide-react"
import { cn } from "@/lib/utils"

// 模拟的类型定义
interface InternalItemProps {
    rep?: any
    children?: React.ReactNode
    show?: boolean
    label?: string
}

// 模拟的 hooks 和组件
const useStorage = () => ({
    storage: {
        _modelkey_0: { 仪器编号: "仪器编号 - redId: 0 的数据内容" },
        _modelkey_1: { 仪器编号: "仪器编号 - redId: 1 的数据内容" },
        _modelkey_2: { 仪器编号: "仪器编号 - redId: 2 的数据内容" },
    },
    parrepfs: {},
})

const useFrameEditorBar = ({ rep, values, onReset, subrid, redId, modType }: any) => {
    return [
        () => (
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onReset}>
                    重置
                </Button>
                <Button size="sm">保存 (redId: {redId})</Button>
            </div>
        ),
    ]
}

const CollapsibleFormSection = ({ title, defaultOpen, children }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
    </div>
)

const modelkey = "modelkey" // 模拟的 modelkey


export const ThkmsInstrument = ({ rep, children, show = true, label = "仪器编号编辑器" }: InternalItemProps) => {
    const { storage, parrepfs } = useStorage()
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid") ?? undefined
    const redId = Number(searchParams!.get("redId")) ?? undefined

    // 存储重新定向到：可重复分项，或者独立流转的分项报告当中的某个分项。
    const subStore = storage?.[`_${modelkey}_${redId}`]

    const [content, setContent] = React.useState<string>(subStore?.["仪器编号"] ?? "")
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null) // 🔥 初始值改为 null
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [isInserting, setIsInserting] = React.useState(false)
    const [insertPosition, setInsertPosition] = React.useState<number | null>(0)
    const [editForm, setEditForm] = React.useState<string>("")
    const [editErr, setEditErr] = React.useState<string>()

    // 🔥 使用 ref 来跟踪上一次的 redId，避免不必要的重置
    const prevRedIdRef = React.useRef(redId)

    // 🔥 关键修复：只在 redId 真正变化时才重置状态
    React.useEffect(() => {
        if (prevRedIdRef.current !== redId) {
            console.log("redId 变化:", prevRedIdRef.current, "->", redId)

            const newSubStore = storage?.[`_${modelkey}_${redId}`]
            const newContent = newSubStore?.["仪器编号"] ?? ""

            // 更新内容
            setContent(newContent)

            // 重置编辑状态
            setEditingIndex(null)
            setIsAddingNew(false)
            setIsInserting(false)
            setInsertPosition(null)
            setEditErr("")

            // 更新 ref
            prevRedIdRef.current = redId
        }
    }, [redId, storage])

    // 🔥 使用 useCallback 稳定函数引用
    const startEdit = React.useCallback(
        (index: number) => {
            console.log("开始编辑:", index, "当前内容长度:", content.length)
            setEditingIndex(index)
            setEditForm(content)
            setIsAddingNew(false)
            setIsInserting(false)
            setInsertPosition(null)
            setEditErr("")
        },
        [content],
    )

    // 🔥 添加调试 useEffect
    React.useEffect(() => {
        console.log("编辑状态:", {
            editingIndex,
            isAddingNew,
            isInserting,
            contentLength: content.length,
            editFormLength: editForm.length,
        })
    }, [editingIndex, isAddingNew, isInserting, content, editForm])

    // 保存编辑
    const saveEdit = React.useCallback(() => {
        if (editingIndex !== null) {
            console.log("保存编辑:", editForm.substring(0, 50) + "...")
            setContent(editForm)
            setEditingIndex(null)
            setEditErr("")
        }
    }, [editingIndex, editForm])

    // 取消编辑
    const cancelEdit = React.useCallback(() => {
        console.log("取消编辑")
        setEditingIndex(null)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
        setEditErr("")
    }, [])

    // 更新表单字段
    const updateFormField = React.useCallback((value: string) => {
        setEditForm(value)
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
                            rows={10}
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
                    <Button onClick={saveEdit}>确认修改</Button>
                </div>
            </CardContent>
        </Card>
    )

    const onReset = React.useCallback(() => {
        const currentSubStore = storage?.[`_${modelkey}_${redId}`]
        const resetContent = currentSubStore?.["仪器编号"] ?? ""
        console.log("重置内容:", resetContent.substring(0, 50) + "...")
        setContent(resetContent)
        setEditForm(resetContent)
    }, [redId, storage])

    const [render] = useFrameEditorBar({
        rep,
        values: { ["仪器编号"]: content },
        onReset,
        subrid,
        redId,
        modType: "THICK_MS",
    })

    const isAnyEditing = editingIndex !== null || isAddingNew || isInserting

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                {/* 显示当前参数状态 */}
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">
                        当前参数: redId = {redId}, subrid = {subrid}
                    </p>
                    <p className="text-sm text-gray-600">数据源: {`_${modelkey}_${redId}`}</p>
                    <p className="text-sm text-gray-600">
                        编辑状态: {editingIndex !== null ? `正在编辑第 ${editingIndex} 项` : "未编辑"}
                    </p>
                </div>

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
                                        "flex items-center justify-between py-1 px-3 rounded-lg border transition-colors",
                                        editingIndex === 0 ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                    )}
                                >
                                    <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                                        <div className="col-span-2 text-sm text-black min-w-0">{content || "暂无数据"}</div>
                                    </div>

                                    <div className="flex items-center space-x-0 ml-0 flex-col gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                console.log("点击编辑按钮, 当前状态:", { editingIndex, isAnyEditing })
                                                startEdit(0)
                                            }}
                                            disabled={isAnyEditing}
                                            className="size-9 px-1"
                                            aria-label="修改"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {/* 编辑表单 */}
                                {editingIndex === 0 && (
                                    <div>
                                        <p className="text-xs text-green-600 mb-2">✅ 编辑表单已展开</p>
                                        {renderEditForm(editForm, "edit")}
                                    </div>
                                )}
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
