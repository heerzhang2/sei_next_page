import type { NextConfig } from "next"
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")
const crypto = require("crypto")

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
    /** @type {import("next").NextConfig} */

    const nextConfig: NextConfig = {
        /* config options here */
        typescript: {
            // 警告：这允许生产构建在项目有类型错误的情况下成功完成
            ignoreBuildErrors: true,
        },
        images: {
            unoptimized: true,
        },
        reactStrictMode: true,

        // 基础路径配置，用于子路径部署
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
        assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

        webpack: (config, { isServer, dev }) => {
            // 排除所有 .node 二进制文件 如果你需要使用这些模块，可以使用 node-loader 代替 ignore-loader 但这通常只在 Node.js 环境中有效，不适用于浏览器
            config.module.rules.push({
                test: /\.node$/,
                use: "ignore-loader",
            })
            // 增加网络超时配置
            config.infrastructureLogging = {
                level: "warn",
            }
            
            // 调试模式下启用source maps
            if (dev) {
                config.devtool = 'source-map'
            }
            
            return config
        },

        output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,

        headers: async () => {
            return [
                //PWA Service Worker也算一种请求发起者的。
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
            ]
        },

        // 允许特定开发来源;    但是生产环境推荐Nginx反向代理方案
        allowedDevOrigins: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS?.split(",") || ["192.168.171.3", "192.168.0.100"],
        experimental: {
            serverActions: {
                bodySizeLimit: '10mb',
                // 允许的 Server Actions 请求来源（包含端口）
                // 当通过反向代理（如 APISIX）访问时，origin 头会包含端口号
                allowedOrigins: [
                "192.168.171.3:9443",
                "192.168.171.3",
                "192.168.0.100:9443",
                "192.168.0.100",
                // 如果有域名也加上
                // "yourdomain.com",
                // "yourdomain.com:9443",
                ],
                // 允许的转发主机头
                allowedForwardedHosts: ["192.168.171.3:9443", "192.168.171.3", "192.168.0.100:9443", "192.168.0.100"],
            },
        },
    }

    const revision = crypto.randomUUID()
    const disableSerwist = process.env.NEXT_DEV_TURBOPACK === "0" || false
    const withSerwist = (await import("@serwist/next")).default({
        disable: process.env.NODE_ENV !== "production" && disableSerwist,
        swSrc: "src/sw.ts",
        swDest: "public/sw.js",
        reloadOnOnline: false,
        cacheOnNavigation: false,
        register: true,
        maximumFileSizeToCacheInBytes: 9000000, // 减小到9MB
        additionalPrecacheEntries: [
            { url: "/", revision },
            { url: "/login", revision },
            { url: "/~offline", revision },
            { url: "/offline", revision },
        ],
    })
    return withSerwist(nextConfig)
}
