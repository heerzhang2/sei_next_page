"use client"

import { ErrorBoundary } from "react-error-boundary"
import type { ReactNode } from "react"
import ReportMakeable from "@/common/ReportMakeable"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ModificationIndicator } from "@/report/hook/useFormFramework"
import { ReportMainbar } from "@/components/report-mainbar"

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
            <h2 className="text-lg font-bold">出错了</h2>
            <p>{error.message}</p>
            <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={resetErrorBoundary}>
                重试
            </button>
        </div>
    )
}

// 将 ReportRootLayout 转换为客户端组件
export default function ReportRootLayout({
                                             params,
                                             children,
                                         }: {
    params: { repId: string }
    children: ReactNode
}) {
    const { repId } = params

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ReportMakeable />
            <StorageProvider>
                <ReportData repId={repId}>
                    <ModificationIndicator />
                    <ReportMainbar repId={repId} />
                    <div>{children}</div>
                </ReportData>
            </StorageProvider>
        </ErrorBoundary>
    )
}
