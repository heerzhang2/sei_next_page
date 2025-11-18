//src\app\rep\[repId]\INDPL_DJ\1\[action]\page.tsx
"use client"
import * as React from "react";
import {ReportPageWrapper} from "@/component/rep/page-wrapper"
import {OriginalView} from "@/report/industrial/Periodical/indPipelineO1";
import {useEffect} from "react";

export default function Page() {
    useEffect(() => {
        console.log("✅ Page mounted");
        return () => console.log("❌ Page unmounted");
    }, []);
    return <ReportPageWrapper OriginalView={OriginalView} verId={'1'}/>
}
