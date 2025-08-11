const CACHE_NAME = "report-system-v1.3"
const STATIC_CACHE = "static-v1.3"
const DYNAMIC_CACHE = "dynamic-v1.3"

// 需要缓存的静态资源
const STATIC_ASSETS = ["/", "/offline", "/login", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 需要缓存的路由模式
const CACHEABLE_ROUTES = [/^\/rep\/[^/]+\/INDPL_DJ\/1/, /^\/profile/, /^\/user/]

// 检查 Cache API 是否可用
const isCacheAPISupported = () => {
    return typeof caches !== "undefined"
}

// 检查是否为认证相关的请求
const isAuthRequest = (url) => {
    return (
        url.pathname.includes("/login") ||
        url.pathname.includes("/auth") ||
        url.pathname.includes("/api/auth") ||
        url.searchParams.has("callbackUrl")
    )
}

// 检查是否为受保护的页面
const isProtectedPage = (url) => {
    const protectedPaths = ["/rep/", "/profile", "/dashboard", "/settings"]
    return protectedPaths.some((path) => url.pathname.startsWith(path))
}

// 创建离线页面响应
const createOfflinePageResponse = (request) => {
    const url = new URL(request.url)

    // 如果是受保护的页面，返回带有离线提示的页面
    if (isProtectedPage(url)) {
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>离线模式 - 报告系统</title>
                <style>
                    body { 
                        font-family: system-ui, -apple-system, sans-serif; 
                        margin: 0; 
                        padding: 2rem; 
                        background: #f5f5f5; 
                        color: #333;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                    }
                    .container { 
                        background: white; 
                        padding: 2rem; 
                        border-radius: 8px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 500px;
                    }
                    .icon { font-size: 3rem; margin-bottom: 1rem; }
                    h1 { color: #e74c3c; margin-bottom: 1rem; }
                    p { margin-bottom: 1rem; line-height: 1.6; }
                    .actions { margin-top: 2rem; }
                    button, a { 
                        display: inline-block;
                        padding: 0.75rem 1.5rem; 
                        margin: 0.5rem; 
                        background: #3498db; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        border: none;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    button:hover, a:hover { background: #2980b9; }
                    .secondary { background: #95a5a6; }
                    .secondary:hover { background: #7f8c8d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">📱</div>
                    <h1>离线模式</h1>
                    <p>您当前处于离线状态，无法访问此页面的最新内容。</p>
                    <p>您可以：</p>
                    <ul style="text-align: left; margin: 1rem 0;">
                        <li>继续浏览已缓存的内容</li>
                        <li>编辑本地保存的报告</li>
                        <li>等待网络恢复后自动同步</li>
                    </ul>
                    <div class="actions">
                        <a href="/">返回首页</a>
                        <button onclick="window.location.reload()" class="secondary">重试连接</button>
                    </div>
                </div>
                <script>
                    // 监听网络恢复
                    window.addEventListener('online', () => {
                        window.location.reload();
                    });
                    
                    // 定期检查网络状态
                    setInterval(() => {
                        if (navigator.onLine) {
                            fetch('/', { method: 'HEAD', cache: 'no-cache' })
                                .then(() => window.location.reload())
                                .catch(() => {});
                        }
                    }, 30000);
                </script>
            </body>
            </html>
        `,
            {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-cache",
                },
            },
        )
    }

    // 对于其他页面，返回简单的离线提示
    return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>离线 - 报告系统</title>
            <style>
                body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    margin: 0; 
                    padding: 2rem; 
                    text-align: center; 
                    background: #f5f5f5; 
                }
                .container { 
                    background: white; 
                    padding: 2rem; 
                    border-radius: 8px; 
                    display: inline-block;
                    margin-top: 2rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🌐 离线模式</h1>
                <p>当前无网络连接</p>
                <a href="/">返回首页</a>
            </div>
        </body>
        </html>
    `,
        {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        },
    )
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

                        // API 请求失败时返回错误响应，不重定向
                        return new Response(
                            JSON.stringify({
                                error: "API unavailable offline",
                                offline: true,
                            }),
                            {
                                status: 503,
                                headers: { "Content-Type": "application/json" },
                            },
                        )
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
                            const shouldCache = true

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

                        // 页面请求失败时的处理
                        if (request.headers.get("accept")?.includes("text/html")) {
                            // 检查是否为认证请求，如果是则不重定向到登录页
                            if (isAuthRequest(url)) {
                                console.log("Auth request failed offline, returning offline page instead of redirect")
                                return createOfflinePageResponse(request)
                            }

                            // 对于受保护的页面，返回离线页面而不是重定向到登录
                            if (isProtectedPage(url)) {
                                console.log("Protected page failed offline, returning offline page")
                                return createOfflinePageResponse(request)
                            }

                            // 尝试返回缓存的离线页面
                            if (isCacheAPISupported()) {
                                const offlineResponse = await caches.match("/offline")
                                if (offlineResponse) {
                                    return offlineResponse
                                }
                            } else {
                                const offlineResponse = await getFromBackupDB("/offline")
                                if (offlineResponse) {
                                    return offlineResponse
                                }
                            }

                            // 最后返回自定义离线页面
                            return createOfflinePageResponse(request)
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

                // 如果是 HTML 请求，返回离线页面
                if (request.headers.get("accept")?.includes("text/html")) {
                    return createOfflinePageResponse(request)
                }

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
