import type { ReactNode } from "react"
import HeaderWrapper from "@/component/header-wrapper";
export default async function ReportDirLayout({children}: { children: ReactNode}) {
    return (
        <>
            <HeaderWrapper />
            {children}
        </>
    )
}
