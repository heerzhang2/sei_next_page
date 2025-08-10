const CACHE_NAME = "report-system-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// 需要缓存的静态资源
const STATIC_ASSETS = ["/", "/offline", "/login", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 需要缓存的路由模式
const CACHEABLE_ROUTES = [/^\/rep\/[^/]+\/INDPL_DJ\/1/, /^\/profile/, /^\/user/]

// 安装事件
self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...")

    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => {
                console.log("Service Worker: Caching static assets")
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => {
                console.log("Service Worker: Skip waiting")
                return self.skipWaiting()
            }),
    )
})

// 激活事件
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...")

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log("Service Worker: Deleting old cache:", cacheName)
                            return caches.delete(cacheName)
                        }
                    }),
                )
            })
            .then(() => {
                console.log("Service Worker: Claiming clients")
                return self.clients.claim()
            }),
    )
})

// 获取事件
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

    // API 请求策略：网络优先，失败时返回离线页面
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 如果是认证相关的 API，不缓存
                    if (url.pathname.includes("/auth/")) {
                        return response
                    }

                    // 缓存成功的 API 响应
                    if (response.ok) {
                        const responseClone = response.clone()
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone)
                        })
                    }

                    return response
                })
                .catch(() => {
                    // API 请求失败，尝试从缓存获取
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse
                        }

                        // 如果没有缓存，返回离线页面
                        return caches.match("/offline")
                    })
                }),
        )
        return
    }

    // 静态资源策略：缓存优先
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }

                return fetch(request).then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone()
                        caches.open(STATIC_CACHE).then((cache) => {
                            cache.put(request, responseClone)
                        })
                    }
                    return response
                })
            }),
        )
        return
    }

    // 页面请求策略：过期重新验证
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone()

                        // 检查是否是可缓存的路由
                        const shouldCache =
                            CACHEABLE_ROUTES.some((pattern) => pattern.test(url.pathname)) || STATIC_ASSETS.includes(url.pathname)

                        if (shouldCache) {
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(request, responseClone)
                            })
                        }
                    }
                    return response
                })
                .catch(() => {
                    // 网络请求失败，返回缓存或离线页面
                    if (cachedResponse) {
                        return cachedResponse
                    }

                    // 如果是页面请求且没有缓存，返回离线页面
                    if (request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("/offline")
                    }

                    throw new Error("Network failed and no cache available")
                })

            // 如果有缓存，立即返回缓存，同时在后台更新
            if (cachedResponse) {
                fetchPromise.catch(() => {}) // 忽略后台更新的错误
                return cachedResponse
            }

            // 如果没有缓存，等待网络请求
            return fetchPromise
        }),
    )
})

// 消息事件处理
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting()
    }
})

// 后台同步
self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
        console.log("Service Worker: Background sync triggered")
        // 这里可以添加后台同步逻辑
    }
})

// 推送通知
self.addEventListener("push", (event) => {
    if (event.data) {
        const data = event.data.json()

        const options = {
            body: data.body,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey,
            },
        }

        event.waitUntil(self.registration.showNotification(data.title, options))
    }
})

// 通知点击事件
self.addEventListener("notificationclick", (event) => {
    event.notification.close()

    event.waitUntil(clients.openWindow("/"))
})
