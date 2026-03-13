//src\app\rep\[repId]\INDPL_DJ\1\[action]\page.tsx
"use client"
import {ReportPageWrapper} from "@/component/rep/page-wrapper"
import {OriginalView} from "@/report/industrial/Periodical/indPipelineO1";

export default function Page() {
    return <ReportPageWrapper OriginalView={OriginalView} verId={'1'}/>
}
