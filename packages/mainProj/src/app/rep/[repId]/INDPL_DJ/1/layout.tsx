// src\app\rep\[repId]\INDPL_DJ\1\layout.tsx
"use client";
import React from "react";
import { ReportLayoutWrapper } from "@/component/rep/layout-wrapper";
import { ReportView, useCatalog } from "@/report/industrial/Periodical/indPipelineR1";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ReportLayoutWrapper key="report-layout-wrapper-stable" ReportView={ReportView} useCatalog={useCatalog}>
            {children}
        </ReportLayoutWrapper>
    );
}