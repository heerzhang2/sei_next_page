"use client"
import { useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import {OriginalView} from "@/report/recreation/slidingJj/Regular.O-1";
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
    const [result] = useQuery({ query: ReportQuery, variables: { id: params?.repId } });
    const {getReport: report} = result?.data;
    return <OriginalView action={action!} verId={'1'} rep={report}/>
}
