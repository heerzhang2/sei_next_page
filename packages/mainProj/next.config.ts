import type { NextConfig } from "next"
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants")
const crypto = require("crypto")

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
    /** @type {import("next").NextConfig} */

    const enableSerwist = process.env.ENABLE_SERWIST !== "false"
    const enableHMR = process.env.ENABLE_HMR !== "false"

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
                forceSwcTransforms: !enableHMR,
            },
            webpack: (config, { dev, isServer }) => {
                const enableHMR = process.env.ENABLE_HMR !== "false" // Moved declaration here
                if (dev && !enableHMR) {
                    config.plugins = config.plugins.map((plugin) => {
                        if (plugin.constructor.name === "HotModuleReplacementPlugin") {
                            // 禁用HMR但保留插件结构
                            return new plugin.constructor({ multiStep: false })
                        }
                        return plugin
                    })

                    config.watchOptions = {
                        ...config.watchOptions,
                        poll: false,
                        aggregateTimeout: 30000, //聚合时间：设置大值会导致初始化较慢，但浏览器刷新频率减少。
                        ignored: /node_modules/,
                    }

                    config.module.rules.forEach((rule) => {
                        if (rule.use && Array.isArray(rule.use)) {
                            rule.use = rule.use.filter((loader) => {
                                if (typeof loader === "object" && loader.loader) {
                                    return !loader.loader.includes("react-refresh")
                                }
                                return true
                            })
                        }
                    })
                }

                // 排除所有 .node 二进制文件
                config.module.rules.push({
                    test: /\.node$/,
                    use: "ignore-loader",
                })

                if (!isServer) {
                    // 客户端优化
                    config.resolve.fallback = {
                        ...config.resolve.fallback,
                        fs: false,
                        net: false,
                        tls: false,
                    }

                    // 代码分割优化
                    config.optimization.splitChunks = {
                        ...config.optimization.splitChunks,
                        cacheGroups: {
                            ...config.optimization.splitChunks?.cacheGroups,
                            // 报告相关代码单独打包
                            report: {
                                test: /[\\/]src[\\/]report[\\/]/,
                                name: "report",
                                chunks: "all",
                                priority: 10,
                            },
                            // 组件库单独打包
                            components: {
                                test: /[\\/]src[\\/]components[\\/]/,
                                name: "components",
                                chunks: "all",
                                priority: 5,
                            },
                        },
                    }
                }

                return config
            },
        }),

        ...(phase !== PHASE_DEVELOPMENT_SERVER && {
            webpack: (config, { isServer }) => {
                // 排除所有 .node 二进制文件
                config.module.rules.push({
                    test: /\.node$/,
                    use: "ignore-loader",
                })

                if (!isServer) {
                    // 客户端优化
                    config.resolve.fallback = {
                        ...config.resolve.fallback,
                        fs: false,
                        net: false,
                        tls: false,
                    }

                    // 代码分割优化
                    config.optimization.splitChunks = {
                        ...config.optimization.splitChunks,
                        cacheGroups: {
                            ...config.optimization.splitChunks?.cacheGroups,
                            // 报告相关代码单独打包
                            report: {
                                test: /[\\/]src[\\/]report[\\/]/,
                                name: "report",
                                chunks: "all",
                                priority: 10,
                            },
                            // 组件库单独打包
                            components: {
                                test: /[\\/]src[\\/]components[\\/]/,
                                name: "components",
                                chunks: "all",
                                priority: 5,
                            },
                        },
                    }
                }

                return config
            },
        }),

        experimental: {
            webpackBuildWorker: true,
            // 启用静态导出优化
            optimizePackageImports: ["@/components", "@/lib"],
            // 启用部分预渲染
            ppr: false, // 可以设为 true 试验部分预渲染
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

        rewrites: async () => {
            return [
                {
                    source: "/sw.js",
                    destination: "/sw.js",
                },
                // 健康检查端点
                {
                    source: "/health",
                    destination: "/api/health",
                },
            ]
        },

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
                { url: "/login", revision }, { url: "/", revision }
            ],
        })
        return withSerwist(nextConfig)
    }
    return nextConfig
}
