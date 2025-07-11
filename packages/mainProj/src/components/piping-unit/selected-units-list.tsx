"use client"
import { Button } from "@/components/ui/button"
import { X, Trash2 } from "lucide-react"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"
import { useDisplayMode } from "@/hooks/use-display-mode"
import { PipingUnitCard } from "./piping-unit-card"
import { PipingUnitListItem } from "./piping-unit-list-item"

interface SelectedUnitsListProps {
    storageKey: string
}

export function SelectedUnitsList({ storageKey }: SelectedUnitsListProps) {
    const { selectedUnits, removeUnit, clearSelection, count } = usePipingUnitSelection({ storageKey })
    const { displayMode, visibleFields } = useDisplayMode()

    if (count === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <div className="text-lg mb-2">暂无选择的管道单元</div>
                <div className="text-sm">请在"可选单元"标签页中选择管道单元</div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* 操作栏 */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">共选择了 {count} 个管道单元</div>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空全部
                </Button>
            </div>

            {/* 单元列表 */}
            {displayMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {selectedUnits.map((unit) => (
                        <PipingUnitCard
                            key={unit.id}
                            unit={unit}
                            visibleFields={visibleFields}
                            actions={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeUnit(unit.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            }
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {selectedUnits.map((unit) => (
                        <PipingUnitListItem
                            key={unit.id}
                            unit={unit}
                            visibleFields={visibleFields}
                            actions={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeUnit(unit.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
