"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, ShoppingCart, RotateCcw } from "lucide-react"
import type { IPipingUnitEntity } from "@/types/piping-unit"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

interface PipingUnitSelectorProps {
    field: string
    initialUnits?: IPipingUnitEntity[]
    pipeId?: string
    onSelectionChange?: (units: IPipingUnitEntity[]) => void
    onConfirm?: (units: IPipingUnitEntity[]) => void
    disabled?: boolean
    className?: string
}

export function PipingUnitSelector({
                                       field,
                                       initialUnits = [],
                                       pipeId,
                                       onSelectionChange,
                                       onConfirm,
                                       disabled = false,
                                       className,
                                   }: PipingUnitSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { selectedUnits, setUnits, clearSelection, count } = usePipingUnitSelection({
        initialSelection: initialUnits,
        storageKey: `piping-unit-${field}`,
    })

    // 跳转到选择页面
    const handleNavigateToSelector = useCallback(() => {
        const currentUrl = window.location.pathname + window.location.search
        const params = new URLSearchParams()
        params.set("returnUrl", currentUrl)
        params.set("field", field)
        if (pipeId) params.set("pipeId", pipeId)

        router.push(`/piping-units/select?${params.toString()}`)
    }, [router, field, pipeId])

    // 确认选择
    const handleConfirm = useCallback(() => {
        onSelectionChange?.(selectedUnits)
        onConfirm?.(selectedUnits)
        setIsDialogOpen(false)
    }, [selectedUnits, onSelectionChange, onConfirm])

    // 重置选择
    const handleReset = useCallback(() => {
        setUnits(initialUnits)
        onSelectionChange?.(initialUnits)
    }, [setUnits, initialUnits, onSelectionChange])

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
                                <Button variant="outline" size="sm" onClick={handleConfirm} disabled={disabled}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    确认选择
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-2">
                            {selectedUnits.map((unit, index) => (
                                <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{unit.code}</Badge>
                                            <span className="text-sm text-muted-foreground">{unit.rno}</span>
                                        </div>
                                        <div className="text-sm font-medium">{unit.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {unit.start} → {unit.stop}
                                        </div>
                                    </div>

                                    {!disabled && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newUnits = selectedUnits.filter((u) => u.id !== unit.id)
                                                setUnits(newUnits)
                                                onSelectionChange?.(newUnits)
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
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
