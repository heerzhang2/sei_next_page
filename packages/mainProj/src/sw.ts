import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

/**接口的档 https://serwist.pages.dev/docs/next/getting-started
 * */

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    disableDevLogs: false,
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
    precacheOptions: {
        // Whether outdated caches should be removed.
        cleanupOutdatedCaches: true,
        concurrency: 10,
        ignoreURLParametersMatching: [

        ],
    },
    //urlManipulation — A function that should take a URL and return an array of alternative URLs that should be checked for precache matches.
    offlineAnalyticsConfig: true,

});

serwist.addEventListeners();
