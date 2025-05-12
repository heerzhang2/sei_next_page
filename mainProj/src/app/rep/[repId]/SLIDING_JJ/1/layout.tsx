"use client"
import React from "react";
import {useQuery} from "@urql/next";
import ReportLayout from "@/component/rep/reportLayout";
import {ReportQuery} from "@/component/rep/report-data";
import PageSectionOrientation from "@/components/page-section-orientation";
import Report from "@/component/rep/report";
import {useParams, useSearchParams} from "next/navigation";
import {EditControlProvider} from "@/component/rep/editControl-provider";
import {contentItems, ReportView} from "@/report/recreation/slidingJj/Regular.R-1";

export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
    const { repId, action } = useParams()
    const searchParams = useSearchParams()
    const print = "1"===searchParams!.get("print")
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });
    const {getReport: report} = result?.data;
    return (
        <EditControlProvider>
            <PageSectionOrientation>
                { action? <ReportLayout repPanel={<ReportView rep={report}/>} items={contentItems}>
                        { children }
                    </ReportLayout>
                    :
                    print? <>
                            {children}
                            <ReportView rep={report}/>
                        </>
                       :
                        <div className="flex h-screen print:h-auto">
                            {children}
                            <Report items={contentItems}>
                                <ReportView rep={report}/>
                            </Report>
                        </div>
                }
            </PageSectionOrientation>
        </EditControlProvider>
    )
}