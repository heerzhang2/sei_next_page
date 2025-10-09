// page-wrapper.tsx
"use client"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import type * as React from "react"
import { useQuery } from "@urql/next"
import { ReportQuery } from "@/component/rep/report-data"
import { useActualRepId } from "@/report/hook/use-actual-rep-id"
import { useAutoRestoreMutations } from "@/hooks/use-auto-restore-mutations"

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

    // 使用自动恢复钩子
    useAutoRestoreMutations({
        repId: repId || "",
        enabled: !!repId && repId !== "*"
    })

    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])

    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } })
    const { getReport: report } = result?.data || {}

    if (repId === "*") return null

    return action && <OriginalView action={action!} verId={verId} rep={report} />
}