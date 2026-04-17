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
import { PendingReportsGuard } from "@/components/pending-reports-guard"
import { withBasePath } from '@/lib/tool'
import { SerwistProvider } from "../lib/serwist/client"
import { OfflineSessionPatcher } from "@/components/offline-session-patcher"
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const APP_NAME = "福建省特种设备检验研究院报告编制系统"
const APP_DESCRIPTION = "可支持离线状态编制检验报告和原始记录"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: "%s-福建省特种设备检验研究院报告编制系统",
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
  // 检查是否启用 PWA 功能
  const enablePWA = process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false'
  return (
    <html suppressHydrationWarning lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body
        className={`${notoSans.variable} ${notoSerif.variable} antialiased
             bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 @container
            `}
      >
        {enablePWA ? (
          <SerwistProvider cacheOnNavigation={false} swUrl={`${swPathBase}/serwist/sw.js`}>
            <ThemeProvider>
              <PrintSettingsProvider>
                <TooltipProvider>
                  <SessionProvider session={session} basePath={basePath}>
                    <NetworkStatusProvider>
                      <OfflineSessionPatcher />
                      <GraphQLProvider>
                        <SerwistMessageHandler />
                        <SessionSync />
                        <TokenRefreshOverlay />
                        <OfflineStatusIndicator />
                        <PendingReportsGuard />
                        {children}
                        <PWAInstaller />
                        <Toaster richColors position="top-right" expand={true} visibleToasts={5} closeButton={true} className="print:hidden" />
                      </GraphQLProvider>
                    </NetworkStatusProvider>
                  </SessionProvider>
                </TooltipProvider>
              </PrintSettingsProvider>
            </ThemeProvider>
          </SerwistProvider>
        ) : (
          <ThemeProvider>
            <PrintSettingsProvider>
              <TooltipProvider>
                <SessionProvider session={session} basePath={basePath}>
                  <NetworkStatusProvider>
                    <OfflineSessionPatcher />
                    <GraphQLProvider>
                      <SessionSync />
                      <TokenRefreshOverlay />
                      <PendingReportsGuard />
                      {children}
                      <Toaster richColors position="top-right" expand={true} visibleToasts={5} closeButton={true} className="print:hidden" />
                    </GraphQLProvider>
                  </NetworkStatusProvider>
                </SessionProvider>
              </TooltipProvider>
            </PrintSettingsProvider>
          </ThemeProvider>
        )}
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
