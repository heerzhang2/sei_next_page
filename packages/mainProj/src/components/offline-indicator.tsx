"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff } from "lucide-react"
import { useStorage } from "@/report/StorageContext"

export function OfflineIndicator() {
    const { offline } = useStorage()
    const [showIndicator, setShowIndicator] = useState(false)

    useEffect(() => {
        // 只在离线时显示指示器
        setShowIndicator(offline)
    }, [offline])

    if (!showIndicator) return null

    return (
        <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
            <WifiOff className="w-3 h-3" />
            <span className="text-xs">离线模式</span>
        </Badge>
    )
}
