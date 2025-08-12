import type { NextConfig } from "next"

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

    // PWA 相关配置
    experimental: {
        webpackBuildWorker: true,
    },

    // 添加缓存控制配置 + PWA 头部配置
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
                // 匹配所有数据请求
                source: "/_next/data/:path*",
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

    // PWA 重写规则
    async rewrites() {
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

    webpack: (config, { isServer }) => {
        // 排除所有 .node 二进制文件
        config.module.rules.push({
            test: /\.node$/,
            use: "ignore-loader",
        })

        return config
    },
    // 允许特定开发来源;    但是生产环境推荐Nginx反向代理方案
    allowedDevOrigins: ["192.168.171.3", "192.168.0.100"], // 多来源数组
}

export default nextConfig
