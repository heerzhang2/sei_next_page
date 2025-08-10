import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/app/auth"
import { Provider } from "jotai"
import { GraphQLProvider } from "@/auth/graphql-component"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import "@/styles/print-styles.css" // 导入打印样式
import { PrintSettingsProvider } from "@/contexts/print-settings-context"
import { StorageProvider } from "@/report/StorageContext"
import type React from "react"
import { notoSans, notoSerif } from "@/styles/fonts"
import "./globals.css"
import HeaderWrapper from "@/component/header-wrapper"
import { PWAInstaller } from "@/components/pwa-installer"
import { ServiceWorkerUpdater } from "@/components/service-worker-updater"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAStatusChecker } from "@/components/pwa-status-checker"
import type { Viewport } from "next"
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper"
import { Suspense } from "react"

export const metadata: Metadata = {
    title: "报告编制系统",
    description: "支持离线编辑的报告编制系统",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "报告系统",
    },
}
export const viewport: Viewport = {
    themeColor: "#000000",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {
    const session = await auth()
    return (
        <html suppressHydrationWarning lang="zh-CN">
        <head>
            <link rel="icon" href="/favicon.ico" />
            {/* PWA 相关 meta 标签 */}
            <link rel="apple-touch-icon" href="/icon-192x192.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="报告系统" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="msapplication-TileColor" content="#000000" />
            <meta name="msapplication-tap-highlight" content="no" />
        </head>
        <body
            className={`${notoSans.variable} ${notoSerif.variable} antialiased
             bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 @container
            `}
        >
        <ThemeProvider>
            <PrintSettingsProvider>
                <SessionProvider session={session}>
                    <Provider>
                        <StorageProvider>
                            <GraphQLProvider>
                                <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                                    <OfflineIndicator />
                                </div>
                                <HeaderWrapper />
                                <ErrorBoundaryWrapper>
                                    <Suspense fallback={<div>Loading session...</div>}>{children}</Suspense>
                                </ErrorBoundaryWrapper>
                                {/* PWA 组件 */}
                                <PWAInstaller />
                                <ServiceWorkerUpdater />
                                <PWAStatusChecker />
                                <Toaster richColors position="top-right" />
                            </GraphQLProvider>
                        </StorageProvider>
                    </Provider>
                </SessionProvider>
            </PrintSettingsProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
