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
}

export default nextConfig

