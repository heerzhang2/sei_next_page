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
//不要删除！来自参考 ./node_modules/@serwist/next/src/index.worker.ts 生产版本有生效的？
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker"

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

//报告路由约定使用的:这个并非preloadCache,没有参数自动过滤
const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    console.log("normalizeReportCacheKey", url)
    // 提取路径部分,移除动态的 repid
    const pathParts = url.pathname.split("/")
    if (pathParts[1] === "rep" && pathParts.length >= 4) {
        const hasAction = pathParts.length >= 5 && pathParts[5] !== "" //若有编辑器的子路由
        if (hasAction) {
            // 重构路径:/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
            const normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`
            // 移除 subrid 查询参数 subrid from utm_idx #这些参数还需要在整个路由之内做协调统一的。
            const searchParams = new URLSearchParams(url.search)
            searchParams.delete("subrid")
            searchParams.delete("redId")

            searchParams.delete("from")
            searchParams.delete("original")
            searchParams.delete("unitIndex")
            //控制器情况
            searchParams.delete("modelkey")

            const isRSC = request.headers.get("RSC") === "1"
            const suffix = isRSC ? "#rsc" : "#html"
            // 构建标准化的缓存键
            const normalizedUrl = `${url.origin}${normalizedPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}${suffix}`
            return normalizedUrl
        } else {
            const normalizedPath = `/rep/*/${pathParts[3]}/${pathParts[4]}`
            // 移除 ?print=1 查询参数
            const searchParams = new URLSearchParams(url.search)
            searchParams.delete("original")
            const isRSC = request.headers.get("RSC") === "1"
            const suffix = isRSC ? "#rsc" : "#html"
            // 构建标准化的缓存键
            const normalizedUrl = `${url.origin}${normalizedPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}${suffix}`
            return normalizedUrl
        }
    }
    return request.url
}

const createResponseValidationPlugin = () => ({
    cachedResponseWillBeUsed: async ({
                                         cachedResponse,
                                         request,
                                     }: { cachedResponse: Response | undefined; request: Request }) => {
        if (!cachedResponse) return null

        // 检查是否是导航请求(浏览器地址栏访问)
        const isNavigationRequest = request.mode === "navigate" || request.destination === "document"

        // 检查缓存响应的内容类型
        const contentType = cachedResponse.headers.get("content-type") || ""
        const isRSCResponse = contentType.includes("text/x-component")
        const isHTMLResponse = contentType.includes("text/html")

        // 如果是导航请求但缓存的是 RSC 响应,返回 null 强制重新获取
        if (isNavigationRequest && isRSCResponse) {
            console.warn("[SW] 检测到导航请求但缓存的是 RSC 响应,拒绝使用缓存")
            return null
        }

        // 如果是 RSC 请求但缓存的是 HTML 响应,返回 null
        const isRSCRequest = request.headers.get("RSC") === "1"
        if (isRSCRequest && isHTMLResponse) {
            console.warn("[SW] 检测到 RSC 请求但缓存的是 HTML 响应,拒绝使用缓存")
            return null
        }

        return cachedResponse
    },
})

//【来源】代码实际上拷贝来自{ defaultCache } from "@serwist/next/worker",然后自己再修改!
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
                    maxEntries: 2000, // 从 500 增加到 2000,允许缓存更多版本的 chunks
                    maxAgeSeconds: 90 * 24 * 60 * 60, // 从 30 天增加到 90 天
                    maxAgeFrom: "last-used", // 基于最后使用时间,而不是缓存时间
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => sameOrigin && pathname.startsWith("/rep/"),
        handler: new NetworkFirst({
            cacheName: "report-pages-normalized",
            plugins: [
                createCacheKeyPlugin(normalizeReportCacheKey), // Apply normalization plugin
                createResponseValidationPlugin(), // 添加响应验证
                new ExpirationPlugin({
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 从 7 天增加到 30 天
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
                    maxAgeSeconds: 48 * 60 * 60, // 48 hours
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
                    // maxEntries: 2,
                    maxAgeSeconds: 48 * 60 * 60, // 48 hours
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => !sameOrigin && pathname === "/actuator/health",
        method: "GET",
        handler: new NetworkOnly(),
    },
    //这个和graphQL请求没有关系的;
    {
        matcher: ({ sameOrigin }) => !sameOrigin,
        handler: new NetworkFirst({
            cacheName: "cross-origin",
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 2000,
                    maxAgeSeconds: 4 * 60 * 60, //4 hour
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
        // ignoreURLParametersMatching,
        plugins: [],
    },
})

serwist.addEventListeners()

// 监听来自主页面的消息
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
                // 为每个 URL 缓存 HTML 和 RSC 两个版本
                const htmlRequest = new Request(url, {
                    headers: { Accept: "text/html" },
                })
                const rscRequest = new Request(url, {
                    headers: { RSC: "1", Accept: "text/x-component" },
                })

                // 并行获取两个版本
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

                // 缓存成功的响应
                const reportCache = await caches.open("report-pages-normalized")

                if (htmlResponse && htmlResponse.ok) {
                    const contentType = htmlResponse.headers.get("content-type") || ""
                    if (!contentType.includes("text/html")) {
                        console.warn(`[SW] HTML 请求返回了非 HTML 响应: ${url}, Content-Type: ${contentType}`)
                    }

                    // 使用标准化的缓存键
                    const normalizedHtmlKey = await normalizeReportCacheKey({
                        request: htmlRequest,
                    })
                    await reportCache.put(normalizedHtmlKey, htmlResponse.clone())
                    console.log(`[SW] ✓ 缓存 HTML: ${url} -> ${normalizedHtmlKey}`)
                }

                if (rscResponse && rscResponse.ok) {
                    const contentType = rscResponse.headers.get("content-type") || ""
                    if (!contentType.includes("text/x-component")) {
                        console.warn(`[SW] RSC 请求返回了非 RSC 响应: ${url}, Content-Type: ${contentType}`)
                    }

                    const normalizedRscKey = await normalizeReportCacheKey({
                        request: rscRequest,
                    })
                    await reportCache.put(normalizedRscKey, rscResponse.clone())
                    console.log(`[SW] ✓ 缓存 RSC: ${url} -> ${normalizedRscKey}`)
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
            // 强制等待，确保新 SW 完全安装后再激活
            await self.skipWaiting()

            // 预缓存关键的静态资源
            try {
                const cache = await caches.open("next-chunks")
                // 这里可以添加关键的 chunk 文件，但由于文件名是动态的，
                // 主要依赖运行时缓存策略
                console.log("[SW] 关键资源预缓存完成")
            } catch (error) {
                console.warn("[SW] 预缓存关键资源失败:", error)
            }

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
                    (name.includes("workbox") || name.includes("sw-precache")) &&
                    !name.includes("next-chunks") && // 保留 chunks 缓存
                    !name.includes("report-pages"), // 保留报告页面缓存
            )

            await Promise.all(
                oldCaches.map((cacheName) => {
                    console.log("[SW] 删除旧缓存:", cacheName)
                    return caches.delete(cacheName)
                }),
            )

            const allCaches = await caches.keys()
            for (const cacheName of allCaches) {
                const cache = await caches.open(cacheName)
                const keys = await cache.keys()
                console.log(`[SW] 缓存 "${cacheName}" 包含 ${keys.length} 个条目`)
            }

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
    if (error && error.name === "no-response") {
        const url = error.details?.url || "未知URL"
        console.warn(`[SW] 资源未缓存且网络不可用: ${url}`)

        // 提取文件名以提供更有用的错误信息
        const fileName = url.split("/").pop() || url
        notifyClientsOfError(
            `离线模式下缺少必要资源: ${fileName}。\n\n建议：\n1. 在线时访问 /pwa 页面\n2. 点击"重新预缓存"按钮\n3. 等待缓存完成后再离线使用`,
            "CACHE_MISS",
        )
    } else if (
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
