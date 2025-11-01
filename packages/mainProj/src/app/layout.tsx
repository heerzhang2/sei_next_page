import type { Metadata, Viewport } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/app/auth"
import { Provider } from "jotai"
import { GraphQLProvider } from "@/auth/graphql-component"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import "@/styles/print-styles.css"
import { PrintSettingsProvider } from "@/contexts/print-settings-context"
import type React from "react"
import { notoSans, notoSerif } from "@/styles/fonts"
import "./globals.css"
import { OfflineStatusIndicator } from "@/components/offline-status-indicator"
import { PWAInstaller } from "@/components/pwa-installer"
import { NetworkStatusProvider } from "@/contexts/network-status-context"
import { SessionSync } from "@/components/session-sync"
import { TokenRefreshOverlay } from "@/components/token-refresh-overlay"
import { SerwistMessageHandler } from "@/components/serwist-message-handler"

const APP_NAME = "报告编制系统"
const APP_DESCRIPTION = "可支持离线状态编制检验报告和原始记录"

export const metadata: Metadata = {
    applicationName: APP_NAME,
    title: {
        default: APP_NAME,
        template: "%s - 报告编制系统",
    },
    description: APP_DESCRIPTION,
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: APP_NAME,
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        shortcut: "/favicon.ico",
        apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
}

export const viewport: Viewport = {
    themeColor: "#000000",
}

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode
}) {
    const session = await auth()
    return (
        <html suppressHydrationWarning lang="zh-CN">
        <body
            className={`${notoSans.variable} ${notoSerif.variable} antialiased
             bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 @container
            `}
        >
        <ThemeProvider>
            <PrintSettingsProvider>
                <SessionProvider session={session}>
                    <NetworkStatusProvider>
                        <Provider>
                            <GraphQLProvider>
                                <SerwistMessageHandler />
                                <SessionSync />
                                <TokenRefreshOverlay />
                                <OfflineStatusIndicator />
                                {children}
                                <PWAInstaller />
                                <Toaster richColors position="top-right" expand={true} visibleToasts={5} closeButton={true} />
                            </GraphQLProvider>
                        </Provider>
                    </NetworkStatusProvider>
                </SessionProvider>
            </PrintSettingsProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}