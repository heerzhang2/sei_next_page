// src\app\rep\[repId]\INDPL_DJ\1\layout.tsx
"use client";
import React, {useEffect} from "react";
import { ReportLayoutWrapper } from "@/component/rep/layout-wrapper";
import { ReportView, useCatalog } from "@/report/industrial/Periodical/indPipelineR1";
import {ReportPageWrapper} from "@/component/rep/page-wrapper";
import {OriginalView} from "@/report/industrial/Periodical/indPipelineO1";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ReportLayoutWrapper key="report-layout-wrapper-stable" ReportView={ReportView} useCatalog={useCatalog}>
            {children}
        </ReportLayoutWrapper>
    );
}