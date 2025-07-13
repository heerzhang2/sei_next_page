"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import {Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label, Separator, Textarea,} from "@/components/ui"
import { CollapsibleFormSection } from "@/components/chub"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { useQuery } from "@urql/next"
import { LIST_ALL_PIPINGUNIT } from "@/lib/graphql/piping-unit-queries"
import { ArrowRight, RefreshCw, Trash2, Edit3 } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { toast } from "sonner"

//从graphql模型获取报告才需要的字段：svp pa只保存有用到的字段：节约存储
function defModelToRepData(pipe: IPipingUnitEntity) {
    //注意必须在query EditorFeatureQuery($ids: [ID])必须发起给后端的字段
    const { id, crDate, name, code, leng, level, start, stop, lay, safe, rno, svp, pa } = pipe as any
    const svpData = typeof svp === "string" ? JSON.parse(svp || "{}") : svp || {}
    const paData = typeof pa === "string" ? JSON.parse(pa || "{}") : pa || {}
    const { 规格, 材料, 设压, 设温, 腐蚀, 焊数 } = svpData
    const { 工介, 工压, 试压, 工温, 防腐材, 绝材, 绝厚, 保数 } = paData
    return {
        id,
        crDate,
        name,
        code,
        leng,
        level,
        start,
        stop,
        lay,
        safe,
        rno,
        svp: { 规格, 材料, 设压, 设温, 腐蚀, 焊数 },
        pa: { 工介, 工压, 试压, 工温, 防腐材, 绝材, 绝厚, 保数 },
    }
}

//只能存储于主报告:单元表 单图表；
interface EditorItem {
    单元表: IPipingUnitEntity[]
    单图表: IPipingUnitEntity[]
}
export const itemA单特性 = ["单元表", "单图表"]
//特性表-管道单元管理：同步 排序
export const PropertySolidify = ({ children, show, label, rep }: InternalItemProps) => {
    const searchParams = useSearchParams()
    const unitIndexParam = searchParams?.get("unitIndex") // 从URL获取单元序号

    const [searchResult, reQuerysearch] = useQuery({
        query: LIST_ALL_PIPINGUNIT,
        variables: { detId: rep?.isp?.bus?.id },
        requestPolicy: "network-only",
    })
    const { data, fetching, error } = searchResult
    const busPipingList = data?.listAllPipingUnit || []
    const { storage, setStorage } = useStorage()

    // 当前选中的单元索引
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    // 备注编辑状态
    const [isEditingMemo, setIsEditingMemo] = useState(false)
    const [memoText, setMemoText] = useState("")

    // 问题2：序号管理状态
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

    const currentUnits = editForm.单元表 || []
    // 根据unitIndex参数自动选择单元
    useEffect(() => {
        if (unitIndexParam && currentUnits.length > 0) {
            const index = Number.parseInt(unitIndexParam, 10)
            // 验证索引是否有效
            if (index >= 0 && index < currentUnits.length) {
                setSelectedIndex(index)
                setMemoText(currentUnits[index].mm || "")
                console.log(`自动选择单元: 序号${index + 1}, 编码${currentUnits[index].code}`)
            } else {
                console.warn(`无效的单元索引: ${index}, 当前单元总数: ${currentUnits.length}`)
                toast.error(`无效的单元序号: ${index + 1}`)
            }
        }
    }, [unitIndexParam, currentUnits])

    // 选择单元处理
    const handleSelectUnit = useCallback(
        (index: number) => {
            setSelectedIndex(index)
            setMemoText(currentUnits[index]?.mm || "")
            setIsEditingMemo(false)
        },
        [currentUnits],
    )

    // 保存备注
    const handleSaveMemo = useCallback(() => {
        if (selectedIndex === -1) {
            toast.error("请先选择一个管道单元")
            return
        }
        const newUnits = [...editForm.单元表]
        newUnits[selectedIndex] = {
            ...newUnits[selectedIndex],
            mm: memoText.trim() || undefined,
        }
        setEditForm((prev) => ({
            ...prev,
            单元表: newUnits,
        }))
        setIsEditingMemo(false)
        toast.success("备注保存成功")
    }, [selectedIndex, memoText, editForm.单元表])

    // 问题2：删除当前选中的管道单元
    const handleDeleteUnit = useCallback(() => {
        if (selectedIndex === -1) {
            toast.error("请先选择一个管道单元")
            return
        }

        const unitToDelete = editForm.单元表[selectedIndex]
        if (!unitToDelete) return

        const newUnits = editForm.单元表.filter((_, index) => index !== selectedIndex)

        setEditForm((prev) => ({
            ...prev,
            单元表: newUnits,
        }))

        // 重置选择状态
        setSelectedIndex(-1)
        setMemoText("")
        setIsEditingMemo(false)

        toast.success(`已删除管道单元: ${unitToDelete.code}`)
    }, [selectedIndex, editForm.单元表])

    const handleSyncFromBus = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (!busPipingList || busPipingList.length === 0) {
                toast.error("业务管道单元表为空，无法同步")
                return
            }

            const currentUnits = editForm.单元表 || []
            const newUnits = [...currentUnits]

            // 创建业务单元的映射，便于快速查找
            const busUnitsMap = new Map<string, IPipingUnitEntity>()
            busPipingList.forEach((unit: IPipingUnitEntity) => {
                busUnitsMap.set(unit.id, unit)
            })

            // 第一步：检查现有单元是否还在业务列表中，如果不在则标记为删除（id设为空）
            for (let i = 0; i < newUnits.length; i++) {
                const currentUnit = newUnits[i]
                if (currentUnit && currentUnit.id && !busUnitsMap.has(currentUnit.id)) {
                    // 单元已被删除，将id设为空但保持位置
                    newUnits[i] = { ...currentUnit, id: "" }
                } else if (currentUnit && currentUnit.id && busUnitsMap.has(currentUnit.id)) {
                    // 单元仍存在，更新为最新数据但保持报告相关字段
                    const latestUnit = busUnitsMap.get(currentUnit.id)!
                    const processedUnit = defModelToRepData(latestUnit)
                    // 保持报告相关字段（如果存在）
                    newUnits[i] = {
                        ...processedUnit,
                        // 保持原有的报告字段
                        sgm: currentUnit.sgm,
                        mm: currentUnit.mm,
                        pic: currentUnit.pic,
                    }
                }
            }

            // 第二步：添加新的业务单元到末尾
            const existingIds = new Set(currentUnits.filter((unit) => unit && unit.id).map((unit) => unit.id))

            busPipingList.forEach((busUnit: IPipingUnitEntity) => {
                if (!existingIds.has(busUnit.id)) {
                    // 新单元，添加到末尾
                    const processedUnit = defModelToRepData(busUnit)
                    // @ts-ignore
                    newUnits.push(processedUnit)
                }
            })

            // 更新 editForm
            setEditForm((prev) => ({
                ...prev,
                单元表: newUnits,
            }))

            toast.success(`同步完成，共处理 ${newUnits.length} 个单元`)
        },
        [busPipingList, editForm.单元表],
    )

    // 问题2：移动单元顺序
    const handleMoveUnits = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            const currentUnits = editForm.单元表 || []
            if (currentUnits.length === 0) {
                toast.error("单元表为空，无法移动")
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

            if (start >= currentUnits.length || end >= currentUnits.length || target > currentUnits.length) {
                toast.error(`序号超出范围，当前共有 ${currentUnits.length} 个单元`)
                return
            }

            if (start > end) {
                toast.error("起始序号不能大于结束序号")
                return
            }

            // 执行移动操作
            const newUnits = [...currentUnits]

            // 提取要移动的单元
            const unitsToMove = newUnits.splice(start, end - start + 1)

            // 计算实际插入位置（因为已经删除了一些元素）
            let actualTarget = target
            if (target > start) {
                actualTarget = target - (end - start + 1)
            }

            // 插入到目标位置
            newUnits.splice(actualTarget, 0, ...unitsToMove)

            // 更新 editForm
            setEditForm((prev) => ({
                ...prev,
                单元表: newUnits,
            }))

            toast.success(`成功移动单元 ${startIndex}-${endIndex} 到位置 ${targetIndex}`)
        },
        [editForm.单元表, startIndex, endIndex, targetIndex],
    )

    const onReset = () => {
        setEditForm({ ...oldValue })
        // 重置选择状态
        setSelectedIndex(-1)
        setMemoText("")
        setIsEditingMemo(false)
        toast.success("已重置到初始状态")
    }
    // const [editErr, setEditErr] = React.useState<string>()
    const [render] = useFrameEditorBar({
        rep,
        values: { ...editForm },
        onReset,
    })

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <Card className="py-1 mb-2 gap-2 max-w-[110rem] m-auto">
                <CardHeader>
                    <CardTitle>{label}</CardTitle>
                    {/* 显示URL参数信息 */}
                    {unitIndexParam && (
                        <div className="text-sm text-blue-600">
                            从特性表跳转 - 目标单元序号: {Number.parseInt(unitIndexParam) + 1}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-1 max-w-[110rem] m-auto space-y-6">
                    {/* 单元选择区域 */}
                    <div className="space-y-4">
                        <h6 className="font-medium">管道单元选择</h6>
                        <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3 gap-2 overflow-y-auto border rounded p-2"
                             style={{maxHeight: "min(calc(100vh - 4rem), 36rem)"}}
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
                                            <span className="font-medium">{unit.code}</span>
                                            <span className="text-sm text-muted-foreground ml-2">{unit.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">序号: {index + 1}</div>
                                    </div>
                                    {unit.mm && <div className="text-xs text-gray-600 mt-1">备注: {unit.mm}</div>}
                                </div>
                            ))}
                        </div>

                        {selectedIndex !== -1 && (
                            <div className="text-sm text-blue-600">
                                已选择: 序号{selectedIndex + 1} - {currentUnits[selectedIndex]?.code} -{" "}
                                {currentUnits[selectedIndex]?.name}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* 备注编辑区域 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h6 className="font-medium">备注编辑</h6>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingMemo(!isEditingMemo)}
                                    disabled={selectedIndex === -1}
                                >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    {isEditingMemo ? "取消编辑" : "编辑备注"}
                                </Button>
                                {/* 问题2：删除按钮 */}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteUnit}
                                    disabled={selectedIndex === -1}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    删除单元
                                </Button>
                            </div>
                        </div>

                        {selectedIndex !== -1 && (
                            <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                    为管道单元 "序号{selectedIndex + 1} - {currentUnits[selectedIndex]?.code}" 编辑备注
                                </div>

                                {isEditingMemo ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="请输入备注信息..."
                                            value={memoText}
                                            onChange={(e) => setMemoText(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={handleSaveMemo} size="sm">
                                                备注修改确认
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setMemoText(currentUnits[selectedIndex]?.mm || "")
                                                    setIsEditingMemo(false)
                                                }}
                                                size="sm"
                                            >
                                                取消备注修改
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded border min-h-[100px]">
                                        {currentUnits[selectedIndex]?.mm ? (
                                            <div className="whitespace-pre-wrap">{currentUnits[selectedIndex].mm}</div>
                                        ) : (
                                            <div className="text-muted-foreground italic">暂无备注信息</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* 业务同步功能 */}
                    <div className="space-y-4">
                        <h6 className="font-medium">业务数据同步</h6>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                业务单元数: {busPipingList?.length || 0} | 报告单元数: {currentUnits.length}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSyncFromBus}
                                disabled={fetching || !busPipingList?.length}
                                className="flex items-center gap-2 bg-transparent"
                            >
                                <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
                                依据业务的管道单元表来生成报告的单元表
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* 问题2：单元顺序管理 */}
                    <div className="space-y-4">
                        <h6 className="font-medium">单元顺序管理</h6>
                        <div className="text-sm text-muted-foreground mb-2">
                            当前共有 {currentUnits.length} 个单元，可以移动指定范围的单元到新位置
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <Label htmlFor="startIndex">起始序号</Label>
                                <Input
                                    id="startIndex"
                                    type="number"
                                    min={1}
                                    max={currentUnits.length}
                                    value={startIndex}
                                    onChange={(e) => setStartIndex(Number(e.target.value))}
                                    placeholder="起始序号"
                                />
                            </div>

                            <div>
                                <Label htmlFor="endIndex">结束序号</Label>
                                <Input
                                    id="endIndex"
                                    type="number"
                                    min={1}
                                    max={currentUnits.length}
                                    value={endIndex}
                                    onChange={(e) => setEndIndex(Number(e.target.value))}
                                    placeholder="结束序号"
                                />
                            </div>

                            <div>
                                <Label htmlFor="targetIndex">目标位置</Label>
                                <Input
                                    id="targetIndex"
                                    type="number"
                                    min={1}
                                    max={currentUnits.length + 1}
                                    value={targetIndex}
                                    onChange={(e) => setTargetIndex(Number(e.target.value))}
                                    placeholder="目标位置"
                                />
                            </div>

                            <Button
                                type="button"
                                onClick={handleMoveUnits}
                                disabled={currentUnits.length === 0}
                                className="flex items-center gap-2"
                            >
                                <ArrowRight className="h-4 w-4" />
                                执行移动
                            </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            示例：将序号 2-4 的单元移动到位置 1，表示将第2、3、4个单元移动到第1个位置前面
                        </div>
                    </div>

                    {children}
                </CardContent>
                <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
            </Card>
        </CollapsibleFormSection>
    )
}
