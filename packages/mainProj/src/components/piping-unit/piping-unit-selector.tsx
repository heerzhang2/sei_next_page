"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Plus, ShoppingCart, RotateCcw } from "lucide-react"
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
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [queryMode, setQueryMode] = useState(defaultQueryMode)

    const { selectedUnits, setUnits, clearSelection, count } = usePipingUnitSelection({
        initialSelection: initialUnits,
        storageKey: `piping-unit-${field}`,
    })

    // 当选择发生变化时，通知父组件
    useEffect(() => {
        onSelectionChange?.(selectedUnits)
    }, [selectedUnits, onSelectionChange])

    // 跳转到选择页面
    const handleNavigateToSelector = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            const currentUrl = window.location.pathname + window.location.search
            const params = new URLSearchParams()
            params.set("returnUrl", currentUrl)
            params.set("field", field)
            params.set("queryMode", queryMode)
            if (pipelineId) params.set("pipelineId", pipelineId)

            router.push(`/piping-units/select?${params.toString()}`)
        },
        [router, field, pipelineId, queryMode],
    )

    // 确认选择
    const handleConfirm = useCallback(() => {
        onConfirm?.(selectedUnits)
        setIsDialogOpen(false)
    }, [selectedUnits, onConfirm])

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
                    onClick={() => setIsDialogOpen(true)}
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

                        <Button variant="outline" size="icon" onClick={handleNavigateToSelector} title="添加管道单元">
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

            {/* 选择预览对话框 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>已选择的管道单元 ({count})</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">查询模式: {queryMode}</Badge>
                                <Button variant="outline" size="sm" onClick={handleConfirm} disabled={disabled}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    确认选择
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto border rounded-md bg-background">
                        <div className="space-y-2 p-4">
                            {selectedUnits.map((unit) => (
                                <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{unit.code}</Badge>
                                            <span className="text-sm text-muted-foreground">{unit.rno}</span>
                                        </div>
                                        <div className="text-sm font-medium">{unit.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {unit.start} → {unit.stop} | 装置: {unit.pipe?.cod}
                                        </div>
                                    </div>

                                    {!disabled && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newUnits = selectedUnits.filter((u) => u.id !== unit.id)
                                                setUnits(newUnits)
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {selectedUnits.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">暂无选择的管道单元</div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
