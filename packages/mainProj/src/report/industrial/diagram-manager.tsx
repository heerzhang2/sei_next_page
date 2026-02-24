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
} from "@/components/ui"
import { CollapsibleFormSection } from "@/components/chub"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { ArrowRight, Trash2, AlertTriangle, ExternalLink } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { toast } from "sonner"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import { useRouter } from "next/navigation"
import { withBasePath } from "@/lib/tool"

interface EditorItem {
    单元表: IPipingUnitEntity[]
    单图表: IPipingUnitEntity[]
}

export interface PendingOfflineState {
    isChecking: boolean
    hasPending: boolean
    pendingIndexes: number[]
}

export const SingleLineDiagram = ({ children, show, label = "管道单线图-管理", rep, subrid }: InternalItemProps) => {
    const searchParams = useSearchParams()
    const unitIndexParam = searchParams?.get("unitIndex")
    const { storage, setStorage, modified, setModified } = useStorage()
    const router = useRouter()
    const [pendingOfflineState, setPendingOfflineState] = useState<PendingOfflineState>({
        isChecking: true,
        hasPending: false,
        pendingIndexes: [],
    })

    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [startIndex, setStartIndex] = useState<number>(1)
    const [endIndex, setEndIndex] = useState<number>(1)
    const [targetIndex, setTargetIndex] = useState<number>(1)
    const [editForm, setEditForm] = React.useState<EditorItem>({
        单元表: (storage?.["单元表"] as IPipingUnitEntity[]) || [],
        单图表: (storage?.["单图表"] as IPipingUnitEntity[]) || [],
    })
    const [oldValue] = React.useState<EditorItem>({
        单元表: (storage?.["单元表"] as IPipingUnitEntity[]) || [],
        单图表: (storage?.["单图表"] as IPipingUnitEntity[]) || [],
    })

    const currentUnits = editForm.单图表 || []

    useEffect(() => {
        const checkPendingOfflineStates = async () => {
            if (!rep?.id) {
                setPendingOfflineState({
                    isChecking: false,
                    hasPending: false,
                    pendingIndexes: [],
                })
                return
            }

            try {
                console.log(`[DiagramManager] Checking pending offline states for repId: ${rep.id}`)
                const result = await fileOperationsQueue.hasLineDiagramPendingStates(rep.id)
                setPendingOfflineState({
                    isChecking: false,
                    hasPending: result.hasPending,
                    pendingIndexes: result.pendingIndexes,
                })
                if (result.hasPending) {
                    console.log(`[DiagramManager] Found pending offline states at indexes: ${result.pendingIndexes.join(", ")}`)
                }
            } catch (error) {
                console.error("[DiagramManager] Error checking pending offline states:", error)
                setPendingOfflineState({
                    isChecking: false,
                    hasPending: false,
                    pendingIndexes: [],
                })
            }
        }

        checkPendingOfflineStates()
    }, [rep?.id])

    useEffect(() => {
        if (unitIndexParam && currentUnits.length > 0) {
            const index = Number.parseInt(unitIndexParam, 10)
            if (index >= 0 && index < currentUnits.length) {
                setSelectedIndex(index)
            } else {
                console.warn(`无效的单元索引: ${index}, 当前单元总数: ${currentUnits.length}`)
                toast.error(`无效的单元序号: ${index + 1}`)
            }
        }
    }, [unitIndexParam, currentUnits])

    const handleSelectUnit = useCallback(
        (index: number) => {
            setSelectedIndex(index)
        },
        [currentUnits],
    )

    const handleDeleteUnit = useCallback(() => {
        if (selectedIndex === -1) {
            toast.error("请先选择一个单线图对象")
            return
        }
        const unitToDelete = editForm.单图表[selectedIndex]
        if (!unitToDelete || unitToDelete?._FILE_?.url) return
        const newUnits = editForm.单图表.filter((_, index) => index !== selectedIndex)
        setEditForm((prev) => ({
            ...prev,
            单图表: newUnits,
        }))
        toast.success(`已删除序号：${selectedIndex + 1} 的单线图对象`)
        setSelectedIndex(-1)
    }, [selectedIndex, editForm.单图表])
    //移动单线图顺序。
    const handleMoveUnits = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            const localUnits = editForm.单图表 || [];
            if (localUnits.length === 0) {
                toast.error("单线图表为空，无法移动")
                return
            }
            // 验证输入参数
            const start = startIndex - 1 // 转换为0基索引
            const end = endIndex - 1
            const target = targetIndex - 1
            if (start < 0 || end < 0 || target < 0) {
                toast.error("序号必须大于0")
                return
            }
            if (start >= localUnits.length || end >= localUnits.length || target > localUnits.length) {
                toast.error(`序号超出范围，当前共有 ${localUnits.length} 个单线图`)
                return
            }
            if (start > end) {
                toast.error("起始序号不能大于结束序号")
                return
            }
            // 执行移动操作
            const newUnits = [...localUnits]
            // 提取要移动的单元
            const unitsToMove = newUnits.splice(start, end - start + 1)
            // 计算实际插入位置（因为已经删除了一些元素）
            let actualTarget = target
            if (target > start) {
                actualTarget = target - (end - start)
                //人工智能的代码搞不定啊 actualTarget = target - (end - start + 1)
            }
            // 插入到目标位置
            newUnits.splice(actualTarget, 0, ...unitsToMove)
            // 更新本地状态
            setEditForm((prev) => ({
                ...prev,
                单图表: newUnits,
            }));
            toast.success(`成功移动单线图 ${startIndex}-${endIndex} 到位置 ${targetIndex}`);
        },
        [editForm.单图表, startIndex, endIndex, targetIndex],
    )
    const handleDeleteAllEmptyUnits = useCallback(() => {
        const currentUnits = editForm.单图表 || []
        const emptyUnits = currentUnits.filter((unit, index) => {
            const hasNoFile = !unit._FILE_?.url
            const hasNoName = !unit.m || unit.m.trim() === ""
            return hasNoFile && hasNoName
        })

        if (emptyUnits.length === 0) {
            toast.info("没有找到空的单线图对象")
            return
        }

        const newUnits = currentUnits.filter((unit, index) => {
            const hasNoFile = !unit._FILE_?.url
            const hasNoName = !unit.m || unit.m.trim() === ""
            return !(hasNoFile && hasNoName)
        })

        setEditForm((prev) => ({
            ...prev,
            单图表: newUnits,
        }))

        if (selectedIndex !== -1 && emptyUnits.some((unit) => unit === currentUnits[selectedIndex])) {
            setSelectedIndex(-1)
        }

        toast.success(`已删除 ${emptyUnits.length} 个空的单线图对象`)
    }, [editForm.单图表, selectedIndex])

    const onReset = () => {
        setEditForm({ ...oldValue })
        setSelectedIndex(-1)
        toast.success("已重置到初始状态")
    }

    const [render] = useFrameEditorBar({
        rep,
        transformValues: () => ({ ...editForm }),
        onReset,
    })

    const getOfflineFilePageUrl = useCallback(
        (index: number) => {
            if (!rep?.id) return "#"
            return withBasePath(`/rep/${rep.id}/INDPL_DJ/1/LineDiagramFile?original=1&lineIndex=${index}#LineDiagram${index}`)
        },
        [rep?.id],
    )

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <Card className="py-1 mb-2 gap-2 max-w-[110rem] m-auto">
                <CardHeader>
                    <CardTitle>{label}</CardTitle>
                    {unitIndexParam && (
                        <div className="text-sm text-blue-600">
                            从单线图列表跳转 - 目标单线图序号: {Number.parseInt(unitIndexParam) + 1}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-1 max-w-[110rem] m-auto space-y-6">
                    {pendingOfflineState.isChecking && (
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded border">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            <span className="text-sm text-muted-foreground">正在检查离线文件状态...</span>
                        </div>
                    )}

                    {!pendingOfflineState.isChecking && pendingOfflineState.hasPending && (
                        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-amber-800">检测到未完成的离线文件操作</h4>
                                    <p className="text-sm text-amber-700">
                                        以下单线图有未处理的离线文件上传或删除操作，请先完成这些操作后再进行编辑管理：
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {pendingOfflineState.pendingIndexes.map((index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => router.push(getOfflineFilePageUrl(index))}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-sm font-medium transition-colors"
                                            >
                                                单线图 {index + 1} <ExternalLink className="h-3 w-3" />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2">
                                        提示：点击上方链接跳转到对应的单线图文件页面，完成离线文件的上传或删除操作。
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={pendingOfflineState.hasPending ? "opacity-50 pointer-events-none select-none" : ""}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h6 className="font-medium">单线图选择</h6>
                                <Badge variant="secondary">单线图对象 {currentUnits.length || 0} 个</Badge>
                            </div>
                            <div
                                className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3 gap-2 overflow-y-auto border rounded p-2"
                                style={{ maxHeight: "min(calc(100vh - 4rem), 36rem)" }}
                            >
                                {currentUnits.map((unit, index) => (
                                    <div
                                        key={unit.id || index}
                                        className={`p-2 border rounded cursor-pointer transition-colors ${
                                            selectedIndex === index ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                                        }`}
                                        onClick={() => handleSelectUnit(index)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-sm">{unit._FILE_?.name}</span>
                                                <span className="text-sm text-muted-foreground ml-2">{unit.name}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">序号: {index + 1}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedIndex !== -1 && (
                                <div className="text-sm text-blue-600">
                                    已选择: 序号{selectedIndex + 1} - {currentUnits[selectedIndex]?._FILE_?.name}
                                </div>
                            )}
                        </div>

                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h6 className="font-medium"></h6>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteUnit}
                                        disabled={
                                            selectedIndex === -1 || currentUnits[selectedIndex]?._FILE_?.url || pendingOfflineState.hasPending
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        删除单线图对象
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeleteAllEmptyUnits}
                                        disabled={pendingOfflineState.hasPending}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        删除所有空对象
                                    </Button>
                                </div>
                            </div>
                            {selectedIndex !== -1 && (
                                <div className="space-y-3">
                                    <div className="text-sm text-muted-foreground">单线图对象 "序号{selectedIndex + 1}" 的单线图</div>
                                    <div className="p-3 bg-gray-50 rounded border min-h-[100px]">
                                        {currentUnits[selectedIndex]?._FILE_?.url ? (
                                            <div className="whitespace-pre-wrap">{currentUnits[selectedIndex]?._FILE_?.url}</div>
                                        ) : (
                                            <div className="text-muted-foreground italic">无图片链接</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <p>注意：</p>
                            <p>• 单线图还未删除的情况，是不能直接删除其管理对象的。</p>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h6 className="font-medium">单线图顺序管理</h6>
                            <div className="text-sm text-muted-foreground mb-2">
                                当前共有 {currentUnits.length} 个单线图，可以移动指定范围的单线图到新位置
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <Label htmlFor="startIdxPSol">起始序号</Label>
                                    <Input
                                        id="startIdxPSol"
                                        type="number"
                                        min={1}
                                        max={currentUnits.length}
                                        value={startIndex}
                                        onChange={(e) => setStartIndex(Number(e.target.value))}
                                        placeholder="起始序号"
                                        disabled={pendingOfflineState.hasPending}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endIdxDiam">结束序号</Label>
                                    <Input
                                        id="endIdxDiam"
                                        type="number"
                                        min={1}
                                        max={currentUnits.length}
                                        value={endIndex}
                                        onChange={(e) => setEndIndex(Number(e.target.value))}
                                        placeholder="结束序号"
                                        disabled={pendingOfflineState.hasPending}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="targetIdxDiam">目标位置</Label>
                                    <Input
                                        id="targetIdxDiam"
                                        type="number"
                                        min={1}
                                        max={currentUnits.length + 1}  // 允许移动到末尾
                                        value={targetIndex}
                                        onChange={(e) => setTargetIndex(Number(e.target.value))}
                                        placeholder="目标位置"
                                        disabled={pendingOfflineState.hasPending}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleMoveUnits}
                                    disabled={currentUnits.length === 0 || pendingOfflineState.hasPending}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                    执行移动
                                </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                示例：将序号 2-4 的单线图移动到位置 1，表示将第2、3、4个单线图移动到第1个位置前面
                            </div>
                        </div>
                        {children}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
            </Card>
        </CollapsibleFormSection>
    )
}
