import type { ReactNode } from "react"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"
import {ModificationIndicator} from "@/report/hook/useFormFramework";

export default async function ReportLayout({
                                               children,
                                               params,
                                           }: {
    children: ReactNode
    params: Promise<{ repId: string }>
}) {
    const { repId } = await params
    console.log(`🚀ReportLayout running repId=${repId} `,repId)
    return (
        <ErrorBoundaryWrapper>
            <StorageProvider>
                <ModificationIndicator/>
                <ReportData repId={repId}>{children}</ReportData>
            </StorageProvider>
        </ErrorBoundaryWrapper>
    )
}
