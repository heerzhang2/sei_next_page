/*
  自定义 Service Worker
  - 静态资源：cache-first
  - 导航：network-first + 离线回退
  - GraphQL：network-first，失败时返回 { extensions.offline: true }，交由 URQL graphcache 兜底
  - 安装时预缓存 rep 入口（动态 ID 无法预缓存）
*/
const STATIC_CACHE = "report-static-v2"
const DYNAMIC_CACHE = "report-dynamic-v2"

const STATIC_ASSETS = ["/", "/offline", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 安装时对 rep 目录的入口做预缓存（可按需扩展/修改）
const PRECACHE_REP_URLS = [
    "/rep", // 入口或列表页（如存在）
    // 你可以将常用的子路由加入预缓存，例如：
    // "/rep/guide", "/rep/intro"
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(STATIC_CACHE)
            await cache.addAll([...STATIC_ASSETS, ...PRECACHE_REP_URLS])
            await self.skipWaiting()
        })()
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys()
            await Promise.all(
                keys.map((k) => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE].includes(k)) return caches.delete(k)
                })
            )
            await self.clients.claim()
        })()
    )
})

self.addEventListener("fetch", (event) => {
    const req = event.request
    const url = new URL(req.url)

    // 仅处理同源
    if (url.origin !== self.location.origin) return

    // 非 GET 直连网络
    if (req.method !== "GET") {
        event.respondWith(
            fetch(req).catch(
                () =>
                    new Response(JSON.stringify({ error: "offline", offline: true }), {
                        status: 503,
                        headers: { "Content-Type": "application/json" },
                    })
            )
        )
        return
    }

    // 静态资源 cache-first
    if (isStatic(url)) {
        event.respondWith(cacheFirst(req))
        return
    }

    // GraphQL：network-first，失败时标记 offline
    if (isGraphQL(req)) {
        event.respondWith(networkFirstGraphQL(req))
        return
    }

    // 导航：network-first + offline fallback
    if (isNavigation(req)) {
        event.respondWith(networkFirstPage(req))
        return
    }

    // 其他 GET：SWR
    event.respondWith(staleWhileRevalidate(req))
})

function isStatic(url) {
    return (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/static/") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".jpg") ||
        url.pathname.endsWith(".jpeg") ||
        url.pathname.endsWith(".gif") ||
        url.pathname.endsWith(".svg") ||
        url.pathname === "/manifest.json" ||
        url.pathname === "/icon-192x192.png" ||
        url.pathname === "/icon-512x512.png"
    )
}

function isGraphQL(request) {
    const u = new URL(request.url)
    if (u.pathname.endsWith("/graphql")) return true
    const ct = request.headers.get("content-type") || ""
    return ct.includes("application/json") && u.pathname.includes("graphql")
}

function isNavigation(request) {
    return (
        request.mode === "navigate" ||
        (request.method === "GET" && (request.headers.get("accept") || "").includes("text/html"))
    )
}

async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached
    const res = await fetch(request)
    if (res && res.ok) {
        const cache = await caches.open(STATIC_CACHE)
        cache.put(request, res.clone())
    }
    return res
}

async function networkFirstPage(request) {
    try {
        const res = await fetch(request)
        if (res && res.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, res.clone())
        }
        return res
    } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        return (await caches.match("/offline")) || new Response("offline", { status: 200 })
    }
}

async function networkFirstGraphQL(request) {
    try {
        return await fetch(request)
    } catch {
        return new Response(
            JSON.stringify({
                data: null,
                errors: [{ message: "offline", extensions: { offline: true, code: "NETWORK_ERROR" } }],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        )
    }
}

async function staleWhileRevalidate(request) {
    const cached = await caches.match(request)
    const fetchPromise = fetch(request)
        .then(async (res) => {
            if (res && res.ok) {
                const cache = await caches.open(DYNAMIC_CACHE)
                cache.put(request, res.clone())
            }
            return res
        })
        .catch(() => undefined)
    return cached || fetchPromise || new Response("offline", { status: 503 })
}

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting()
    }
})
