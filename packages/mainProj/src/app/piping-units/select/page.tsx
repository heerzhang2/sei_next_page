"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import { PipingUnitList } from "@/components/piping-unit/piping-unit-list"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

export default function PipingUnitSelectPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const returnUrl = searchParams.get("returnUrl") || "/"
    const field = searchParams.get("field") || "units"
    const pipelineId = searchParams.get("pipelineId")

    const { selectedUnits, count } = usePipingUnitSelection({
        storageKey: `piping-unit-${field}`,
    })

    // 返回原页面
    const handleReturn = useCallback(() => {
        router.push(returnUrl)
    }, [router, returnUrl])

    // 确认选择并返回
    const handleConfirm = useCallback(() => {
        // 可以在这里触发一些额外的逻辑
        router.push(returnUrl)
    }, [router, returnUrl])

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* 头部 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleReturn}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        返回
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">选择管道单元</h1>
                        <p className="text-muted-foreground">为字段 "{field}" 选择管道单元</p>
                    </div>
                </div>

                <Button onClick={handleConfirm} disabled={count === 0}>
                    <Check className="h-4 w-4 mr-2" />
                    确认选择 ({count})
                </Button>
            </div>

            {/* 选择列表 */}
            <Card>
                <CardHeader>
                    <CardTitle>管道单元列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <PipingUnitList pipelineId={pipelineId || undefined} storageKey={`piping-unit-${field}`} selectable={true} />
                </CardContent>
            </Card>
        </div>
    )
}
