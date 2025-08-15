import type { Metadata } from "next"
import ReportPageClient from "./ReportPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({
                                           params,
                                       }: {
    params: { repId: string; params: string[] }
}): Promise<Metadata> {
    throw new Error("N非预期的页面1e")
    return {
        title: `报告 - ${params.repId}`,
        description: "离线可用的报告页面",
        // PWA 相关元数据
        other: {
            "mobile-web-app-capable": "yes",
            "apple-mobile-web-app-capable": "yes",
        },
    }
}

export default function ReportPage({
                                       params,
                                   }: {
    params: { repId: string; params: string[] }
}) {
    throw new Error("N非预期的页面2e")
    return <ReportPageClient params={params} />
}
