"use client"
import ReportOrRecord from "@/report/recreation/slidingJj/reportOrRecord";
// import { ContentSection } from "./content-section"
import React from "react";
import Report from "@/component/rep/report";
import {contentItems} from "@/report/recreation/slidingJj/Regular.R-1";


export default function Page() {
  return (
      <Report items={contentItems}>
        <ReportOrRecord id={''} />
      </Report>
  );
}

