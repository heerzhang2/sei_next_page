"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { IPipingUnitEntity } from "@/types/piping-unit"

interface PipingUnitCardProps {
    unit: IPipingUnitEntity
    visibleFields: string[]
    actions?: React.ReactNode
    onSelect?: () => void
}

export function PipingUnitCard({ unit, visibleFields, actions, onSelect }: PipingUnitCardProps) {
    const renderField = (key: string) => {
        switch (key) {
            case "code":
                return <Badge variant="outline">{unit.code}</Badge>
            case "rno":
                return <span className="text-sm text-muted-foreground">{unit.rno}</span>
            case "name":
                return <div className="font-medium">{unit.name}</div>
            case "start":
                return <span className="text-sm">起: {unit.start}</span>
            case "stop":
                return <span className="text-sm">止: {unit.stop}</span>
            case "leng":
                return <span className="text-sm">{unit.leng}m</span>
            case "proj":
                return <span className="text-sm">项目: {unit.proj}</span>
            case "useu":
                return <span className="text-sm">使用: {unit.useu?.name}</span>
            case "pipe":
                return <span className="text-sm">装置: {unit.pipe?.cod}</span>
            case "ust":
                return <Badge variant="secondary">{unit.ust}</Badge>
            case "reg":
                return <Badge variant="secondary">{unit.reg}</Badge>
            case "nxtd1":
                return <span className="text-xs">检验1: {unit.nxtd1}</span>
            case "nxtd2":
                return <span className="text-xs">检验2: {unit.nxtd2}</span>
            case "crDate":
                return <span className="text-xs">创建: {unit.crDate}</span>
            default:
                return null
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {visibleFields.includes("code") && renderField("code")}
                        {visibleFields.includes("rno") && renderField("rno")}
                    </div>
                    {actions}
                </div>
                {visibleFields.includes("name") && renderField("name")}
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-1">
                    {visibleFields.includes("start") && visibleFields.includes("stop") && (
                        <div className="flex items-center gap-2">
                            {renderField("start")}
                            <span>→</span>
                            {renderField("stop")}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                        {visibleFields.includes("leng") && renderField("leng")}
                        {visibleFields.includes("proj") && renderField("proj")}
                    </div>
                    <div className="space-y-1">
                        {visibleFields.includes("useu") && renderField("useu")}
                        {visibleFields.includes("pipe") && renderField("pipe")}
                    </div>
                    <div className="flex gap-2">
                        {visibleFields.includes("ust") && renderField("ust")}
                        {visibleFields.includes("reg") && renderField("reg")}
                    </div>
                    <div className="space-y-1">
                        {visibleFields.includes("nxtd1") && renderField("nxtd1")}
                        {visibleFields.includes("nxtd2") && renderField("nxtd2")}
                        {visibleFields.includes("crDate") && renderField("crDate")}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
