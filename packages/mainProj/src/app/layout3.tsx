import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PWAInstaller } from '@/components/pwa-installer'
import { ServiceWorkerUpdater } from '@/components/service-worker-updater'
import { OfflineIndicator } from '@/components/offline-indicator'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: '报告编制系统',
    description: '离线报告编制和管理系统',
    manifest: '/manifest.json',
    themeColor: '#000000',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: '报告系统'
    }
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
        <head>
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
        <body className={inter.className}>
        {/* 离线状态指示器 */}
        <div className="fixed top-4 right-4 z-50">
            <OfflineIndicator />
        </div>

        {children}

        {/* PWA 组件 */}
        <PWAInstaller />
        <ServiceWorkerUpdater />

        </body>
        </html>
    )
}
