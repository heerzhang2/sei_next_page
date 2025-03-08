"use client"
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord";
// import { ContentSection } from "./content-section"
import React from "react";
import Report from "@/component/rep/report";
import {contentItems, ReportView} from "@/report/recreation/slidingJj/Regular.R-1";
import {useQuery} from "@urql/next";
import {ReportQuery} from "@/component/rep/report-data";

export default function Page({ params
                     }: Readonly<{
    params: Promise<{ repId: string }>,
}>) {
    const { repId } = React.use(params);
    const [result] = useQuery({ query: ReportQuery, variables: { id: repId } });
    const {getReport: report} = result?.data;
  return (
      <Report items={contentItems}>
          <ReportView rep={report} />
      </Report>
  );
}
