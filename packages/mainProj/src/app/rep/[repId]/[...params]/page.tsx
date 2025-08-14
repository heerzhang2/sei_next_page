import type { Metadata } from "next"
import ReportPageClient from "./ReportPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({
                                           params,
                                       }: {
    params: { repId: string; params: string[] }
}): Promise<Metadata> {
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
    return <ReportPageClient params={params} />
}
