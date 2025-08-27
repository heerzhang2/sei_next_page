import {
    CacheFirst,
    ExpirationPlugin,
    NetworkFirst,
    NetworkOnly,
    type PrecacheEntry,
    RangeRequestsPlugin,
    type RuntimeCaching,
    type SerwistGlobalConfig,
    StaleWhileRevalidate,
} from "serwist"
import { Serwist } from "serwist"
//不要删除！来自参考 ./node_modules/@serwist/next/src/index.worker.ts 生产版本有生效的？
import { defaultCache } from "@serwist/next/worker"

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        // Change this attribute's name to your `injectionPoint`.
        // `injectionPoint` is an InjectManifest option.
        // See https://serwist.pages.dev/docs/build/configuring
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
    }
}

declare const self: ServiceWorkerGlobalScope

const createCacheKeyPlugin = (normalizeFunction: (param: { request: Request }) => Promise<string>) => ({
    cacheKeyWillBeUsed: normalizeFunction,
})

//报告路由约定使用的：这个并非preloadCache，没有参数自动过滤
const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    console.log("normalizeReportCacheKey", url)
    // 提取路径部分，移除动态的 repid
    const pathParts = url.pathname.split("/")
    if (pathParts[1] === "rep" && pathParts.length >= 4) {
        // 重构路径：/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
        const normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`
        // 移除 subrid 查询参数 subrid from utm_idx #这些参数还需要在整个路由之内做协调统一的。
        const searchParams = new URLSearchParams(url.search)
        searchParams.delete("subrid")
        searchParams.delete("from")

        const isRSC = request.headers.get("RSC") === "1"
        const suffix = isRSC ? "#rsc" : "#html"

        // 构建标准化的缓存键
        const normalizedUrl = `${url.origin}${normalizedPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}${suffix}`
        console.log("normalizedUrl最终", normalizedUrl)
        return normalizedUrl
    }
    return request.url
}

const PAGES_CACHE_NAME = {
    rscPrefetch: "pages-rsc-prefetch",
    rsc: "pages-rsc",
    html: "pages",
} as const
//【来源】代码实际上拷贝来自{ defaultCache } from "@serwist/next/worker"，然后自己再修改！
const customCache: RuntimeCaching[] = [
    {
        matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: new CacheFirst({
            cacheName: "google-fonts-webfonts",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: new StaleWhileRevalidate({
            cacheName: "google-fonts-stylesheets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: new StaleWhileRevalidate({
            cacheName: "static-font-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: new StaleWhileRevalidate({
            cacheName: "static-image-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 64,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\/_next\/static.+\.js$/i,
        handler: new CacheFirst({
            cacheName: "next-static-js-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\/_next\/image\?url=.+$/i,
        handler: new StaleWhileRevalidate({
            cacheName: "next-image",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\.(?:mp3|wav|ogg)$/i,
        handler: new CacheFirst({
            cacheName: "static-audio-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
                new RangeRequestsPlugin(),
            ],
        }),
    },
    {
        matcher: /\.(?:mp4|webm)$/i,
        handler: new CacheFirst({
            cacheName: "static-video-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
                new RangeRequestsPlugin(),
            ],
        }),
    },
    {
        matcher: /\.(?:js)$/i,
        handler: new StaleWhileRevalidate({
            cacheName: "static-js-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 48,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\.(?:css|less)$/i,
        handler: new StaleWhileRevalidate({
            cacheName: "static-style-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\/_next\/data\/.+\/.+\.json$/i,
        handler: new NetworkFirst({
            cacheName: "next-data",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\.(?:json|xml|csv)$/i,
        handler: new NetworkFirst({
            cacheName: "static-data-assets",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: /\/api\/auth\/.*/,
        handler: new NetworkOnly(),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) =>
            sameOrigin && pathname.startsWith("/rep/") && !pathname.startsWith("/api/"),
        handler: new NetworkFirst({
            cacheName: "report-pages-normalized",
            plugins: [
                createCacheKeyPlugin(normalizeReportCacheKey), // Apply normalization plugin
                new ExpirationPlugin({
                    maxEntries: 64,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days for report pages
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: ({ request, url: { pathname }, sameOrigin }) =>
            request.headers.get("RSC") === "1" &&
            request.headers.get("Next-Router-Prefetch") === "1" &&
            sameOrigin &&
            !pathname.startsWith("/api/") &&
            !pathname.startsWith("/rep/"), // 排除 /rep/ 路径，让它们使用上面的统一缓存策略
        handler: new NetworkFirst({
            cacheName: PAGES_CACHE_NAME.rscPrefetch,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                }),
            ],
        }),
    },
    {
        matcher: ({ request, url: { pathname }, sameOrigin }) =>
            request.headers.get("RSC") === "1" &&
            sameOrigin &&
            !pathname.startsWith("/api/") &&
            !pathname.startsWith("/rep/"), // 排除 /rep/ 路径，让它们使用上面的统一缓存策略
        handler: new NetworkFirst({
            cacheName: PAGES_CACHE_NAME.rsc,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                }),
            ],
        }),
    },
    {
        matcher: ({ request, url: { pathname }, sameOrigin }) =>
            request.headers.get("Content-Type")?.includes("text/html") && sameOrigin && !pathname.startsWith("/api/"),
        handler: new NetworkFirst({
            cacheName: PAGES_CACHE_NAME.html,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => sameOrigin && !pathname.startsWith("/api/"),
        handler: new NetworkFirst({
            cacheName: "others",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                }),
            ],
        }),
    },
    {
        matcher: ({ sameOrigin }) => !sameOrigin,
        handler: new NetworkFirst({
            cacheName: "cross-origin",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 32,
                    maxAgeSeconds: 60 * 60, // 1 hour
                }),
            ],
            networkTimeoutSeconds: 10,
        }),
    },
    {
        matcher: /.*/i,
        method: "GET",
        handler: new NetworkOnly(),
    },
    ...defaultCache,
]

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    disableDevLogs: false,
    runtimeCaching: customCache,
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
        // ignoreURLParametersMatching,
        plugins: [],
    },
})
console.log(`📊 Startserwist路由表规则个数`,{size: customCache.length, def: defaultCache.length, controller:navigator?.serviceWorker?.controller})

serwist.addEventListeners()

const withIndexedDBErrorHandling = (fn: Function) => {
    return async (...args: any[]) => {
        let retries = 3
        while (retries > 0) {
            try {
                return await fn(...args)
            } catch (error) {
                if (
                    error instanceof Error &&
                    (error.name === "InvalidStateError" ||
                        error.message.includes("database connection is closing") ||
                        error.message.includes("transaction"))
                ) {
                    console.warn(`[SW] IndexedDB 错误，重试中... (剩余 ${retries - 1} 次)`, error.message)
                    retries--
                    if (retries > 0) {
                        // 等待一段时间后重试
                        await new Promise((resolve) => setTimeout(resolve, 100 * (4 - retries)))
                        continue
                    }
                }
                throw error
            }
        }
    }
}

const safeCachePut = withIndexedDBErrorHandling(async (cache: Cache, request: string | Request, response: Response) => {
    return await cache.put(request, response)
})

const safeCacheOpen = withIndexedDBErrorHandling(async (cacheName: string) => {
    return await caches.open(cacheName)
})

// 预缓存报告页面的函数
async function precacheReportPages(
    templates: Array<{ templateId: string; version: string; url?: string }>,
    port?: MessagePort,
) {
    console.log("[SW] 开始预缓存报告页面:", templates)

    let cache: Cache
    try {
        cache = await safeCacheOpen("report-pages-normalized")
    } catch (error) {
        console.error("[SW] 无法打开缓存:", error)
        port?.postMessage({
            type: "PRECACHE_COMPLETE",
            success: false,
            error: "无法打开缓存存储，请刷新页面重试",
        })
        return []
    }

    const results: Array<{
        template: { templateId: string; version: string; url?: string }
        pageSuccess: boolean
        rscSuccess: boolean
        pageError?: string
        rscError?: string
    }> = []

    let completed = 0
    const total = templates.length * 2

    for (const template of templates) {
        const sampleRepId = "sample"
        const baseUrl =
            template.url || `${self.location.origin}/rep/${sampleRepId}/${template.templateId}/${template.version}/ALL`

        const result = {
            template,
            pageSuccess: false,
            rscSuccess: false,
            pageError: undefined as string | undefined,
            rscError: undefined as string | undefined,
        }

        console.log("[SW] 预缓存页面:", baseUrl)

        try {
            const htmlRequest = new Request(baseUrl, {
                method: "GET",
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Cache-Control": "no-cache",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Upgrade-Insecure-Requests": "1",
                },
            })

            const response = await fetch(htmlRequest)

            if (response.ok) {
                const contentType = response.headers.get("content-type") || ""
                if (contentType.includes("text/html")) {
                    const normalizedKey = await normalizeReportCacheKey({ request: htmlRequest })
                    console.log("[SW] 缓存HTML页面到键:", normalizedKey)
                    console.log("[SW] 响应类型:", contentType)
                    await safeCachePut(cache, normalizedKey, response.clone())
                    result.pageSuccess = true
                } else {
                    result.pageError = `响应类型错误: ${contentType}，期望 text/html`
                    console.warn("[SW] 响应类型不是HTML:", contentType)
                }
            } else {
                result.pageError = `HTTP ${response.status}: ${response.statusText}`
            }
        } catch (err) {
            result.pageError = err instanceof Error ? err.message : String(err)
            console.warn("[SW] 预缓存HTML页面失败:", baseUrl, err)
        }

        completed++
        port?.postMessage({
            type: "PRECACHE_PROGRESS",
            completed,
            total,
            currentItem: `${template.templateId}/${template.version} (HTML页面)`,
        })

        try {
            const rscRequest = new Request(baseUrl, {
                method: "GET",
                headers: {
                    RSC: "1",
                    Accept: "text/x-component",
                    "Next-Router-Prefetch": "1",
                },
            })

            const response = await fetch(rscRequest)

            if (response.ok) {
                const contentType = response.headers.get("content-type") || ""
                if (contentType.includes("text/x-component") || contentType.includes("application/json")) {
                    const normalizedKey = await normalizeReportCacheKey({ request: rscRequest })
                    console.log("[SW] 缓存RSC到键:", normalizedKey)
                    console.log("[SW] RSC响应类型:", contentType)
                    await safeCachePut(cache, normalizedKey, response.clone())
                    result.rscSuccess = true
                } else {
                    result.rscError = `RSC响应类型错误: ${contentType}`
                    console.warn("[SW] RSC响应类型不正确:", contentType)
                }
            } else {
                result.rscError = `HTTP ${response.status}: ${response.statusText}`
            }
        } catch (err) {
            result.rscError = err instanceof Error ? err.message : String(err)
            console.warn("[SW] 预缓存RSC失败:", baseUrl, err)
        }

        completed++
        port?.postMessage({
            type: "PRECACHE_PROGRESS",
            completed,
            total,
            currentItem: `${template.templateId}/${template.version} (RSC数据)`,
        })

        results.push(result)
    }

    console.log("[SW] 预缓存完成，结果:", results)
    return results
}

// 监听来自主页面的消息
self.addEventListener("message", (event) => {
    const { data } = event

    if (data?.type === "CLEAR_AUTH_CACHE") {
        event.waitUntil(
            clearAuthCache()
                .then(() => {
                    event.ports[0]?.postMessage({ success: true })
                })
                .catch((error) => {
                    event.ports[0]?.postMessage({ success: false, error: error.message })
                }),
        )
        return
    }

    if (data?.type === "PRECACHE_REPORT_PAGES") {
        const { templates } = data
        const port = event.ports[0]

        event.waitUntil(
            precacheReportPages(templates, port)
                .then((results) => {
                    port?.postMessage({
                        type: "PRECACHE_COMPLETE",
                        success: true,
                        results,
                    })
                })
                .catch((error) => {
                    console.error("[SW] 预缓存失败:", error)
                    port?.postMessage({
                        type: "PRECACHE_COMPLETE",
                        success: false,
                        error: error.message,
                    })
                }),
        )
    }
})

async function clearAuthCache() {
    try {
        // 清除可能缓存了 /api/auth/session 的缓存
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName)
            const requests = await cache.keys()
            for (const request of requests) {
                if (request.url.includes("/api/auth/")) {
                    await cache.delete(request)
                    console.log("[SW] 清除认证缓存:", request.url)
                }
            }
        }
    } catch (error) {
        console.error("[SW] 清除认证缓存失败:", error)
    }
}

self.addEventListener("install", (event) => {
    console.log("[SW] Service Worker 安装中...")

    event.waitUntil(
        (async () => {
            // 强制等待，确保新 SW 完全安装后再激活
            await self.skipWaiting()

            // 这里可以添加关键路由的预缓存逻辑
            console.log("[SW] Service Worker 安装完成")
        })(),
    )
})

self.addEventListener("activate", (event) => {
    console.log("[SW] Service Worker 激活中...")
    event.waitUntil(
        (async () => {
            // 清理旧缓存
            const cacheNames = await caches.keys()
            const oldCaches = cacheNames.filter(
                (name) =>
                    name.includes("workbox") || // 清理旧的 workbox 缓存
                    name.includes("sw-precache"), // 清理旧的 sw-precache 缓存
            )

            await Promise.all(
                oldCaches.map((cacheName) => {
                    console.log("[SW] 删除旧缓存:", cacheName)
                    return caches.delete(cacheName)
                }),
            )

            // 立即控制所有客户端
            await self.clients.claim()
            console.log("[SW] Service Worker 已激活并控制所有页面")
        })(),
    )
})

self.addEventListener("error", (event) => {
    console.error("[SW] Service Worker 错误:", event.error)
    notifyClientsOfError(event.error?.message || "未知的 Service Worker 错误", "SW_ERROR")
})

self.addEventListener("unhandledrejection", (event) => {
    console.error("[SW] 未处理的 Promise 拒绝:", event.reason)

    const error = event.reason
    if (
        error &&
        (error.name === "InvalidStateError" ||
            error.message?.includes("database connection is closing") ||
            error.message?.includes("transaction") ||
            error.message?.includes("IDBDatabase"))
    ) {
        notifyClientsOfError("IndexedDB 连接异常，建议刷新页面以重置缓存状态", "INDEXEDDB_ERROR")
    } else {
        notifyClientsOfError(error?.message || String(error) || "未知的异步错误", "ASYNC_ERROR")
    }

    // 防止错误在控制台显示为未处理
    event.preventDefault()
})

async function notifyClientsOfError(error: string, errorType = "CACHE_ERROR") {
    try {
        const clients = await self.clients.matchAll({ includeUncontrolled: true })
        clients.forEach((client) => {
            client.postMessage({
                type: errorType,
                error: error,
                timestamp: Date.now(),
            })
        })
    } catch (e) {
        console.error("[SW] 无法通知客户端错误:", e)
    }
}
