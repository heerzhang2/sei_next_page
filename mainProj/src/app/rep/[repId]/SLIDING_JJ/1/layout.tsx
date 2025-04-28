"use client"
import ReportLayout from "@/component/rep/reportLayout";
import {contentItems, ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
import React from "react";
import {useQuery} from "@urql/next";
import {ReportQuery} from "@/component/rep/report-data";
import PageSectionOrientation from "@/components/page-section-orientation";
import Report from "@/component/rep/report";
import {useParams} from "next/navigation";

export default function Layout({
  children,params
}: Readonly<{
    children: React.ReactNode,
    params: Promise<{ repId: string, }>,
}>) {
    const { repId, action } = useParams()
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });
    const {getReport: report} = result?.data;
    return (
        <PageSectionOrientation>
            <ReportLayout repPanel={<ReportView rep={report}/>} items={contentItems}>
                { action? children
                    :
                    <>
                        {children}
                        <Report items={contentItems}>
                            <ReportView rep={report}/>
                        </Report>
                    </>
                }
            </ReportLayout>
        </PageSectionOrientation>
    )
}
