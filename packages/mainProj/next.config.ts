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
    // 添加缓存控制配置
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
        ]
    },
}

export default nextConfig
