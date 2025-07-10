"use client"

import { useState, useCallback } from "react"
import { useQuery } from "urql"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { GET_PIPING_UNITS } from "@/lib/graphql/piping-unit-queries"
import type { IPipingUnitEntity, PipingUnitFilter } from "@/types/piping-unit"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

interface PipingUnitListProps {
    pipeId?: string
    filter?: PipingUnitFilter
    onSelectionChange?: (units: IPipingUnitEntity[]) => void
    selectable?: boolean
    storageKey?: string
}

export function PipingUnitList({
                                   pipeId,
                                   filter,
                                   onSelectionChange,
                                   selectable = true,
                                   storageKey = "piping-unit-selection",
                               }: PipingUnitListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentFilter, setCurrentFilter] = useState<PipingUnitFilter>(filter || {})

    const { selectedUnits, isSelected, toggleUnit, count } = usePipingUnitSelection({ storageKey })

    // GraphQL 查询
    const [{ data, fetching, error }] = useQuery({
        query: GET_PIPING_UNITS,
        variables: {
            pipeId,
            filter: {
                ...currentFilter,
                search: searchQuery || undefined,
            },
            first: 50,
        },
    })

    const units = data?.pipingUnits?.edges?.map((edge) => edge.node) || []

    // 处理搜索
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    // 处理单元选择
    const handleUnitToggle = useCallback(
        (unit: IPipingUnitEntity) => {
            toggleUnit(unit)
            onSelectionChange?.(selectedUnits)
        },
        [toggleUnit, selectedUnits, onSelectionChange],
    )

    // 批量选择当前页面所有单元
    const handleSelectAll = useCallback(() => {
        units.forEach((unit) => {
            if (!isSelected(unit.id)) {
                toggleUnit(unit)
            }
        })
    }, [units, isSelected, toggleUnit])

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

                {selectable && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">已选 {count}</Badge>
                        <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={fetching}>
                            全选当前页
                        </Button>
                    </div>
                )}
            </div>

            {/* 列表 */}
            <ScrollArea className="h-[600px]">
                <div className="space-y-2">
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
                        units.map((unit) => (
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
            </ScrollArea>
        </div>
    )
}
