"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import type { IPipingUnitEntity } from "@/types/piping-unit"

interface PipingUnitListItemProps {
    unit: IPipingUnitEntity
    visibleFields: string[]
    actions?: React.ReactNode
    onSelect?: () => void
}

export function PipingUnitListItem({ unit, visibleFields, actions, onSelect }: PipingUnitListItemProps) {
    const renderField = (key: string) => {
        switch (key) {
            case "code":
                return <Badge variant="outline">{unit.code}</Badge>
            case "rno":
                return <span className="text-sm text-muted-foreground">{unit.rno}</span>
            case "name":
                return <span className="font-medium">{unit.name}</span>
            case "start":
                return <span className="text-sm">{unit.start}</span>
            case "stop":
                return <span className="text-sm">{unit.stop}</span>
            case "leng":
                return <span className="text-sm">{unit.leng}m</span>
            case "proj":
                return <span className="text-sm">{unit.proj}</span>
            case "useu":
                return <span className="text-sm">{unit.useu?.name}</span>
            case "pipe":
                return <span className="text-sm">{unit.pipe?.cod}</span>
            case "ust":
                return (
                    <Badge variant="secondary" className="text-xs">
                        {unit.ust}
                    </Badge>
                )
            case "reg":
                return (
                    <Badge variant="secondary" className="text-xs">
                        {unit.reg}
                    </Badge>
                )
            case "nxtd1":
                return <span className="text-xs">{unit.nxtd1}</span>
            case "nxtd2":
                return <span className="text-xs">{unit.nxtd2}</span>
            case "crDate":
                return <span className="text-xs">{unit.crDate}</span>
            default:
                return null
        }
    }

    return (
        <div
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 items-center">
                {visibleFields.map((field) => (
                    <div key={field} className="min-w-0">
                        {renderField(field)}
                    </div>
                ))}
            </div>
            {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
        </div>
    )
}
