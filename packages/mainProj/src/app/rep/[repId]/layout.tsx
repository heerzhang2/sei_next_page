import type { ReactNode } from "react"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"
import { ServiceWorkerUpdater } from "@/components/service-worker-updater"

export default async function ReportLayout({
                                               children,
                                               params,
                                           }: {
    children: ReactNode
    params: Promise<{ repId: string }>
}) {
    const { repId } = await params

    return (
        <ErrorBoundaryWrapper>
            <StorageProvider>
                <ServiceWorkerUpdater />
                <ReportData repId={repId}>{children}</ReportData>
            </StorageProvider>
        </ErrorBoundaryWrapper>
    )
}
