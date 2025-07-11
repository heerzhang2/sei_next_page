"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"

export interface PipingUnitFilterValues {
    code?: string
    nxtd1Start?: string
    nxtd1End?: string
    nxtd2Start?: string
    nxtd2End?: string
    usedStart?: string
    usedEnd?: string
    dets?: string
}

interface PipingUnitFilterProps {
    onFilterChange: (filters: PipingUnitFilterValues) => void
    initialFilters?: PipingUnitFilterValues
}

export function PipingUnitFilter({ onFilterChange, initialFilters = {} }: PipingUnitFilterProps) {
    const [filters, setFilters] = useState<PipingUnitFilterValues>(initialFilters)
    const [isOpen, setIsOpen] = useState(false)

    const handleFilterChange = useCallback(
        (key: keyof PipingUnitFilterValues, value: string) => {
            const newFilters = { ...filters, [key]: value || undefined }
            setFilters(newFilters)
            onFilterChange(newFilters)
        },
        [filters, onFilterChange],
    )

    const clearFilters = useCallback(() => {
        setFilters({})
        onFilterChange({})
    }, [onFilterChange])

    const activeFilterCount = Object.values(filters).filter(Boolean).length

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    过滤条件
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">过滤条件</h4>
                        {activeFilterCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                清空
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="code">管道编码</Label>
                            <Input
                                id="code"
                                placeholder="输入管道编码"
                                value={filters.code || ""}
                                onChange={(e) => handleFilterChange("code", e.target.value)}
                            />
                        </div>

                        {/* 问题4：年检下检日期范围 */}
                        <div>
                            <Label>年检下检日期范围</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <Label className="text-xs text-muted-foreground">开始日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.nxtd1Start || ""}
                                        onChange={(e) => handleFilterChange("nxtd1Start", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">结束日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.nxtd1End || ""}
                                        onChange={(e) => handleFilterChange("nxtd1End", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 问题4：定检下检日期范围 */}
                        <div>
                            <Label>定检下检日期范围</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <Label className="text-xs text-muted-foreground">开始日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.nxtd2Start || ""}
                                        onChange={(e) => handleFilterChange("nxtd2Start", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">结束日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.nxtd2End || ""}
                                        onChange={(e) => handleFilterChange("nxtd2End", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 问题4：投用日期范围 */}
                        <div>
                            <Label>投用日期范围</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                    <Label className="text-xs text-muted-foreground">开始日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.usedStart || ""}
                                        onChange={(e) => handleFilterChange("usedStart", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">结束日期</Label>
                                    <Input
                                        type="date"
                                        value={filters.usedEnd || ""}
                                        onChange={(e) => handleFilterChange("usedEnd", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="dets">检验活动ID</Label>
                            <Input
                                id="dets"
                                placeholder="输入检验活动ID"
                                value={filters.dets || ""}
                                onChange={(e) => handleFilterChange("dets", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
