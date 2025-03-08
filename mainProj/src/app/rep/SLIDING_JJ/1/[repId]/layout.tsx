"use client"

import ReportLayout from "@/app/rep/SLIDING_JJ/1/[repId]/reportLayout";
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord";

import {contentItems} from "@/report/recreation/slidingJj/Regular.R-1";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    return (
        <ReportLayout repPanel={<ReportOrRecord id={""} />} items={contentItems}>
          {children}
        </ReportLayout>
    )
}
