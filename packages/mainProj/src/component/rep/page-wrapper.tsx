//src\component\rep\page-wrapper.tsx
"use client"
import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import type * as React from "react"
import { useQuery } from "@urql/next"
import { ReportQuery } from "@/component/rep/report-data"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
interface ReportPageWrapperProps {
    OriginalView: React.ComponentType<{
        action: string
        verId: string
        rep: any
    }>
    verId?: string
}

export function ReportPageWrapper({ OriginalView, verId = "1" }: ReportPageWrapperProps) {
    const params = useParams()
    const repId = useActualRepId()
    const [action, setAction] = useState<string | null>(null)

    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])

    // 当 repId 为空时暂停查询，避免发送无效请求
    const shouldPauseQuery = !repId

    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        pause: shouldPauseQuery,
        requestPolicy: "cache-only",
    })
    const { getReport: report } = result?.data || {}

    if (repId === "*") return null

    return <>{action && <OriginalView action={action!} verId={verId} rep={report} />}</>
}
