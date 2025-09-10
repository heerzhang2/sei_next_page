import {
    ExpirationPlugin,
    NetworkFirst, NetworkOnly,
    type PrecacheEntry,
    type RuntimeCaching,
    type SerwistGlobalConfig,
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
        const hasAction=(pathParts.length>=5 && pathParts[5]!=="")       //若有编辑器的子路由
        if(hasAction){
            // 重构路径：/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
            const normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`
            // 移除 subrid 查询参数 subrid from utm_idx #这些参数还需要在整个路由之内做协调统一的。
            const searchParams = new URLSearchParams(url.search)
            searchParams.delete("subrid")
            searchParams.delete("redId")

            searchParams.delete("from")
            searchParams.delete("original")
            searchParams.delete("unitIndex")

            const isRSC = request.headers.get("RSC") === "1"
            const suffix = isRSC ? "#rsc" : "#html"
            // 构建标准化的缓存键
            const normalizedUrl = `${url.origin}${normalizedPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}${suffix}`
            return normalizedUrl
        }
        else{
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

//【来源】代码实际上拷贝来自{ defaultCache } from "@serwist/next/worker"，然后自己再修改！
const PAGES_CACHE_NAME = {
    rscPrefetch: "pages-rsc-prefetch",
    rsc: "pages-rsc",
    html: "pages",
} as const
const customCache: RuntimeCaching[] = [
    {
        matcher: ({ url: { pathname }, sameOrigin }) =>
            sameOrigin && pathname.startsWith("/rep/"),
        handler: new NetworkFirst({
            cacheName: "report-pages-normalized",
            plugins: [
                createCacheKeyPlugin(normalizeReportCacheKey), // Apply normalization plugin
                new ExpirationPlugin({
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
        matcher: ({ url: { pathname }, sameOrigin }) => !sameOrigin && pathname==="/actuator/health",
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

serwist.addEventListeners()


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
