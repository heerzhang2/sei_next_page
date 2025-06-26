import type { ReactNode } from "react"
import ReportData from "@/component/rep/report-data"
import { StorageProvider } from "@/report/StorageContext"
import { ModificationIndicator } from "@/report/hook/useFormFramework"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"

/*报告和编制都用到的部分：能支持不要用登录看报告。
只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */
export default async function ReportRootLayout({
                                                   params,
                                                   children,
                                               }: {
    params: Promise<{ repId: string }>
    children: ReactNode
}) {
    const { repId } = await params
    //假如把SiteMainbar<ReportMainbar repId={repId} />放这,会出现告警Skipping auto-scroll behavior due to `position: sticky` or `position: fixed` on element;
    //最后只能下沉app\rep\[repId]\SLIDING_JJ\1\layout.tsx里面做的或直接上浮了。
    return (
        <ErrorBoundaryWrapper>
            <StorageProvider>
                <ReportData repId={repId}>
                    <ModificationIndicator />
                    <div>{children}</div>
                </ReportData>
            </StorageProvider>
        </ErrorBoundaryWrapper>
    )
}
