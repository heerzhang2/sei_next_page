import type { ReactNode } from "react"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import {ErrorBoundaryWrapper} from "@/components/error-boundary-wrapper"

export default function ReportLayout({
                                         children,
                                         params,
                                     }: {
    children: ReactNode
    params: { repId: string }
}) {
    return (
        <ErrorBoundaryWrapper>
            <StorageProvider>
                <ReportData repId={params.repId}>{children}</ReportData>
            </StorageProvider>
        </ErrorBoundaryWrapper>
    )
}
