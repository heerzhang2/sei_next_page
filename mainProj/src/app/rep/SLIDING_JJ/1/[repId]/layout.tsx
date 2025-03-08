"use client"

import ReportLayout from "@/component/rep/reportLayout";
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord";

import {contentItems, ReportView} from "@/report/recreation/slidingJj/Regular.R-1";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    return (
        <ReportLayout repPanel={<ReportView id={""} />} items={contentItems}>
          {children}
        </ReportLayout>
    )
}
