"use client"
import { useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import {OriginalView} from "@/report/industrial/Periodical/indPipelineO1";
import * as React from "react";
import {useQuery} from "@urql/next";
import {ReportQuery} from "@/component/rep/report-data";
import {useActualRepId} from "@/report/hook/use-actual-rep-id";

export default function Page() {
    const repId = useActualRepId()
    const params = useParams()
    const [action, setAction] = useState<string | null>(null)
    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });
    const {getReport: report} = result?.data;
    console.log("模板Page准备OriginalViewr进入repId=", {repId, params, action, report})
    return action && <OriginalView action={action!} verId={'1'} rep={report}/>
}
