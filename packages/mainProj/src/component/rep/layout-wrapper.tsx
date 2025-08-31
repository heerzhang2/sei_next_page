"use client"
import type React from "react"
import { Suspense } from "react"
import { useQuery } from "@urql/next"
import ReportLayout from "@/component/rep/reportLayout"
import { type ReportParams, ReportQuery } from "@/component/rep/report-data"
import PageSectionOrientation from "@/components/page-section-orientation"
import BrowsingPattern from "@/component/rep/browsingPattern"
import { useParams, useSearchParams } from "next/navigation"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import { EditControlProvider } from "@/component/rep/editControl-provider"
import ReportMakeable from "@/common/ReportMakeable"
import {ReportEntryProps} from "@/report/common/base";

interface ReportLayoutWrapperProps {
    children: React.ReactNode
    ReportView: React.ComponentType<ReportEntryProps>
    useCatalog: () => any[]
}

export function ReportLayoutWrapper({ children, ReportView, useCatalog }: ReportLayoutWrapperProps) {
    const params = useParams() as unknown as ReportParams
    const repId = useActualRepId()
    const { action } = params
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")

    console.log("模板Layout刷新路由参数=", { repId, action, print })

    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } })
    const { getReport: report } = result?.data
    const catItems = useCatalog()

    if (repId === "*") return null

    return (
        <EditControlProvider>
            <PageSectionOrientation>
                <Suspense fallback={<div>Loading...</div>}>
                    {action ? (
                        <ReportLayout repPanel={<ReportView rep={report} />} items={catItems}>
                            <ReportMakeable />
                            {children}
                        </ReportLayout>
                    ) : print ? (
                        <>
                            {children}
                            <ReportView rep={report} printMode />
                        </>
                    ) : (
                        <div className="flex h-screen print:h-auto">
                            {children}
                            <BrowsingPattern items={catItems}>
                                <ReportView rep={report} />
                            </BrowsingPattern>
                        </div>
                    )}
                </Suspense>
            </PageSectionOrientation>
        </EditControlProvider>
    )
}
