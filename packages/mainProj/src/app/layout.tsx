import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/app/auth"
import { Provider } from "jotai"
import { GraphQLProvider } from "@/auth/graphql-component"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import "@/styles/print-styles.css" // 导入打印样式
import { PrintSettingsProvider } from "@/contexts/print-settings-context"
import type React from "react"
import { notoSans, notoSerif } from "@/styles/fonts"
import "./globals.css"
import HeaderWrapper from "@/component/header-wrapper"
import { PWAInstaller } from "@/components/pwa-installer"
import { OfflineIndicator } from "@/components/offline-indicator"
import { OfflineStatusIndicator } from "@/components/offline-status-indicator"
import { SafariViewportFix } from "@/components/safari-viewport-fix"
import { AuthErrorBoundary } from "@/components/auth-error-boundary"
import type { Viewport } from "next"

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

        {/* Safari 特定优化 */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-orientations" content="portrait-any landscape-any" />

        {/* 防止 Safari 缩放 */}
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />

        {/* Safari PWA 启动画面 */}
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />

        <style
            dangerouslySetInnerHTML={{
              __html: `
                    /* Safari 特定修复 */
                    :root {
                        --vh: 1vh;
                    }
                    
                    @supports (-webkit-touch-callout: none) {
                        .safari-fix {
                            -webkit-overflow-scrolling: touch;
                        }
                        
                        /* 修复 Safari 横竖屏切换问题 */
                        @media screen and (orientation: landscape) {
                            body {
                                height: 100vh;
                                height: calc(var(--vh, 1vh) * 100);
                                height: -webkit-fill-available;
                            }
                        }
                        
                        @media screen and (orientation: portrait) {
                            body {
                                height: 100vh;
                                height: calc(var(--vh, 1vh) * 100);
                                height: -webkit-fill-available;
                            }
                        }
                        
                        /* 防止 Safari 的橡皮筋效果 */
                        html, body {
                            position: relative;
                            width: 100%;
                            min-height: 100vh;
                            min-height: -webkit-fill-available;
                            overflow-x: hidden;
                        }
                        
                        #__next {
                            min-height: 100vh;
                            min-height: -webkit-fill-available;
                            -webkit-overflow-scrolling: touch;
                        }
                        
                        /* 强制重新渲染以修复方向变化问题 */
                        @media screen and (orientation: landscape) {
                            * {
                                -webkit-transform: translateZ(0);
                                transform: translateZ(0);
                            }
                        }
                        
                        @media screen and (orientation: portrait) {
                            * {
                                -webkit-transform: translateZ(0);
                                transform: translateZ(0);
                            }
                        }
                    }
                `,
            }}
        />
      </head>
      <body
          className={`${notoSans.variable} ${notoSerif.variable} antialiased
             bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 @container safari-fix
            `}
      >
      <SafariViewportFix />
      <ThemeProvider>
        <PrintSettingsProvider>
          <SessionProvider session={session}>
            <AuthErrorBoundary>
              <Provider>
                <GraphQLProvider>
                  {/* 离线状态指示器 */}
                  <OfflineStatusIndicator />

                  <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                    <OfflineIndicator />
                  </div>
                  <HeaderWrapper />
                  {children}
                  {/* PWA 组件 */}
                  <PWAInstaller />
                  <Toaster richColors position="top-right" />
                </GraphQLProvider>
              </Provider>
            </AuthErrorBoundary>
          </SessionProvider>
        </PrintSettingsProvider>
      </ThemeProvider>
      </body>
      </html>
  )
}
