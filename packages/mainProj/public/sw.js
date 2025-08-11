const CACHE_NAME = "report-system-v1.4"
const STATIC_CACHE = "static-v1.4"
const DYNAMIC_CACHE = "dynamic-v1.4"

// 需要缓存的静态资源
const STATIC_ASSETS = ["/", "/offline", "/login", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 需要缓存的路由模式
const CACHEABLE_ROUTES = [/^\/rep\/[^/]+\/INDPL_DJ\/1/, /^\/profile/, /^\/user/]

// 检查 Cache API 是否可用
const isCacheAPISupported = () => {
    return typeof caches !== "undefined"
}

// 标准化 URL - 忽略某些查询参数进行缓存匹配
const normalizeUrlForCache = (url) => {
    const urlObj = new URL(url)

    // 对于报告页面，忽略 from, _rsc 等参数，保留核心路径
    if (urlObj.pathname.includes("/rep/")) {
        // 移除这些不影响页面内容的参数
        const paramsToIgnore = ["from", "_rsc", "timestamp", "cache"]
        paramsToIgnore.forEach((param) => {
            urlObj.searchParams.delete(param)
        })

        // 移除 hash，因为 hash 不会发送到服务器
        urlObj.hash = ""
    }

    return urlObj.toString()
}

// 尝试匹配缓存，使用灵活的匹配策略
const findCachedResponse = async (request) => {
    if (!isCacheAPISupported()) {
        return await getFromBackupDB(request.url)
    }

    const url = new URL(request.url)

    // 首先尝试精确匹配
    let cachedResponse = await caches.match(request)
    if (cachedResponse) {
        return cachedResponse
    }

    // 如果是报告页面，尝试标准化 URL 匹配
    if (url.pathname.includes("/rep/")) {
        const normalizedUrl = normalizeUrlForCache(request.url)
        cachedResponse = await caches.match(normalizedUrl)
        if (cachedResponse) {
            console.log("Found cached response with normalized URL:", normalizedUrl)
            return cachedResponse
        }

        // 尝试匹配相同路径但不同查询参数的缓存
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName)
            const cachedRequests = await cache.keys()

            for (const cachedRequest of cachedRequests) {
                const cachedUrl = new URL(cachedRequest.url)

                // 如果路径相同，忽略查询参数差异
                if (cachedUrl.pathname === url.pathname && cachedUrl.origin === url.origin) {
                    const response = await cache.match(cachedRequest)
                    if (response) {
                        console.log("Found cached response with same path:", cachedRequest.url)
                        return response
                    }
                }
            }
        }
    }

    return null
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
            url: normalizeUrlForCache(url), // 使用标准化的 URL 作为键
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
            // 首先尝试精确匹配
            const exactRequest = store.get(url)
            exactRequest.onsuccess = () => {
                const result = exactRequest.result
                if (result && Date.now() - result.timestamp <= 7 * 24 * 60 * 60 * 1000) {
                    const response = new Response(result.body, {
                        status: result.status,
                        statusText: result.statusText,
                        headers: result.headers,
                    })
                    resolve(response)
                    return
                }

                // 尝试标准化 URL 匹配
                const normalizedUrl = normalizeUrlForCache(url)
                const normalizedRequest = store.get(normalizedUrl)
                normalizedRequest.onsuccess = () => {
                    const normalizedResult = normalizedRequest.result
                    if (normalizedResult && Date.now() - normalizedResult.timestamp <= 7 * 24 * 60 * 60 * 1000) {
                        const response = new Response(normalizedResult.body, {
                            status: normalizedResult.status,
                            statusText: normalizedResult.statusText,
                            headers: normalizedResult.headers,
                        })
                        resolve(response)
                    } else {
                        resolve(null)
                    }
                }
                normalizedRequest.onerror = () => resolve(null)
            }
            exactRequest.onerror = () => resolve(null)
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
                        const cachedResponse = await findCachedResponse(request)
                        if (cachedResponse) {
                            return cachedResponse
                        }

                        // API 请求失败时返回错误响应
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
                    const cachedResponse = await findCachedResponse(request)
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

                // 页面请求策略：优先返回缓存
                const cachedResponse = await findCachedResponse(request)

                const fetchPromise = fetch(request)
                    .then(async (networkResponse) => {
                        if (networkResponse.ok) {
                            // 使用标准化的 URL 进行缓存
                            const cacheKey = normalizeUrlForCache(request.url)
                            const cacheRequest = new Request(cacheKey, {
                                method: request.method,
                                headers: request.headers,
                            })

                            if (isCacheAPISupported()) {
                                const cache = await caches.open(DYNAMIC_CACHE)
                                cache.put(cacheRequest, networkResponse.clone())
                            } else {
                                await saveToBackupDB(cacheKey, networkResponse.clone())
                            }
                        }
                        return networkResponse
                    })
                    .catch(async (error) => {
                        console.log("Page network failed:", request.url, error)

                        // 如果有缓存，返回缓存
                        if (cachedResponse) {
                            console.log("Returning cached response for:", request.url)
                            return cachedResponse
                        }

                        // ���有在完全没有缓存且是 HTML 请求时才返回离线提示
                        if (request.headers.get("accept")?.includes("text/html")) {
                            // 最后的离线页面，只在真正没有任何缓存时显示
                            return new Response(
                                `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>页面不可用 - 报告系统</title>
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
                            max-width: 400px;
                        }
                        .icon { font-size: 2rem; margin-bottom: 1rem; }
                        h1 { color: #e74c3c; margin-bottom: 1rem; font-size: 1.5rem; }
                        p { margin-bottom: 1rem; line-height: 1.6; }
                        .actions { margin-top: 1.5rem; }
                        button, a { 
                            display: inline-block;
                            padding: 0.5rem 1rem; 
                            margin: 0.25rem; 
                            background: #3498db; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 4px; 
                            border: none;
                            cursor: pointer;
                            font-size: 0.9rem;
                        }
                        button:hover, a:hover { background: #2980b9; }
                        .secondary { background: #95a5a6; }
                        .secondary:hover { background: #7f8c8d; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">⚠️</div>
                        <h1>页面暂时不可用</h1>
                        <p>此页面尚未缓存，且当前无网络连接。</p>
                        <div class="actions">
                            <a href="/">返回首页</a>
                            <button onclick="history.back()" class="secondary">返回上页</button>
                            <button onclick="window.location.reload()" class="secondary">重试</button>
                        </div>
                    </div>
                    <script>
                        // 监听网络恢复
                        window.addEventListener('online', () => {
                            window.location.reload();
                        });
                    </script>
                </body>
                </html>
                `,
                                {
                                    status: 503,
                                    headers: {
                                        "Content-Type": "text/html; charset=utf-8",
                                        "Cache-Control": "no-cache",
                                    },
                                },
                            )
                        }

                        throw error
                    })

                // 如果有缓存，立即返回缓存，同时在后台更新
                if (cachedResponse) {
                    console.log("Serving from cache:", request.url)
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
