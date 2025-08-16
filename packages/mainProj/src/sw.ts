import { installSerwist } from "serwist"
import { defaultCache } from "@serwist/next/worker"

declare const self: ServiceWorkerGlobalScope

installSerwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        ...defaultCache,
        // 报告页面特殊缓存策略
        {
            urlPattern: /^https?:\/\/.*\/rep\/.*$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "report-pages",
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
                },
                networkTimeoutSeconds: 3,
                cacheKeyWillBeUsed: async ({ request }) => {
                    // 标准化URL，移除RSC参数
                    const url = new URL(request.url)
                    url.searchParams.delete("_rsc")
                    return url.toString()
                },
            },
        },
        // GraphQL请求缓存
        {
            urlPattern: /\/api\/graphql$/,
            handler: "NetworkFirst",
            options: {
                cacheName: "graphql-cache",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 24 * 60 * 60, // 1天
                },
                networkTimeoutSeconds: 5,
            },
        },
        // 静态资源缓存
        {
            urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
            handler: "CacheFirst",
            options: {
                cacheName: "static-resources",
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
                },
            },
        },
    ],
    fallbacks: {
        entries: [
            {
                url: "/~offline",
                matcher({ request }) {
                    return request.destination === "document"
                },
            },
        ],
    },
})

// 监听消息
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting()
    }
})
