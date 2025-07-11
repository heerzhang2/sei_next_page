"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp, ArrowDown } from "lucide-react"

export interface SortConfig {
    field: string
    direction: "asc" | "desc"
}

interface SortSelectorProps {
    onSortChange: (sort: SortConfig) => void
    initialSort?: SortConfig
}

const SORT_OPTIONS = [
    { value: "code", label: "单元编号" },
    { value: "rno", label: "监察编码" },
    { value: "name", label: "管道名称" },
    { value: "leng", label: "长度" },
    { value: "nxtd1", label: "年检日期" },
    { value: "nxtd2", label: "定检日期" },
    { value: "crDate", label: "创建日期" },
    { value: "proj", label: "项目" },
]

export function SortSelector({ onSortChange, initialSort = { field: "code", direction: "asc" } }: SortSelectorProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort)

    const handleFieldChange = (field: string) => {
        const newConfig = { ...sortConfig, field }
        setSortConfig(newConfig)
        onSortChange(newConfig)
    }

    const handleDirectionToggle = () => {
        const newConfig = { ...sortConfig, direction: sortConfig.direction === "asc" ? "desc" : "asc" } as SortConfig
        setSortConfig(newConfig)
        onSortChange(newConfig)
    }

    const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortConfig.field)

    return (
        <div className="flex items-center gap-2">
            <Select value={sortConfig.field} onValueChange={handleFieldChange}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="icon"
                onClick={handleDirectionToggle}
                title={`${currentOption?.label} ${sortConfig.direction === "asc" ? "升序" : "降序"}`}
            >
                {sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
        </div>
    )
}
