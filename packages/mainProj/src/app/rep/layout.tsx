import type { ReactNode } from "react"
export default async function ReportDirLayout({
                                                   children,
                                               }: {
    children: ReactNode
}) {
    //若这里加<ReportMainbar/>的：依然告警Skipping auto-scroll behavior due to `position: sticky` or `position: fixed` on element；只能往上面走。
    return (
        <>
            {children}
        </>
    )
}
