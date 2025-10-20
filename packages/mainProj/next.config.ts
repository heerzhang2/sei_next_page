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
        reactStrictMode: true,

        webpack: (config, { isServer }) => {
            // 排除所有 .node 二进制文件 如果你需要使用这些模块，可以使用 node-loader 代替 ignore-loader 但这通常只在 Node.js 环境中有效，不适用于浏览器
            config.module.rules.push({
                test: /\.node$/,
                use: "ignore-loader",
            })
            // 增加网络超时配置
            config.infrastructureLogging = {
                level: "warn",
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
        allowedDevOrigins: ["192.168.171.3", "192.168.0.100"],
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
            { url: "/", revision },
            { url: "/login", revision },
            { url: "/~offline", revision },
            { url: "/offline", revision }
        ],
    })
    return withSerwist(nextConfig)
}
