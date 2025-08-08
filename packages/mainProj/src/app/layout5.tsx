import type { Metadata } from "next"
import "./globals.css"
import { ServiceWorkerUpdater } from "@/components/service-worker-updater"

export const metadata: Metadata = {
    title: "报告编制系统",
    description: "离线报告编制与管理",
    manifest: "/manifest.json",
    themeColor: "#111111",
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
        <head>
            <link rel="apple-touch-icon" href="/icon-192x192.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body>
        {/* 应用主体 */}
        <main>{props.children}</main>

        {/* Service Worker 注册与热更新提示 */}
        <ServiceWorkerUpdater />
        </body>
        </html>
    )
}
