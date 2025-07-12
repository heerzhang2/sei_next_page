"use client"

import * as React from "react"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import { z } from "zod"
import {
    Button,
    Card,
    CardContent, CardFooter,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    Input,
    Label,
    Separator,
} from "@/components/ui"
import { CollapsibleFormSection } from "@/components/chub"
import {useFormFramework, useFrameEditorBar} from "@/report/hook/useFormFramework"
import { PipingUnitSelector } from "@/components/piping-unit/piping-unit-selector"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { useQuery } from "@urql/next"
import { LIST_ALL_PIPINGUNIT } from "@/lib/graphql/piping-unit-queries"
import { ArrowRight, RefreshCw } from "lucide-react"
import { useCallback, useState } from "react"
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
interface ConclusionItem {
    单元表: string
    单图表: string
}
export const itemA单特性 = ["单元表", "单图表"]

//特性表-管道单元管理：同步 排序
export const PropertySolidify = ({ children, show, label, rep }: InternalItemProps) => {
    const [searchResult, reQuerysearch] = useQuery({
        query: LIST_ALL_PIPINGUNIT,
        variables: { detId: rep?.isp?.bus?.id },
        requestPolicy: "network-only",
    })
    const { data, fetching, error } = searchResult
    const busPipingList = data?.listAllPipingUnit || []
    const { storage, setStorage } = useStorage()
    // 问题2：序号管理状态
    const [startIndex, setStartIndex] = useState<number>(1)
    const [endIndex, setEndIndex] = useState<number>(1)
    const [targetIndex, setTargetIndex] = useState<number>(1)

    const [editForm, setEditForm] = React.useState<ConclusionItem>({
        单元表: storage?.["单元表"] ?? [],
        单图表: storage?.["单图表"] ?? [],
    })
    const [oldValue] = React.useState<ConclusionItem>(editForm)

    // 问题1：同步业务管道单元表到报告单元表
    const handleSyncFromBus = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            if (!busPipingList || busPipingList.length === 0) {
                toast.error("业务管道单元表为空，无法同步")
                return
            }

            const currentUnits = (storage["单元表"] as IPipingUnitEntity[]) || []
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
                    newUnits.push(processedUnit)
                }
            })

            // 更新存储
            setStorage((prevStorage: any) => ({
                ...prevStorage,
                单元表: newUnits,
            }))

            toast.success(`同步完成，共处理 ${newUnits.length} 个单元`)
        },
        [busPipingList, storage, setStorage],
    )

    // 问题2：移动单元顺序
    const handleMoveUnits = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            const currentUnits = (storage["单元表"] as IPipingUnitEntity[]) || []
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

            // 更新存储
            setStorage((prevStorage: any) => ({
                ...prevStorage,
                单元表: newUnits,
            }))
            // setEditForm({
            //     单元表: storage?.["单元表"] ?? [],
            //     单图表: storage?.["单图表"] ?? [],
            // })
            toast.success(`成功移动单元 ${startIndex}-${endIndex} 到位置 ${targetIndex}`)
        },
        [storage, setStorage, startIndex, endIndex, targetIndex],
    )


    const [editErr, setEditErr] = React.useState<string>()
    const onReset = () => {
        setEditForm({ ...oldValue })
    }
    const [render] = useFrameEditorBar({ rep,
        values: { 单元表: storage?.["单元表"] ?? [],
            单图表: storage?.["单图表"] ?? [], },
        onReset})

    const currentUnits = (storage["单元表"] as IPipingUnitEntity[]) || []

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <Card className="py-1 mb-2 gap-2 max-w-[60rem] m-auto">
                <CardHeader>
                    <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="px-1 max-w-[40rem] m-auto space-y-6">
                    <h5>(报告)：</h5>

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
