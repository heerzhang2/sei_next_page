/*
  Custom Service Worker for PWA shell + GraphQL coordination
  - Static assets: cache-first
  - Navigation: network-first + offline fallback
  - GraphQL: network-first; on failure return { extensions.offline: true } for urql graphcache
  - Install-time precache of rep entry routes
*/
const STATIC_CACHE = "report-static-v3"
const DYNAMIC_CACHE = "report-dynamic-v3"

const STATIC_ASSETS = [
    "/",
    "/offline",
    "/manifest.json",
    "/icon-192x192.png",
    "/icon-512x512.png",
]

// Install-time precache for rep entry.
// Dynamic IDs can't be enumerated; rely on runtime caching for deep routes.
const PRECACHE_REP_URLS = ["/rep"]

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
    if (url.origin !== self.location.origin) return

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

    if (isStatic(url)) {
        event.respondWith(cacheFirst(req))
        return
    }

    if (isGraphQL(req)) {
        event.respondWith(networkFirstGraphQL(req))
        return
    }

    if (isNavigation(req)) {
        event.respondWith(networkFirstPage(req))
        return
    }

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
    return request.mode === "navigate" || (request.method === "GET" && (request.headers.get("accept") || "").includes("text/html"))
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
