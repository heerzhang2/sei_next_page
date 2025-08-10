const CACHE_NAME = "report-system-v1"
const STATIC_CACHE_NAME = "report-system-static-v1"
const DYNAMIC_CACHE_NAME = "report-system-dynamic-v1"

// 需要缓存的静态资源
const STATIC_ASSETS = [
    "/",
    "/offline",
    "/login",
    "/manifest.json",
    "/icon-192x192.png",
    "/icon-512x512.png",
    "/_next/static/css/app/layout.css",
    "/_next/static/chunks/webpack.js",
    "/_next/static/chunks/main-app.js",
    "/_next/static/chunks/app/layout.js",
    "/_next/static/chunks/app/page.js",
]

// 需要缓存的路由模式
const CACHEABLE_ROUTES = [
    /^\/rep\/[^/]+\/INDPL_DJ\/1$/,
    /^\/rep\/[^/]+\/INDPL_DJ\/1\/[^/]+$/,
    /^\/profile$/,
    /^\/user$/,
]

// 需要网络优先的API路由
const NETWORK_FIRST_APIS = [/^\/api\/auth\//, /^\/api\/health$/, /^\/api\/refresh-token$/]

// 安装事件 - 缓存静态资源
self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...")

    event.waitUntil(
        caches
            .open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log("Service Worker: Caching static assets")
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => {
                console.log("Service Worker: Static assets cached")
                return self.skipWaiting()
            })
            .catch((error) => {
                console.error("Service Worker: Failed to cache static assets", error)
            }),
    )
})

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...")

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && cacheName !== CACHE_NAME) {
                            console.log("Service Worker: Deleting old cache", cacheName)
                            return caches.delete(cacheName)
                        }
                    }),
                )
            })
            .then(() => {
                console.log("Service Worker: Activated")
                return self.clients.claim()
            }),
    )
})

// 获取事件 - 处理网络请求
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    // 跳过非 GET 请求
    if (request.method !== "GET") {
        return
    }

    // 跳过 Chrome 扩展请求
    if (url.protocol === "chrome-extension:") {
        return
    }

    // API 路由处理
    if (NETWORK_FIRST_APIS.some((pattern) => pattern.test(url.pathname))) {
        event.respondWith(networkFirstStrategy(request))
        return
    }

    // 静态资源处理
    if (
        STATIC_ASSETS.includes(url.pathname) ||
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/static/")
    ) {
        event.respondWith(cacheFirstStrategy(request))
        return
    }

    // 页面路由处理
    if (url.origin === self.location.origin) {
        // 检查是否是可缓存的路由
        const isCacheableRoute = CACHEABLE_ROUTES.some((pattern) => pattern.test(url.pathname))

        if (isCacheableRoute || url.pathname === "/" || url.pathname === "/login") {
            event.respondWith(staleWhileRevalidateStrategy(request))
            return
        }

        // 其他页面路由使用网络优先策略
        event.respondWith(networkFirstWithOfflineFallback(request))
        return
    }

    // 外部资源使用网络优先策略
    event.respondWith(networkFirstStrategy(request))
})

// 缓存优先策略 - 用于静态资源
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.error("Cache first strategy failed:", error)
        return new Response("Network error", { status: 408 })
    }
}

// 网络优先策略 - 用于 API
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log("Network failed, trying cache:", request.url)
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }
        throw error
    }
}

// 过期重新验证策略 - 用于页面
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone())
            }
            return networkResponse
        })
        .catch((error) => {
            console.log("Network failed for:", request.url, error)
            return null
        })

    // 如果有缓存，立即返回缓存，同时在后台更新
    if (cachedResponse) {
        fetchPromise.catch(() => {}) // 忽略后台更新错误
        return cachedResponse
    }

    // 如果没有缓存，等待网络响应
    const networkResponse = await fetchPromise
    if (networkResponse) {
        return networkResponse
    }

    // 网络失败且无缓存，返回离线页面
    return caches.match("/offline")
}

// 网络优先带离线回退策略
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log("Network failed, trying cache for:", request.url)

        // 尝试从缓存获取
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        // 如果是页面请求且无缓存，返回离线页面
        if (request.headers.get("accept")?.includes("text/html")) {
            const offlineResponse = await caches.match("/offline")
            if (offlineResponse) {
                return offlineResponse
            }
        }

        // 最后的回退
        return new Response("Offline - Content not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
        })
    }
}

// 监听消息事件
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        console.log("Service Worker: Received SKIP_WAITING message")
        self.skipWaiting()
    }

    if (event.data && event.data.type === "GET_VERSION") {
        event.ports[0].postMessage({ version: CACHE_NAME })
    }

    if (event.data && event.data.type === "CACHE_URLS") {
        const urls = event.data.urls
        caches
            .open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urls)
            })
            .then(() => {
                event.ports[0].postMessage({ success: true })
            })
            .catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message })
            })
    }
})

// 后台同步事件（如果支持）
self.addEventListener("sync", (event) => {
    console.log("Service Worker: Background sync triggered", event.tag)

    if (event.tag === "background-sync") {
        event.waitUntil(doBackgroundSync())
    }
})

async function doBackgroundSync() {
    console.log("Service Worker: Performing background sync")
    // 这里可以添加后台同步逻辑
    // 比如同步离线时保存的数据
}

// 推送事件处理（如果需要推送通知）
self.addEventListener("push", (event) => {
    console.log("Service Worker: Push event received")

    const options = {
        body: event.data ? event.data.text() : "您有新的消息",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: "explore",
                title: "查看详情",
                icon: "/icon-192x192.png",
            },
            {
                action: "close",
                title: "关闭",
                icon: "/icon-192x192.png",
            },
        ],
    }

    event.waitUntil(self.registration.showNotification("报告系统通知", options))
})

// 通知点击事件
self.addEventListener("notificationclick", (event) => {
    console.log("Service Worker: Notification click received")

    event.notification.close()

    if (event.action === "explore") {
        event.waitUntil(clients.openWindow("/"))
    }
})
