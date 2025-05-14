import type { ReactNode } from "react"
import ReportMakeable from "@/common/ReportMakeable"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ModificationIndicator } from "@/report/hook/useFormFramework"
import { ReportMainbar } from "@/components/report-mainbar"

/*报告和编制都用到的部分：能支持不要用登录看报告。
只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */
export default async function ReportRootLayout({
                                                   params,
                                                   children,
                                               }: { params: Promise<{ repId: string }>; children: ReactNode }) {
    const { repId } = await params
    //className="pt-10 ?哪来的 className="pt-0"
    return (
        <>
            <ReportMakeable />
            <StorageProvider>
                <ReportData repId={repId}>
                    <ModificationIndicator />
                    <ReportMainbar repId={repId} />
                    <div >{children}</div>
                </ReportData>
            </StorageProvider>
        </>
    )
}
