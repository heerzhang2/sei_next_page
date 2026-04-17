"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, List } from "lucide-react"
import { PipingUnitList } from "@/components/piping-unit/piping-unit-list"
import { SelectedUnitsList } from "@/components/piping-unit/selected-units-list"
import { DisplayModeSelector } from "@/components/piping-unit/display-mode-selector"
import { usePipingUnitSelection } from "@/hooks/use-piping-unit-selection"

//这个路由： 已经淘汰不用了
export default function PipingUnitSelectPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState("available")
    const [isClient, setIsClient] = useState(false) // 问题4：确保客户端渲染

    const returnUrl = searchParams.get("returnUrl") || "/"
    const field = searchParams.get("field") || "units"
    const pipelineId = searchParams.get("pipelineId")
    const queryMode = searchParams.get("queryMode") || "pipeline"

    const { selectedUnits, count } = usePipingUnitSelection({
        storageKey: `piping-unit-${field}`,
    })

    // 问题4：确保在客户端渲染
    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleReturn = useCallback(() => {
        router.push(returnUrl)
    }, [router, returnUrl])

    const handleConfirm = useCallback(() => {
        router.push(returnUrl)
    }, [router, returnUrl])

    // 问题4：在客户端渲染完成前显示加载状态
    if (!isClient) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">加载中...</div>
                </div>
            </div>
        )
    }

    return (
        // 问题3：整个页面滚动，移除固定高度限制
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 space-y-6">
                {/* 头部 */}
                <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4 border-b">
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

                {/* 主要内容 - 问题3：移除高度限制，允许整页滚动 */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="sticky top-20 bg-background z-10 pb-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="available" className="flex items-center gap-2">
                                <List className="h-4 w-4" />
                                管道单元列表
                            </TabsTrigger>
                            <TabsTrigger value="selected" className="flex items-center gap-2">
                                <Check className="h-4 w-4" />
                                已选单元 ({count})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="available" className="space-y-4 mt-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">管道单元列表</h3>
                            <DisplayModeSelector />
                        </div>
                        <PipingUnitList
                            pipelineId={pipelineId || undefined}
                            queryMode={queryMode as any}
                            storageKey={`piping-unit-${field}`}
                            selectable={true}
                            excludeSelected={true}
                            useFullHeight={false} // 问题3：不使用固定高度
                        />
                    </TabsContent>

                    <TabsContent value="selected" className="space-y-4 mt-0">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">已选择的管道单元</h3>
                            <DisplayModeSelector />
                        </div>
                        <SelectedUnitsList
                            storageKey={`piping-unit-${field}`}
                            useFullHeight={false} // 问题3：不使用固定高度
                        />
                    </TabsContent>
                </Tabs>

                {/* 底部间距 */}
                <div className="h-20"></div>
            </div>
        </div>
    )
}
