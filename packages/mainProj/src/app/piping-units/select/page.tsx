"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, List } from "lucide-react"
import { PipingUnitList } from "@/components/piping-unit/piping-unit-list"
import { SelectedUnitsList } from "@/components/piping-unit/selected-units-list"
import { DisplayModeSelector } from "@/components/piping-unit/display-mode-selector"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

export default function PipingUnitSelectPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState("available")

    const returnUrl = searchParams.get("returnUrl") || "/"
    const field = searchParams.get("field") || "units"
    const pipelineId = searchParams.get("pipelineId")
    const queryMode = searchParams.get("queryMode") || "pipeline"

    const { selectedUnits, count } = usePipingUnitSelection({
        storageKey: `piping-unit-${field}`,
    })

    // 返回原页面
    const handleReturn = useCallback(() => {
        router.push(returnUrl)
    }, [router, returnUrl])

    // 确认选择并返回
    const handleConfirm = useCallback(() => {
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

            {/* 主要内容 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        可选单元
                    </TabsTrigger>
                    <TabsTrigger value="selected" className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        已选单元 ({count})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>可选择的管道单元</CardTitle>
                                <DisplayModeSelector />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <PipingUnitList
                                pipelineId={pipelineId || undefined}
                                queryMode={queryMode as any}
                                storageKey={`piping-unit-${field}`}
                                selectable={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="selected" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>已选择的管道单元</CardTitle>
                                <DisplayModeSelector />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SelectedUnitsList storageKey={`piping-unit-${field}`} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
