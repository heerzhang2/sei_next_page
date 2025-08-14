"use client"

import { useEffect, useState } from "react"
import ReportData from "@/component/rep/report-data"
import { useNetworkStatus } from "@/hooks/use-network-status"

export default function ReportPageClient({
                                             params,
                                         }: {
    params: { repId: string; params: string[] }
}) {
    const [mounted, setMounted] = useState(false)
    const { isOnline } = useNetworkStatus()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="p-4 text-sm text-muted-foreground">正在准备编辑环境...</div>
    }

    return (
        <div className="min-h-screen">
            {/* <CHANGE> 添加离线状态指示 */}
            {!isOnline && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm">当前处于离线模式，正在使用本地缓存数据。部分功能可能受限。</p>
                        </div>
                    </div>
                </div>
            )}

            {/* <CHANGE> 使用ReportData组件包装，支持离线缓存和动态repId */}
            <ReportData repId={params.repId}>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">报告: {params.repId}</h1>
                    {params.params && params.params.length > 0 && (
                        <p className="text-gray-600 mb-4">参数: {params.params.join("/")}</p>
                    )}

                    {/* <CHANGE> 这里可以添加具体的报告内容组件 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p>报告内容将在这里显示</p>
                        <p className="text-sm text-gray-500 mt-2">支持离线编辑和数据同步</p>
                    </div>
                </div>
            </ReportData>
        </div>
    )
}
