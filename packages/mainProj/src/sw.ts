import {
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
            console.warn(`KeyPlugin导航请求不应返回 RSC 响应: ${request.url}`)
            return null
        }

        if (isRSCRequest && !isRSCResponse) {
            console.warn(`KeyPlugin请求不应返回 HTML 响应: ${request.url}`)
            return null
        }

        console.log(`KeyPlugin✓返回匹配的缓存响应: ${request.url}, RSC=${isRSCResponse}`)
        return cachedResponse
    },
})

// 创建自定义的错误处理插件
const errorHandlingPlugin = {
    handlerDidError: async ({ request, error }: { request: Request; error: Error }) => {
        return createErrorPageResponse({
            errorType: 'CHUNK_LOAD_ERROR',
            originalUrl: request.url,
            errorMessage: error.message
        });
        //return null;  显示无法访问网址
    }
};

//报告路由约定使用的：这个并非preloadCache，没有参数自动过滤
const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    console.log("normalizeReportCacheKey", url)
    // 提取路径部分，移除动态的 repid
    const pathParts = url.pathname.split("/")
    if (pathParts[1] === "rep" && pathParts.length >= 4) {
        const hasAction = pathParts.length >= 5 && pathParts[5] !== "" //若有编辑器的子路由
        if (hasAction) {
            // 重构路径：/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
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
            searchParams.set("_v", isRSC ? "rsc" : "html")

            // 构建标准化的缓存键
            const normalizedUrl = `${url.origin}${normalizedPath}?${searchParams.toString()}`
            return normalizedUrl
        } else {
            const normalizedPath = `/rep/*/${pathParts[3]}/${pathParts[4]}`
            // 移除 ?print=1 查询参数
            const searchParams = new URLSearchParams(url.search)
            searchParams.delete("original")

            const isRSC = request.headers.get("RSC") === "1"
            searchParams.set("_v", isRSC ? "rsc" : "html")

            // 构建标准化的缓存键
            const normalizedUrl = `${url.origin}${normalizedPath}?${searchParams.toString()}`
            return normalizedUrl
        }
    }
    return request.url
}

//实际上内容最多的页面缓存在next.config.ts里面的additionalPrecacheEntries定义，并存储在Cache: serwist-precache-v2-https底下的。
const customCache: RuntimeCaching[] = [
    {
        matcher: ({ url: { pathname }, sameOrigin }) =>
            sameOrigin &&
            (pathname.startsWith("/_next/static/chunks/") ||
                pathname.startsWith("/_next/static/css/") ||
                pathname.includes("webpack-")),
        handler: new NetworkFirst({
            cacheName: "next-chunks", //静态资源,DEV模式用?
            networkTimeoutSeconds: 2,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 2000,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    // 字体文件使用 CacheFirst 策略，优先从缓存读取
    {
        matcher: ({ url: { pathname }, sameOrigin }) =>
            sameOrigin && pathname.match(/\/_next\/static\/media\/.*\.woff2?$/),
        handler: new NetworkFirst({
            cacheName: "fonts",
            networkTimeoutSeconds: 3,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 500,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存一年
                    maxAgeFrom: "last-used",
                }),
            ],
        }),
    },
    {
        matcher: ({ url: { pathname }, sameOrigin }) => sameOrigin && pathname.startsWith("/rep/"),
        handler: new NetworkFirst({
            cacheName: "report-pages-normalized",
            networkTimeoutSeconds: 3,
            plugins: [
                createCacheKeyPlugin(normalizeReportCacheKey),
                new ExpirationPlugin({
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30天缓存
                    maxAgeFrom: "last-used",
                }),
                errorHandlingPlugin,    //避免未加载完成页面没动静
            ],
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

// 创建错误页面响应
function createErrorPageResponse(options: {
    errorType: string;
    originalUrl: string;
    errorMessage: string;
}): Response {
    const errorPageHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>应用程序加载失败</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 2rem; 
            background: #f5f5f5; 
            color: #333;
            line-height: 1.6;
        }
        .error-container { 
            max-width: 500px; 
            margin: 4rem auto; 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .error-icon { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
        }
        h1 { 
            color: #e74c3c; 
            margin-bottom: 1rem; 
        }
        .button { 
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 0.5rem; 
            font-size: 1rem;
        }
        .button:hover { 
            background: #2980b9; 
        }
        .error-details {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            text-align: left;
            font-size: 0.9rem;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>应用程序加载失败</h1>
        <p>抱歉，应用程序所需的资源未能正确加载。这可能是由于网络问题或版本升级但缓存未更新导致的。</p>
        <div class="error-details">
            <strong>错误类型:</strong> ${options.errorType}<br>
            <strong>请求资源:</strong> ${new URL(options.originalUrl).pathname}<br>
            <strong>建议操作:</strong> 请尝试刷新页面或清除浏览器缓存
        </div>
        <div>
            <button class="button" onclick="window.location.reload()">🔄 刷新页面</button>
            <button class="button" onclick="window.location.href='/'">🏠 返回首页</button>
        </div>
        <p style="margin-top: 2rem; font-size: 0.9rem; color: #999;">
            如果问题持续存在，请联系技术支持
        </p>
    </div>
    <script>
        window.addEventListener('online', () => {
            window.location.reload();
        });
    </script>
</body>
</html>`;
    return new Response(errorPageHtml, {
        status: 200,
        statusText: 'OK',
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}

serwist.addEventListeners()

self.addEventListener("message", (event) => {
    const { data } = event
    //针对CACHE_URLS实际上serwist默认能处理的，但是这里改成自定义代码处理。
    if (data?.type === "CACHE_URLS") {
        event.waitUntil(
            cacheUrls(data.payload.urlsToCache)
                .then((success) => {
                    event.ports[0]?.postMessage(success)
                })
                .catch((error) => {
                    console.error("[SW]cacheUrls 批量缓存失败:", error)
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
        console.log(`[SW]cacheUrls 开始批量缓存 ${urls.length} 个 URLs`)
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
                //每个url都有两种请求：
                const [htmlResponse, rscResponse] = await Promise.all([
                    fetch(htmlRequest).catch((e) => {
                        console.warn(`[SW]cacheUrls HTML 请求失败: ${url}`, e)
                        return null
                    }),
                    fetch(rscRequest).catch((e) => {
                        console.warn(`[SW]cacheUrls RSC 请求失败: ${url}`, e)
                        return null
                    }),
                ])

                const reportCache = await caches.open("report-pages-normalized")

                let htmlCached = false
                let rscCached = false

                if (htmlResponse && htmlResponse.ok) {
                    const normalizedHtmlKey = await normalizeReportCacheKey({
                        request: htmlRequest,
                    })
                    await reportCache.put(normalizedHtmlKey, htmlResponse.clone())
                    htmlCached = true
                    console.log(`[SW]cacheUrls ✓缓存 HTML: ${normalizedHtmlKey}`)
                }

                if (rscResponse && rscResponse.ok) {
                    const normalizedRscKey = await normalizeReportCacheKey({
                        request: rscRequest,
                    })
                    await reportCache.put(normalizedRscKey, rscResponse.clone())
                    rscCached = true
                    console.log(`[SW]cacheUrls ✓缓存 RSC: ${normalizedRscKey}`)
                }

                if (htmlCached && rscCached) {
                    console.log(`[SW]cacheUrls ✓ 完整缓存: ${url} (HTML + RSC)`)
                } else if (htmlCached || rscCached) {
                    console.warn(`[SW]cacheUrls ⚠️ 部分缓存: ${url} (HTML=${htmlCached}, RSC=${rscCached})`)
                } else {
                    console.error(`[SW]cacheUrls ✗ 缓存失败: ${url}`)
                }

                return htmlCached && rscCached
            } catch (error) {
                console.error(`[SW]cacheUrls 缓存失败: ${url}`, error)
                return false
            }
        })

        const results = await Promise.all(cachePromises)
        const successCount = results.filter(Boolean).length

        console.log(`[SW]cacheUrls 批量缓存完成: ${successCount}/${urls.length} 成功`)
        return successCount > 0
    } catch (error) {
        console.error("[SW]cacheUrls 批量缓存过程出错:", error)
        return false
    }
}

const APP_VERSION = "1.0" // 构建时替换

self.addEventListener("install", (event) => {
    console.log(`[SW] Service Worker 安装中... 版本: ${APP_VERSION}`)

    event.waitUntil(
        (async () => {
            await self.skipWaiting()
            console.log("[SW] Service Worker 安装完成")
        })(),
    )
})

self.addEventListener("activate", (event) => {
    console.log(`[SW] Service Worker 激活中... 版本: ${APP_VERSION}`)
    event.waitUntil(
        (async () => {
            await self.clients.claim()
            const clients = await self.clients.matchAll({ type: "window" })
            clients.forEach((client) => {
                client.postMessage({
                    type: "SW_UPDATED",
                    version: APP_VERSION,
                })
            })
            console.log("✅ 离线功能: 已激活并控制所有页面")
        })(),
    )
})

self.addEventListener("error", (event) => {
    console.error("[SW] Service Worker 错误:", event.error)
    notifyClientsOfError(event.error?.message || "未知的 Service Worker 错误", "SW_ERROR")
})

self.addEventListener("unhandledrejection", (event) => {
    console.error("[SW] 未处理的拒绝:", event.reason)
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
