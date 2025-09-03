"use client"

import type { ReactNode } from "react"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"
import { ModificationIndicator } from "@/report/hook/useFormFramework"

export default function ReportLayout({
                                         children,
                                     }: {
    children: ReactNode
}) {
    const repId = useActualRepId()

    if (!repId || repId==="*") {
        return <div>Loading...</div>
    }

    console.log(`🚀ReportLayout running repId=${repId}`, repId)
    return (
        <ErrorBoundaryWrapper>
            <StorageProvider>
                <ModificationIndicator />
                <ReportData repId={repId}>{children}</ReportData>
            </StorageProvider>
        </ErrorBoundaryWrapper>
    )
}
