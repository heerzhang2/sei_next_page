"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery } from "@urql/next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, RefreshCw } from "lucide-react"
import {
    GET_PIPING_UNITS_BY_PIPELINE,
    GET_PIPING_UNITS_DIRECT,
    SEARCH_PIPING_UNITS,
} from "@/lib/graphql/piping-unit-queries"
import type { IPipingUnitEntity, PipingUnitFilter, DeviceCommonInput } from "@/types/piping-unit"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

interface PipingUnitListProps {
    pipelineId?: string
    filter?: PipingUnitFilter
    deviceFilter?: DeviceCommonInput
    queryMode?: "pipeline" | "direct" | "search"
    onSelectionChange?: (units: IPipingUnitEntity[]) => void
    selectable?: boolean
    storageKey?: string
}

export function PipingUnitList({
                                   pipelineId,
                                   filter,
                                   deviceFilter,
                                   queryMode = "pipeline",
                                   onSelectionChange,
                                   selectable = true,
                                   storageKey = "piping-unit-selection",
                               }: PipingUnitListProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const { selectedUnits, isSelected, toggleUnit, count } = usePipingUnitSelection({ storageKey })

    // 根据查询模式选择不同的查询
    const shouldUseDirectQuery = queryMode === "direct" && !pipelineId
    const shouldUseSearchQuery = queryMode === "search" && searchQuery
    const shouldUsePipelineQuery = queryMode === "pipeline" && pipelineId

    // 管道装置关联查询
    const [pipelineResult, reQuerypipeline] = useQuery({
        query: GET_PIPING_UNITS_BY_PIPELINE,
        variables: {
            pipelineId,
            where: deviceFilter,
            first: 50,
            orderBy: "code",
            asc: true,
        },
        pause: !shouldUsePipelineQuery,
    })

    // 直接查询管道单元
    const [directResult, reQuerydirect] = useQuery({
        query: GET_PIPING_UNITS_DIRECT,
        variables: {
            pipeId: pipelineId,
            filter: {
                ...filter,
                code: searchQuery || undefined,
            },
            first: 50,
            orderBy: "code",
            asc: true,
        },
        pause: !shouldUseDirectQuery,
    })

    // 搜索查询
    const [searchResult, reQuerysearch] = useQuery({
        query: SEARCH_PIPING_UNITS,
        variables: {
            query: searchQuery,
            pipeId: pipelineId,
            first: 20,
        },
        pause: !shouldUseSearchQuery,
    })
    const refresh = () => {
        reQuerypipeline({ requestPolicy: 'network-only' });
    };
    // 选择当前使用的结果
    const currentResult = shouldUseSearchQuery ? searchResult : shouldUseDirectQuery ? directResult : pipelineResult

    const { data, fetching, error } = currentResult

    // 提取单元数据 - 使用 useMemo 避免重复计算
    const units = useMemo(() => {
        if (shouldUseSearchQuery) {
            return data?.searchPipingUnits?.edges?.map((edge: any) => edge.node) || []
        } else if (shouldUseDirectQuery) {
            return data?.pipingUnits?.edges?.map((edge: any) => edge.node) || []
        } else if (shouldUsePipelineQuery) {
            return data?.node?.cell_list?.edges?.map((edge: any) => edge.node) || []
        }
        return []
    }, [data, shouldUseSearchQuery, shouldUseDirectQuery, shouldUsePipelineQuery])

    // 处理搜索
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    // 处理单元选择 - 移除对 selectedUnits 的依赖
    const handleUnitToggle = useCallback(
        (unit: IPipingUnitEntity) => {
            toggleUnit(unit)
            // 延迟调用 onSelectionChange，避免在渲染过程中触发状态更新
            setTimeout(() => {
                onSelectionChange?.(selectedUnits)
            }, 0)
        },
        [toggleUnit, onSelectionChange],
    )

    // 批量选择当前页面所有单元
    const handleSelectAll = useCallback(() => {
        units.forEach((unit: IPipingUnitEntity) => {
            if (!isSelected(unit.id)) {
                toggleUnit(unit)
            }
        })
    }, [units, isSelected, toggleUnit])

    // 刷新数据
    const handleRefresh = useCallback(() => {
        setSearchQuery("")
        refresh()
    }, [])

    if (error) {
        return <div className="text-center py-8 text-red-500">加载失败: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            {/* 搜索栏 */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索管道单元编号、名称..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={fetching}>
                    <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />刷新吗
                </Button>

                {selectable && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">已选 {count}</Badge>
                        <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={fetching}>
                            全选当前页
                        </Button>
                    </div>
                )}
            </div>

            {/* 查询模式指示器 */}
            <div className="text-xs text-muted-foreground">
                查询模式: {queryMode === "pipeline" ? "管道装置关联" : queryMode === "direct" ? "直接查询" : "搜索模式"}
                {pipelineId && ` | 管道装置: ${pipelineId}`}
            </div>

            {/* 列表 - 使用普通 div 替代 ScrollArea */}
            <div className="h-[600px] overflow-y-auto border rounded-md bg-background">
                <div className="space-y-2 p-4">
                    {fetching && (
                        <>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <Skeleton className="h-4 w-4" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {!fetching &&
                        units.map((unit: IPipingUnitEntity) => (
                            <div
                                key={unit.id}
                                className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                                    isSelected(unit.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                                }`}
                            >
                                {selectable && (
                                    <Checkbox checked={isSelected(unit.id)} onCheckedChange={() => handleUnitToggle(unit)} />
                                )}

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline">{unit.code}</Badge>
                                        <span className="text-sm text-muted-foreground">{unit.rno}</span>
                                    </div>

                                    <div className="font-medium">{unit.name}</div>

                                    <div className="text-sm text-muted-foreground">
                                        <div>
                                            {unit.start} → {unit.stop}
                                        </div>
                                        <div>
                                            长度: {unit.leng}m | 项目: {unit.proj}
                                        </div>
                                        <div>使用单位: {unit.useu?.name}</div>
                                        <div>管道装置: {unit.pipe?.cod}</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    {!fetching && units.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "未找到匹配的管道单元" : "暂无管道单元数据"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
