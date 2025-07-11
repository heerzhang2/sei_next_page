"use client"

import type React from "react"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useQuery } from "@urql/next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, RefreshCw, Plus } from "lucide-react"
import {
    GET_PIPING_UNITS_BY_PIPELINE,
    GET_PIPING_UNITS_DIRECT,
    SEARCH_PIPING_UNITS,
} from "@/lib/graphql/piping-unit-queries"
import type { IPipingUnitEntity, PipingUnitFilter, DeviceCommonInput } from "@/types/piping-unit"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"
import { useDisplayMode } from "@/hooks/use-display-mode"
import { PipingUnitCard } from "./piping-unit-card"
import { PipingUnitListItem } from "./piping-unit-list-item"
import { PipingUnitFilter as FilterComponent, type PipingUnitFilterValues } from "./piping-unit-filter"
import { SortSelector, type SortConfig } from "./sort-selector"

interface PipingUnitListProps {
    pipelineId?: string
    filter?: PipingUnitFilter
    deviceFilter?: DeviceCommonInput
    queryMode?: "pipeline" | "direct" | "search"
    onSelectionChange?: (units: IPipingUnitEntity[]) => void
    selectable?: boolean
    storageKey?: string
    excludeSelected?: boolean
    useFullHeight?: boolean
}

export function PipingUnitList({
                                   pipelineId,
                                   filter,
                                   deviceFilter,
                                   queryMode = "pipeline",
                                   onSelectionChange,
                                   selectable = true,
                                   storageKey = "piping-unit-selection",
                                   excludeSelected = false,
                                   useFullHeight = false,
                               }: PipingUnitListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterValues, setFilterValues] = useState<PipingUnitFilterValues>({})
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "code", direction: "asc" })
    const [cursor, setCursor] = useState<string | null>(null)
    const [allUnits, setAllUnits] = useState<IPipingUnitEntity[]>([])
    const [hasNextPage, setHasNextPage] = useState(true)
    const [forceUpdate, setForceUpdate] = useState(0) // 问题2：强制更新计数器

    const { displayMode, visibleFields } = useDisplayMode()
    const { selectedUnits, isSelected, toggleUnit, count, addUnit } = usePipingUnitSelection({ storageKey })

    const containerRef = useRef<HTMLDivElement>(null)
    const loadingRef = useRef<HTMLDivElement>(null)

    // 问题2：监听显示模式和字段变化，强制重新渲染
    useEffect(() => {
        console.log("Display mode or fields changed:", { displayMode, visibleFields })
        setForceUpdate((prev) => prev + 1)
    }, [displayMode, visibleFields])

    // 根据查询模式选择不同的查询
    const shouldUseDirectQuery = queryMode === "direct" && !pipelineId
    const shouldUseSearchQuery = queryMode === "search" && searchQuery
    const shouldUsePipelineQuery = queryMode === "pipeline" && pipelineId

    // 构建查询变量
    const queryVariables = useMemo(() => {
        const baseVars = {
            pipelineId,
            where: { ...deviceFilter, ...filterValues },
            first: 20,
            orderBy: sortConfig.field, // 问题1：添加排序字段
            asc: sortConfig.direction === "asc", // 问题1：添加排序方向
            after: cursor,
        }

        if (shouldUseSearchQuery) {
            return {
                query: searchQuery,
                pipeId: pipelineId,
                first: 20,
            }
        }

        return baseVars
    }, [pipelineId, deviceFilter, filterValues, sortConfig, cursor, searchQuery, shouldUseSearchQuery])

    // 管道装置关联查询
    const [pipelineResult, reQuerypipeline] = useQuery({
        query: GET_PIPING_UNITS_BY_PIPELINE,
        variables: queryVariables,
        pause: !shouldUsePipelineQuery,
    })

    // 直接查询管道单元
    const [directResult, reQuerydirect] = useQuery({
        query: GET_PIPING_UNITS_DIRECT,
        variables: queryVariables,
        pause: !shouldUseDirectQuery,
    })

    // 搜索查询
    const [searchResult, reQuerysearch] = useQuery({
        query: SEARCH_PIPING_UNITS,
        variables: queryVariables,
        pause: !shouldUseSearchQuery,
    })

    // 选择当前使用的结果
    const currentResult = shouldUseSearchQuery ? searchResult : shouldUseDirectQuery ? directResult : pipelineResult
    const { data, fetching, error } = currentResult

    // 处理分页数据
    useEffect(() => {
        if (data && !fetching) {
            let newUnits: IPipingUnitEntity[] = []
            let pageInfo: any = null

            if (shouldUseSearchQuery) {
                newUnits = data?.searchPipingUnits?.edges?.map((edge: any) => edge.node) || []
                pageInfo = data?.searchPipingUnits?.pageInfo
            } else if (shouldUseDirectQuery) {
                newUnits = data?.pipingUnits?.edges?.map((edge: any) => edge.node) || []
                pageInfo = data?.pipingUnits?.pageInfo
            } else if (shouldUsePipelineQuery) {
                newUnits = data?.node?.cell_list?.edges?.map((edge: any) => edge.node) || []
                pageInfo = data?.node?.cell_list?.pageInfo
            }

            if (cursor) {
                // 加载更多
                setAllUnits((prev) => [...prev, ...newUnits])
            } else {
                // 新查询
                setAllUnits(newUnits)
            }

            setHasNextPage(pageInfo?.hasNextPage || false)
        }
    }, [data, fetching, cursor, shouldUseSearchQuery, shouldUseDirectQuery, shouldUsePipelineQuery])

    // 过滤掉已选择的单元
    const displayUnits = useMemo(() => {
        if (excludeSelected) {
            return allUnits.filter((unit) => !isSelected(unit.id))
        }
        return allUnits
    }, [allUnits, excludeSelected, isSelected])

    // 无限滚动
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !fetching) {
                    loadMore()
                }
            },
            { threshold: 0.1 },
        )

        if (loadingRef.current) {
            observer.observe(loadingRef.current)
        }

        return () => observer.disconnect()
    }, [hasNextPage, fetching])

    const loadMore = useCallback(() => {
        if (hasNextPage && !fetching) {
            const lastEdge =
                data?.node?.cell_list?.edges?.slice(-1)[0] ||
                data?.pipingUnits?.edges?.slice(-1)[0] ||
                data?.searchPipingUnits?.edges?.slice(-1)[0]

            if (lastEdge) {
                setCursor(lastEdge.cursor)
            }
        }
    }, [hasNextPage, fetching, data])

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
        setCursor(null)
        setAllUnits([])
    }, [])

    const handleFilterChange = useCallback((filters: PipingUnitFilterValues) => {
        setFilterValues(filters)
        setCursor(null)
        setAllUnits([])
    }, [])

    // 问题1：处理排序变化
    const handleSortChange = useCallback((sort: SortConfig) => {
        setSortConfig(sort)
        setCursor(null)
        setAllUnits([])
    }, [])

    const handleRefresh = useCallback(() => {
        setSearchQuery("")
        setFilterValues({})
        setCursor(null)
        setAllUnits([])
        reQuerypipeline({ requestPolicy: "network-only" })
    }, [reQuerypipeline])

    // 单独的添加按钮，不是点击整个区域
    const handleAddUnit = useCallback(
        (unit: IPipingUnitEntity, e: React.MouseEvent) => {
            e.stopPropagation()
            addUnit(unit)
            setTimeout(() => {
                onSelectionChange?.(selectedUnits)
            }, 0)
        },
        [addUnit, onSelectionChange, selectedUnits],
    )

    const handleSelectAll = useCallback(() => {
        displayUnits.forEach((unit: IPipingUnitEntity) => {
            if (!isSelected(unit.id)) {
                addUnit(unit)
            }
        })
    }, [displayUnits, isSelected, addUnit])

    if (error) {
        return <div className="text-center py-8 text-red-500">加载失败: {error.message}</div>
    }

    return (
        <div key={forceUpdate} className="space-y-4">
            {/* 搜索和过滤栏 */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="搜索管道单元编号、名称..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <FilterComponent onFilterChange={handleFilterChange} initialFilters={filterValues} />

                {/* 问题1：添加排序选择器 */}
                <SortSelector onSortChange={handleSortChange} initialSort={sortConfig} />

                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={fetching}>
                    <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
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
                {excludeSelected && " | 已排除已选单元"}| 排序:{" "}
                {SORT_OPTIONS.find((opt) => opt.value === sortConfig.field)?.label} (
                {sortConfig.direction === "asc" ? "升序" : "降序"})
            </div>

            {/* 列表内容 */}
            <div className="space-y-2">
                {displayUnits.length > 0 && (
                    <>
                        {displayMode === "card" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayUnits.map((unit: IPipingUnitEntity) => (
                                    <PipingUnitCard
                                        key={unit.id}
                                        unit={unit}
                                        visibleFields={visibleFields}
                                        actions={
                                            selectable && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleAddUnit(unit, e)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {displayUnits.map((unit: IPipingUnitEntity) => (
                                    <PipingUnitListItem
                                        key={unit.id}
                                        unit={unit}
                                        visibleFields={visibleFields}
                                        actions={
                                            selectable && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => handleAddUnit(unit, e)}
                                                    className="text-green-600 hover:text-green-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* 加载更多指示器 */}
                {hasNextPage && (
                    <div ref={loadingRef} className="text-center py-4">
                        {fetching ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 mx-auto" />
                                <div className="text-sm text-muted-foreground">加载更多...</div>
                                <div className="text-xs text-muted-foreground md:hidden">👆 上拉加载更多</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Button variant="outline" onClick={loadMore} className="w-full max-w-xs bg-transparent">
                                    <Plus className="h-4 w-4 mr-2" />
                                    加载更多
                                </Button>
                                <div className="text-xs text-muted-foreground md:hidden">👆 上拉也可以加载更多</div>
                            </div>
                        )}
                    </div>
                )}

                {!hasNextPage && displayUnits.length > 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">已加载全部数据</div>
                )}

                {!fetching && displayUnits.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        {searchQuery || Object.values(filterValues).some(Boolean) ? "未找到匹配的管道单元" : "暂无管道单元数据"}
                    </div>
                )}
            </div>
        </div>
    )
}

const SORT_OPTIONS = [
    { value: "code", label: "单元编号" },
    { value: "rno", label: "监察编���" },
    { value: "name", label: "管道名称" },
    { value: "leng", label: "长度" },
    { value: "nxtd1", label: "年检日期" },
    { value: "nxtd2", label: "定检日期" },
    { value: "crDate", label: "创建日期" },
    { value: "proj", label: "项目" },
]
