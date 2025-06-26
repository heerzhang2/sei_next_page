"use client"
import React from "react";
import {useQuery} from "@urql/next";
import ReportLayout from "@/component/rep/reportLayout";
import {ReportParams, ReportQuery} from "@/component/rep/report-data";
import PageSectionOrientation from "@/components/page-section-orientation";
import BrowsingPattern from "@/component/rep/browsingPattern";
import {useParams, useSearchParams} from "next/navigation";
import {EditControlProvider} from "@/component/rep/editControl-provider";
import {ReportView, useCatalog} from "@/report/recreation/slidingJj/Regular.R-1";
import ReportMakeable from "@/common/ReportMakeable";

export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
    const params = useParams() as unknown as ReportParams
    const { repId, action } = params
    const searchParams = useSearchParams()
    const print = "1"===searchParams!.get("print")
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });
    const {getReport: report} = result?.data;
    const catItems=useCatalog()
    return (
        <EditControlProvider>
            <PageSectionOrientation>
                { action? <ReportLayout repPanel={<ReportView rep={report}/>} items={catItems}>
                            <ReportMakeable />
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
                            <BrowsingPattern items={catItems}>
                                <ReportView rep={report}/>
                            </BrowsingPattern>
                        </div>
                }
            </PageSectionOrientation>
        </EditControlProvider>
    )
}