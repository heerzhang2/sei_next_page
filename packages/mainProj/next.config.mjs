/** @type {import("next").NextConfig} */
const nextConfig = {
    eslint: {
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

    // 基础路径配置，用于子路径部署
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

    webpack: (config, { isServer, dev }) => {
        // 排除所有 .node 二进制文件
        config.module.rules.push({
            test: /\.node$/,
            use: "ignore-loader",
        });
        // 增加网络超时配置
        config.infrastructureLogging = {
            level: "warn",
        };

        // 确保 @camunda8/sdk 在服务端正确解析
        if (isServer) {
            config.externals = config.externals || [];
            config.externals.push('@camunda8/sdk');
        }

        // 调试模式下启用source maps
        if (dev) {
            config.devtool = 'source-map';
        }

        return config;
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
        ];
    },

    // 允许特定开发来源;    但是生产环境推荐Nginx反向代理方案
    allowedDevOrigins: process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS?.split(",") || ["192.168.171.3", "192.168.0.100"],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
            // 允许的 Server Actions 请求来源（包含端口号）
            allowedOrigins: [
                "192.168.109.66:30443",
                "192.168.109.66",
                "192.168.171.3:9443",
                "192.168.171.3",
                "192.168.0.100:9443",
                "192.168.0.100",
            ],
            // 允许的转发主机头
            allowedForwardedHosts: ["192.168.171.3:9443", "192.168.171.3", "192.168.0.100:9443", "192.168.0.100"],
        },
        // Turbopack 配置
        turbo: {
            resolveAlias: {
                '@camunda8/sdk': '@camunda8/sdk',
            },
        },
    },
};

export default nextConfig;
