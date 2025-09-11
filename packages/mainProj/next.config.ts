import type { NextConfig } from "next"
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")
const crypto = require("crypto")

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
    /** @type {import("next").NextConfig} */

    const nextConfig: NextConfig = {
        /* config options here */
        eslint: {
            // 警告：这允许生产构建在项目有 ESLint 错误的情况下成功完成
            ignoreDuringBuilds: true,
        },
        typescript: {
            // 警告：这允许生产构建在项目有类型错误的情况下成功完成
            ignoreBuildErrors: true,
        },
        images: {
            unoptimized: true,
        },
        ...(phase === PHASE_DEVELOPMENT_SERVER && {
            reactStrictMode: false,
            experimental: {
                forceSwcTransforms: false,
            },
        }),
        ...(phase !== PHASE_DEVELOPMENT_SERVER && {

        }),
        experimental: {
            webpackBuildWorker: true,
        },

        output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,

        headers: async () => {
            return [
                {
                    // 匹配所有 API 路由
                    source: "/api/:path*",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
                        },
                        {
                            key: "Pragma",
                            value: "no-cache",
                        },
                        {
                            key: "Expires",
                            value: "0",
                        },
                    ],
                },
                {
                    source: "/rep/:path*",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "no-cache, max-age=0",
                        },
                        {
                            key: "X-PWA-Cache",
                            value: "report-page",
                        },
                    ],
                },
                {
                    source: "/_next/data/:path*",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=60, stale-while-revalidate=300",
                        },
                    ],
                },
                {
                    source: "/_next/static/:path*",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=31536000, immutable",
                        },
                    ],
                },
                // PWA Service Worker 配置
                {
                    source: "/sw.js",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=0, must-revalidate",
                        },
                        {
                            key: "Service-Worker-Allowed",
                            value: "/",
                        },
                    ],
                },
                // PWA Manifest 配置
                {
                    source: "/manifest.json",
                    headers: [
                        {
                            key: "Cache-Control",
                            value: "public, max-age=31536000, immutable",
                        },
                    ],
                },
            ]
        },

        // 允许特定开发来源;    但是生产环境推荐Nginx反向代理方案
        allowedDevOrigins: ["192.168.171.3", "192.168.0.100"], // 多来源数组
    }

    const revision = crypto.randomUUID()
    const withSerwist = (await import("@serwist/next")).default({
        disable: false,
        swSrc: "src/sw.ts",
        swDest: "public/sw.js",
        reloadOnOnline: false,
        cacheOnNavigation: false,
        register: true,
        maximumFileSizeToCacheInBytes: 9000000, // 减小到9MB
        additionalPrecacheEntries: [
            { url: "/~offline", revision },
            { url: "/login", revision:null },
            { url: "/", revision }
        ],
    })
    return withSerwist(nextConfig)
}
