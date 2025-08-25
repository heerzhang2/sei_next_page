"use client"
import { useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import {OriginalView} from "@/report/industrial/Periodical/indPipelineO1";
import * as React from "react";
import {useQuery} from "@urql/next";
import {ReportQuery} from "@/component/rep/report-data";

export default function Page() {
    const params = useParams()
    const [action, setAction] = useState<string | null>(null)
    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])
    console.log("模板Page刷新路由参数=", {action, params})
    const [result] = useQuery({ query: ReportQuery, variables: { id: params?.repId } });
    const {getReport: report} = result?.data;
    console.log("模板Page准备OriginalViewr进入repId=", params?.repId,"report=",report)
    return <OriginalView action={action!} verId={'1'} rep={report}/>
}
