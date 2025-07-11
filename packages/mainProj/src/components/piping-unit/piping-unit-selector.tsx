"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

interface PipingUnitSelectorProps {
    field: string
    initialUnits?: IPipingUnitEntity[]
    pipelineId?: string
    onSelectionChange?: (units: IPipingUnitEntity[]) => void
    onConfirm?: (units: IPipingUnitEntity[]) => void
    disabled?: boolean
    className?: string
    allowModeSwitch?: boolean
    defaultQueryMode?: "pipeline" | "direct" | "search"
}

export function PipingUnitSelector({
                                       field,
                                       initialUnits = [],
                                       pipelineId,
                                       onSelectionChange,
                                       onConfirm,
                                       disabled = false,
                                       className,
                                       allowModeSwitch = true,
                                       defaultQueryMode = "pipeline",
                                   }: PipingUnitSelectorProps) {
    const router = useRouter()
    const [queryMode, setQueryMode] = useState(defaultQueryMode)

    const { selectedUnits, setUnits, clearSelection, count } = usePipingUnitSelection({
        initialSelection: initialUnits,
        storageKey: `piping-unit-${field}`,
    })

    // 当选择发生变化时，通知父组件
    useEffect(() => {
        onSelectionChange?.(selectedUnits)
    }, [selectedUnits, onSelectionChange])

    // 跳转到选择页面 - 直接跳转，不弹对话框
    const handleNavigateToSelector = useCallback(() => {
        const currentUrl = window.location.pathname + window.location.search
        const params = new URLSearchParams()
        params.set("returnUrl", currentUrl)
        params.set("field", field)
        params.set("queryMode", queryMode)
        if (pipelineId) params.set("pipelineId", pipelineId)

        router.push(`/piping-units/select?${params.toString()}`)
    }, [router, field, pipelineId, queryMode])

    // 重置选择
    const handleReset = useCallback(() => {
        setUnits(initialUnits)
    }, [setUnits, initialUnits])

    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <Input
                    readOnly
                    value={`已选 ${count} 个管道单元`}
                    onClick={handleNavigateToSelector}
                    className="cursor-pointer"
                    disabled={disabled}
                />

                {!disabled && (
                    <>
                        {allowModeSwitch && (
                            <Select value={queryMode} onValueChange={setQueryMode}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pipeline">装置关联</SelectItem>
                                    <SelectItem value="direct">直接查询</SelectItem>
                                    <SelectItem value="search">搜索模式</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <Button variant="outline" size="icon" onClick={handleNavigateToSelector} title="选择管道单元">
                            <Plus className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="icon" onClick={clearSelection} title="清空选择">
                            <X className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="icon" onClick={handleReset} title="重置">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
