const CACHE_NAME = "report-system-v1.2"
const STATIC_CACHE = "static-v1.2"
const DYNAMIC_CACHE = "dynamic-v1.2"

// 需要缓存的静态资源
const STATIC_ASSETS = ["/", "/offline", "/login", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 需要缓存的路由模式
const CACHEABLE_ROUTES = [/^\/rep\/[^/]+\/INDPL_DJ\/1/, /^\/profile/, /^\/user/]

// 检查 Cache API 是否可用
const isCacheAPISupported = () => {
    return typeof caches !== "undefined"
}

// 备用存储方案（使用 IndexedDB）
const openBackupDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ServiceWorkerBackup", 1)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains("responses")) {
                db.createObjectStore("responses", { keyPath: "url" })
            }
        }
    })
}

const saveToBackupDB = async (url, response) => {
    try {
        const db = await openBackupDB()
        const transaction = db.transaction(["responses"], "readwrite")
        const store = transaction.objectStore("responses")

        const responseData = {
            url: url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text(),
            timestamp: Date.now(),
        }

        store.put(responseData)
    } catch (error) {
        console.error("Backup DB save failed:", error)
    }
}

const getFromBackupDB = async (url) => {
    try {
        const db = await openBackupDB()
        const transaction = db.transaction(["responses"], "readonly")
        const store = transaction.objectStore("responses")

        return new Promise((resolve, reject) => {
            const request = store.get(url)
            request.onsuccess = () => {
                const result = request.result
                if (result) {
                    // 检查数据是否过期（7天）
                    const isExpired = Date.now() - result.timestamp > 7 * 24 * 60 * 60 * 1000
                    if (!isExpired) {
                        const response = new Response(result.body, {
                            status: result.status,
                            statusText: result.statusText,
                            headers: result.headers,
                        })
                        resolve(response)
                    } else {
                        resolve(null)
                    }
                } else {
                    resolve(null)
                }
            }
            request.onerror = () => reject(request.error)
        })
    } catch (error) {
        console.error("Backup DB get failed:", error)
        return null
    }
}

// 安装事件
self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...")

    event.waitUntil(
        (async () => {
            try {
                if (isCacheAPISupported()) {
                    const cache = await caches.open(STATIC_CACHE)
                    console.log("Service Worker: Caching static assets with Cache API")
                    await cache.addAll(STATIC_ASSETS)
                } else {
                    console.log("Service Worker: Cache API not supported, using backup storage")
                    // 使用备用存储方案预缓存关键资源
                    for (const asset of STATIC_ASSETS) {
                        try {
                            const response = await fetch(asset)
                            if (response.ok) {
                                await saveToBackupDB(asset, response.clone())
                            }
                        } catch (error) {
                            console.error(`Failed to backup ${asset}:`, error)
                        }
                    }
                }

                console.log("Service Worker: Installation complete")
                return self.skipWaiting()
            } catch (error) {
                console.error("Service Worker: Installation failed:", error)
            }
        })(),
    )
})

// 激活事件
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...")

    event.waitUntil(
        (async () => {
            try {
                if (isCacheAPISupported()) {
                    const cacheNames = await caches.keys()
                    await Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                                console.log("Service Worker: Deleting old cache:", cacheName)
                                return caches.delete(cacheName)
                            }
                        }),
                    )
                }

                console.log("Service Worker: Claiming clients")
                return self.clients.claim()
            } catch (error) {
                console.error("Service Worker: Activation failed:", error)
            }
        })(),
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

    event.respondWith(
        (async () => {
            try {
                // API 请求策略
                if (url.pathname.startsWith("/api/")) {
                    try {
                        const networkResponse = await fetch(request)

                        // 缓存成功的非认证 API 响应
                        if (networkResponse.ok && !url.pathname.includes("/auth/")) {
                            if (isCacheAPISupported()) {
                                const cache = await caches.open(DYNAMIC_CACHE)
                                cache.put(request, networkResponse.clone())
                            } else {
                                await saveToBackupDB(request.url, networkResponse.clone())
                            }
                        }

                        return networkResponse
                    } catch (networkError) {
                        console.log("API network failed, trying cache:", request.url)

                        // 尝试从缓存获取
                        let cachedResponse = null
                        if (isCacheAPISupported()) {
                            cachedResponse = await caches.match(request)
                        } else {
                            cachedResponse = await getFromBackupDB(request.url)
                        }

                        if (cachedResponse) {
                            return cachedResponse
                        }

                        // 返回离线页面
                        if (isCacheAPISupported()) {
                            return (await caches.match("/offline")) || new Response("Offline", { status: 503 })
                        } else {
                            const offlineResponse = await getFromBackupDB("/offline")
                            return offlineResponse || new Response("Offline", { status: 503 })
                        }
                    }
                }

                // 静态资源策略
                if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
                    let cachedResponse = null

                    if (isCacheAPISupported()) {
                        cachedResponse = await caches.match(request)
                    } else {
                        cachedResponse = await getFromBackupDB(request.url)
                    }

                    if (cachedResponse) {
                        return cachedResponse
                    }

                    try {
                        const networkResponse = await fetch(request)
                        if (networkResponse.ok) {
                            if (isCacheAPISupported()) {
                                const cache = await caches.open(STATIC_CACHE)
                                cache.put(request, networkResponse.clone())
                            } else {
                                await saveToBackupDB(request.url, networkResponse.clone())
                            }
                        }
                        return networkResponse
                    } catch (error) {
                        return new Response("Resource not available offline", { status: 503 })
                    }
                }

                // 页面请求策略：过期重新验证
                let cachedResponse = null
                if (isCacheAPISupported()) {
                    cachedResponse = await caches.match(request)
                } else {
                    cachedResponse = await getFromBackupDB(request.url)
                }

                const fetchPromise = fetch(request)
                    .then(async (networkResponse) => {
                        if (networkResponse.ok) {
                            const shouldCache =
                                CACHEABLE_ROUTES.some((pattern) => pattern.test(url.pathname)) || STATIC_ASSETS.includes(url.pathname)

                            if (shouldCache) {
                                if (isCacheAPISupported()) {
                                    const cache = await caches.open(DYNAMIC_CACHE)
                                    cache.put(request, networkResponse.clone())
                                } else {
                                    await saveToBackupDB(request.url, networkResponse.clone())
                                }
                            }
                        }
                        return networkResponse
                    })
                    .catch(async (error) => {
                        console.log("Page network failed:", request.url, error)

                        if (cachedResponse) {
                            return cachedResponse
                        }

                        // 返回离线页面
                        if (request.headers.get("accept")?.includes("text/html")) {
                            if (isCacheAPISupported()) {
                                return (await caches.match("/offline")) || new Response("Offline", { status: 503 })
                            } else {
                                const offlineResponse = await getFromBackupDB("/offline")
                                return offlineResponse || new Response("Offline", { status: 503 })
                            }
                        }

                        throw error
                    })

                // 如果有缓存，立即返回缓存，同时在后台更新
                if (cachedResponse) {
                    fetchPromise.catch(() => {}) // 忽略后台更新的错误
                    return cachedResponse
                }

                // 如果没有缓存，等待网络请求
                return await fetchPromise
            } catch (error) {
                console.error("Service Worker fetch error:", error)
                return new Response("Service Worker Error", { status: 500 })
            }
        })(),
    )
})

// 消息事件处理
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting()
    }

    if (event.data && event.data.type === "GET_CACHE_STATUS") {
        event.ports[0].postMessage({
            cacheAPISupported: isCacheAPISupported(),
            indexedDBSupported: typeof indexedDB !== "undefined",
        })
    }
})

// 后台同步
self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
        console.log("Service Worker: Background sync triggered")
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
