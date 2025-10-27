import {
    CacheFirst,
    ExpirationPlugin,
    NetworkFirst,
    NetworkOnly,
    type PrecacheEntry,
    type RuntimeCaching,
    type SerwistGlobalConfig,
} from "serwist"
import { Serwist } from "serwist"
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker"

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
    }
}

declare const self: ServiceWorkerGlobalScope

const createCacheKeyPlugin = (normalizeFunction: (param: { request: Request }) => Promise<string>) => ({
    cacheKeyWillBeUsed: normalizeFunction,
    cachedResponseWillBeUsed: async ({ request, cachedResponse }: { request: Request; cachedResponse?: Response }) => {
        if (!cachedResponse) {
            return null
        }

        const url = new URL(request.url)
        if (!url.pathname.startsWith("/rep/")) {
            return cachedResponse
        }

        const isRSCRequest = request.headers.get("RSC") === "1"
        const isNavigationRequest = request.mode === "navigate"

        const contentType = cachedResponse.headers.get("content-type") || ""
        const isRSCResponse = contentType.includes("text/x-component")

        if (isNavigationRequest && isRSCResponse) {
            console.warn(`[SW] 导航请求不应返回 RSC 响应: ${request.url}`)
            return null
        }

        if (isRSCRequest && !isRSCResponse) {
            console.warn(`[SW] RSC 请求不应返回 HTML 响应: ${request.url}`)
            return null
        }

        console.log(`[SW] ✓ 返回匹配的缓存响应: ${request.url}, RSC=${isRSCResponse}`)
        return cachedResponse
    },
})

const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
    const url = new URL(request.url)

    const pathParts = url.pathname.split("/")
    if (pathParts[1] === "rep" && pathParts.length >= 4) {
        const hasAction = pathParts.length >= 5 && pathParts[5] !== ""

        let normalizedPath: string
        if (hasAction) {
            normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`
        } else {
            normalizedPath = `/rep/*/${pathParts[3]}/${pathParts[4]}`
        }

        const searchParams = new URLSearchParams(url.search)
        searchParams.delete("subrid")
        searchParams.delete("redId")
        searchParams.delete("from")
        searchParams.delete("original")
        searchParams.delete("unitIndex")
        searchParams.delete("modelkey")

        const isRSC = request.headers.get("RSC") === "1"
        const suffix = isRSC ? "#rsc" : "#html"

        const normalizedUrl = `${url.origin}${normalizedPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}${suffix}`

        console.log(`[SW] 标准化缓存键: ${request.url} -> ${normalizedUrl}`)
        return normalizedUrl
    }
    return request.url
}

const customCache: RuntimeCaching[] = [
    {
        matcher: ({ url: { pathname }, sameOrigin }) =>
            sameOrigin &&
            (pathname.startsWith("/_next/static/chunks/") ||
                pathname.startsWith("/_next/static/css/") ||
                pathname.includes("webpack-")),
        handler: new CacheFirst({
            cacheName: "next-chunks",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 2000,
                    maxAgeSeconds: 90 * 24 * 60 * 60,
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => sameOrigin && pathname.startsWith("/rep/"),
        handler: new CacheFirst({
            cacheName: "report-pages-normalized",
            plugins: [
                createCacheKeyPlugin(normalizeReportCacheKey),
                new ExpirationPlugin({
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                    maxAgeFrom: "last-used",
                }),
            ],
            networkTimeoutSeconds: 3,
        }),
    },
    {
        matcher: ({ request, url: { pathname }, sameOrigin }) =>
            request.headers.get("RSC") === "1" &&
            request.headers.get("Next-Router-Prefetch") === "1" &&
            sameOrigin &&
            !pathname.startsWith("/api/") &&
            !pathname.startsWith("/rep/"),
        handler: new NetworkFirst({
            cacheName: PAGES_CACHE_NAME.rscPrefetch,
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 48 * 60 * 60,
                }),
            ],
        }),
    },
    {
        matcher: ({ request, url: { pathname }, sameOrigin }) =>
            request.headers.get("RSC") === "1" &&
            sameOrigin &&
            !pathname.startsWith("/api/") &&
            !pathname.startsWith("/rep/"),
        handler: new NetworkFirst({
            cacheName: PAGES_CACHE_NAME.rsc,
            plugins: [
                new ExpirationPlugin({
                    maxAgeSeconds: 48 * 60 * 60,
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => !sameOrigin && pathname === "/actuator/health",
        method: "GET",
        handler: new NetworkOnly(),
    },
    {
        matcher: ({ sameOrigin }) => !sameOrigin,
        handler: new NetworkFirst({
            cacheName: "cross-origin",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 2000,
                    maxAgeSeconds: 4 * 60 * 60,
                }),
            ],
            networkTimeoutSeconds: 10,
        }),
    },
    ...defaultCache,
]

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    disableDevLogs: true,
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
        plugins: [],
    },
})

serwist.addEventListeners()

self.addEventListener("message", (event) => {
    const { data } = event

    if (data?.type === "CACHE_URLS") {
        event.waitUntil(
            cacheUrls(data.payload.urlsToCache)
                .then((success) => {
                    event.ports[0]?.postMessage(success)
                })
                .catch((error) => {
                    console.error("[SW] 批量缓存失败:", error)
                    event.ports[0]?.postMessage(false)
                }),
        )
        return
    }

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
})

async function cacheUrls(urls: string[]): Promise<boolean> {
    try {
        console.log(`[SW] 开始批量缓存 ${urls.length} 个 URLs`)

        const cachePromises = urls.map(async (url) => {
            try {
                const htmlRequest = new Request(url, {
                    headers: { Accept: "text/html" },
                })
                const rscRequest = new Request(url, {
                    headers: {
                        RSC: "1",
                        Accept: "text/x-component",
                        "Next-Router-State-Tree":
                            "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
                    },
                })

                const [htmlResponse, rscResponse] = await Promise.all([
                    fetch(htmlRequest).catch((e) => {
                        console.warn(`[SW] HTML 请求失败: ${url}`, e)
                        return null
                    }),
                    fetch(rscRequest).catch((e) => {
                        console.warn(`[SW] RSC 请求失败: ${url}`, e)
                        return null
                    }),
                ])

                const reportCache = await caches.open("report-pages-normalized")

                if (htmlResponse && htmlResponse.ok) {
                    const normalizedHtmlKey = await normalizeReportCacheKey({
                        request: htmlRequest,
                    })
                    await reportCache.put(normalizedHtmlKey, htmlResponse.clone())
                    console.log(`[SW] ✓ 缓存 HTML: ${normalizedHtmlKey}`)
                }

                if (rscResponse && rscResponse.ok) {
                    const normalizedRscKey = await normalizeReportCacheKey({
                        request: rscRequest,
                    })
                    await reportCache.put(normalizedRscKey, rscResponse.clone())
                    console.log(`[SW] ✓ 缓存 RSC: ${normalizedRscKey}`)
                }

                return true
            } catch (error) {
                console.error(`[SW] 缓存失败: ${url}`, error)
                return false
            }
        })

        const results = await Promise.all(cachePromises)
        const successCount = results.filter(Boolean).length

        console.log(`[SW] 批量缓存完成: ${successCount}/${urls.length} 成功`)
        return successCount > 0
    } catch (error) {
        console.error("[SW] 批量缓存过程出错:", error)
        return false
    }
}

self.addEventListener("install", (event) => {
    console.log("[SW] Service Worker 安装中...")

    event.waitUntil(
        (async () => {
            await self.skipWaiting()
            console.log("[SW] Service Worker 安装完成")
        })(),
    )
})

self.addEventListener("activate", (event) => {
    console.log("[SW] Service Worker 激活中...")
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys()
            const oldCaches = cacheNames.filter((name) => name.includes("workbox") || name.includes("sw-precache"))

            await Promise.all(
                oldCaches.map((cacheName) => {
                    console.log("[SW] 删除旧缓存:", cacheName)
                    return caches.delete(cacheName)
                }),
            )

            await self.clients.claim()
            console.log("✅ 离线功能: 已激活并控制所有页面")
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

    event.preventDefault()
})

async function clearAuthCache() {
    try {
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
