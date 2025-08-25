"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"
import { ModificationIndicator } from "@/report/hook/useFormFramework"

export default function ReportLayout({
                                         children,
                                     }: {
    children: ReactNode
}) {
    const pathname = usePathname()
    const [repId, setRepId] = useState<string>("")

    useEffect(() => {
        const pathSegments = pathname.split("/")
        const repIndex = pathSegments.findIndex((segment) => segment === "rep")
        if (repIndex !== -1 && pathSegments[repIndex + 1]) {
            const extractedRepId = pathSegments[repIndex + 1]
            setRepId(extractedRepId)
            console.log(`🚀ReportLayout extracted repId from URL: ${extractedRepId}`)
        } else {
            console.error("🚨ReportLayout: Could not extract repId from pathname:", pathname)
        }
    }, [pathname])

    if (!repId) {
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
