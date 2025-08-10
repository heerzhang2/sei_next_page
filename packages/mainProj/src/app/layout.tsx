import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { PWAInstaller } from "@/components/pwa-installer"
import { PWAStatusChecker } from "@/components/pwa-status-checker"
import { ServiceWorkerUpdater } from "@/components/service-worker-updater"
import { OfflineIndicator } from "@/components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "报告编制系统",
    description: "在线检验报告编制与离线编辑系统",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "报告系统",
        startupImage: [
            {
                url: "/icon-512x512.png",
                media: "(device-width: 768px) and (device-height: 1024px)",
            },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "default",
        "apple-mobile-web-app-title": "报告系统",
        "application-name": "报告系统",
        "msapplication-TileColor": "#000000",
        "msapplication-tap-highlight": "no",
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
        <head>
            <link rel="icon" href="/icon-192x192.png" />
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
        <body className={inter.className}>
        <SessionProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Toaster position="top-center" />
            <OfflineIndicator />
            <PWAInstaller />
            <PWAStatusChecker />
            <ServiceWorkerUpdater />
        </SessionProvider>
        </body>
        </html>
    )
}
