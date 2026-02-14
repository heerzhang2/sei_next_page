import type { Metadata, Viewport } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/app/auth"
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
import { withBasePath } from '@/lib/tool'
import { SerwistProvider } from "../lib/serwist/client"

const APP_NAME = "报告编制系统"
const APP_DESCRIPTION = "可支持离线状态编制检验报告和原始记录"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: "%s - 报告编制系统",
  },
  description: APP_DESCRIPTION,
  manifest: withBasePath('/manifest.json'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: withBasePath('/favicon.ico'),
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
  // 因为客户端需要知道完整的 API URL
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` : "/api/auth"
  const swPathBase = process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}` : ""
  return (
    <html suppressHydrationWarning lang="zh-CN">
      <body
        className={`${notoSans.variable} ${notoSerif.variable} antialiased
             bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 @container
            `}
      >
        <SerwistProvider swUrl={`${swPathBase}/serwist/sw.js`}>
          <ThemeProvider>
            <PrintSettingsProvider>
              <SessionProvider session={session} basePath={basePath}>
                <NetworkStatusProvider>
                  <GraphQLProvider>
                    <SerwistMessageHandler />
                    {/* <ServiceWorkerRegister /> */}
                    <SessionSync />
                    <TokenRefreshOverlay />
                    <OfflineStatusIndicator />
                    {children}
                    <PWAInstaller />
                    <Toaster richColors position="top-right" expand={true} visibleToasts={5} closeButton={true} />
                  </GraphQLProvider>
                </NetworkStatusProvider>
              </SessionProvider>
            </PrintSettingsProvider>
          </ThemeProvider>
        </SerwistProvider>
        {/* 注入全局变量供 SW 注册使用 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.__NEXT_PUBLIC_BASE_PATH__ = '${process.env.NEXT_PUBLIC_BASE_PATH || ''}';
            }
          `
        }} />
      </body>
    </html>
  )
}
