import type { NextConfig } from "next"
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")
const crypto = require("crypto")

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
    /** @type {import("next").NextConfig} */

    const enableSerwist = process.env.ENABLE_SERWIST !== "false"
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
        output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
        // 允许特定开发来源;    但是生产环境推荐Nginx反向代理方案
        allowedDevOrigins: ["192.168.171.3", "192.168.0.100"], // 多来源数组
    }

    if (phase === PHASE_PRODUCTION_BUILD || (phase === PHASE_DEVELOPMENT_SERVER && enableSerwist)) {
        const revision = crypto.randomUUID()
        const withSerwist = (await import("@serwist/next")).default({
            disable: false,
            swSrc: "src/sw.ts",
            swDest: "public/sw.js",
            reloadOnOnline: false,
            cacheOnNavigation: false,
            register: true,
            maximumFileSizeToCacheInBytes: 5000000, // 减小到5MB
            additionalPrecacheEntries: [{ url: "/~offline", revision },
                { url: "/login", revision }
            ],
        })
        return withSerwist(nextConfig)
    }
    return nextConfig
}
