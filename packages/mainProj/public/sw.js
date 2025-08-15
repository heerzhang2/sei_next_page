const CACHE_NAME = "report-system-v1.5"
const STATIC_CACHE = "static-v1.5"
const DYNAMIC_CACHE = "dynamic-v1.5"
const PRIORITY_CACHE = "priority-v1.5" // 新增优先级缓存

let isDevelopmentMode = false

const CACHE_CONFIG = {
    maxEntries: 200, // 增加最大缓存条目数
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
    priorityMaxEntries: 50, // 优先级缓存最大条目数
}

// 从主线程接收环境信息
const isDevelopment = () => {
    return isDevelopmentMode
}

// 初始化时的简单检测作为后备
const fallbackIsDevelopment = () => {
    return self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1"
}

// 初始化环境模式
isDevelopmentMode = fallbackIsDevelopment()

// 需要缓存的静态资源
const STATIC_ASSETS = ["/", "/offline", "/login", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// 需要缓存的路由模式 - 扩展支持所有报告路径
const CACHEABLE_ROUTES = [
    /^\/rep\//, // 缓存所有 /rep/ 开头的路径
    /^\/profile/,
    /^\/user/,
    /^\/dashboard/,
    /^\/settings/,
]

let isRefreshing = false
let refreshTimeout = null

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
    console.log(`[v0] Looking for cached response: ${request.url}`)

    if (!isCacheAPISupported()) {
        return await getFromBackupDB(request.url)
    }

    const url = new URL(request.url)

    // 首先尝试精确匹配
    let cachedResponse = await caches.match(request)
    if (cachedResponse) {
        console.log(`[v0] Found exact match in cache: ${request.url}`)
        return cachedResponse
    }

    // 如果是报告页面，尝试标准化 URL 匹配
    if (url.pathname.includes("/rep/")) {
        const normalizedUrl = normalizeUrlForCache(request.url)
        cachedResponse = await caches.match(normalizedUrl)
        if (cachedResponse) {
            console.log(`[v0] Found cached response with normalized URL: ${normalizedUrl}`)
            return cachedResponse
        }

        const cacheNames = await caches.keys()
        console.log(`[v0] Searching in ${cacheNames.length} caches for path: ${url.pathname}`)

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName)
            const cachedRequests = await cache.keys()

            console.log(`[v0] Cache ${cacheName} has ${cachedRequests.length} entries`)

            for (const cachedRequest of cachedRequests) {
                const cachedUrl = new URL(cachedRequest.url)

                // 如果路径相同，忽略查询参数差异
                if (cachedUrl.pathname === url.pathname && cachedUrl.origin === url.origin) {
                    const response = await cache.match(cachedRequest)
                    if (response) {
                        console.log(`[v0] Found cached response with same path: ${cachedRequest.url}`)
                        return response
                    }
                }

                const requestPathWithoutFragment = url.pathname.replace(/#.*$/, "")
                const cachedPathWithoutFragment = cachedUrl.pathname.replace(/#.*$/, "")

                if (cachedPathWithoutFragment === requestPathWithoutFragment && cachedUrl.origin === url.origin) {
                    const response = await cache.match(cachedRequest)
                    if (response) {
                        console.log(`[v0] Found cached response with matching path (no fragment): ${cachedRequest.url}`)
                        return response
                    }
                }
            }
        }

        console.log(`[v0] No cached response found for: ${request.url}`)
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
                if (result && Date.now() - result.timestamp <= CACHE_CONFIG.maxAgeSeconds * 1000) {
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
                    if (normalizedResult && Date.now() - normalizedResult.timestamp <= CACHE_CONFIG.maxAgeSeconds * 1000) {
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

const shouldCacheRoute = (url) => {
    const pathname = new URL(url).pathname
    return CACHEABLE_ROUTES.some((pattern) => pattern.test(pathname))
}

const isAuthRequest = (url) => {
    const pathname = new URL(url).pathname
    return pathname.includes("/login") || pathname.includes("/auth/") || pathname.includes("/api/auth/")
}

const isProtectedPage = (url) => {
    const pathname = new URL(url).pathname
    const protectedPaths = ["/rep/", "/profile", "/dashboard", "/settings"]
    return protectedPaths.some((path) => pathname.startsWith(path))
}

const shouldCacheStaticAsset = (url) => {
    const pathname = new URL(url).pathname

    if (isDevelopment()) {
        // 如果是报告页面相关的资源，强制缓存
        if (pathname.includes("/rep/") || pathname.includes("/_next/static/chunks/")) {
            return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
        }

        // 其他JS和CSS文件在开发模式下不缓存
        if (pathname.match(/\.(js|css)$/)) {
            console.log("Development mode: Skipping cache for code file:", pathname)
            return false
        }
    }

    return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
}

const manageCacheSize = async (cacheName, maxEntries) => {
    if (!isCacheAPISupported()) return

    try {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        if (keys.length > maxEntries) {
            console.log(`[v0] Cache ${cacheName} has ${keys.length} entries, cleaning up...`)

            // 按时间戳排序，删除最旧的条目
            const entriesToDelete = keys.slice(0, keys.length - maxEntries)
            await Promise.all(entriesToDelete.map((key) => cache.delete(key)))

            console.log(`[v0] Cleaned up ${entriesToDelete.length} old cache entries`)
        }
    } catch (error) {
        console.error("Cache management failed:", error)
    }
}

// 检查是否应该强制缓存（忽略 cache-control）
const shouldForceCacheResponse = (request, response) => {
    const url = new URL(request.url)

    // 强制缓存报告页面，即使有 no-store
    if (url.pathname.includes("/rep/")) {
        console.log(`[v0] Force caching report page: ${request.url}`)
        return true
    }

    // 检查自定义缓存标识
    const pwaCacheHeader = response.headers.get("x-pwa-cache")
    if (pwaCacheHeader) {
        console.log(`[v0] Force caching due to x-pwa-cache header: ${pwaCacheHeader}`)
        return true
    }

    return false
}

// 改进的缓存响应函数
const cacheResponse = async (request, response, isPriority = false) => {
    try {
        const cacheName = isPriority ? PRIORITY_CACHE : DYNAMIC_CACHE
        const maxEntries = isPriority ? CACHE_CONFIG.priorityMaxEntries : CACHE_CONFIG.maxEntries

        // 检查是否应该缓存
        const cacheControl = response.headers.get("cache-control") || ""
        const shouldForceCache = shouldForceCacheResponse(request, response)

        if (cacheControl.includes("no-store") && !shouldForceCache) {
            console.log(`[v0] Skipping cache due to no-store: ${request.url}`)
            return
        }

        if (isCacheAPISupported()) {
            const cache = await caches.open(cacheName)

            // 使用标准化的 URL 进行缓存
            const cacheKey = normalizeUrlForCache(request.url)
            const cacheRequest = new Request(cacheKey, {
                method: request.method,
                headers: request.headers,
            })

            // 创建新的响应，移除可能阻止缓存的头部
            const responseToCache = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: (() => {
                    const headers = new Headers(response.headers)
                    if (shouldForceCache) {
                        // 移除阻止缓存的头部
                        headers.delete("cache-control")
                        headers.set("cache-control", "public, max-age=86400") // 24小时
                    }
                    return headers
                })(),
            })

            await cache.put(cacheRequest, responseToCache)
            console.log(`[v0] Successfully cached ${isPriority ? "priority" : "regular"} response: ${cacheKey}`)

            // 管理缓存大小
            await manageCacheSize(cacheName, maxEntries)
        } else {
            await saveToBackupDB(request.url, response.clone())
        }
    } catch (error) {
        console.error("Failed to cache response:", error)
    }
}

const isRSCRequest = (request) => {
    const url = new URL(request.url)
    return url.searchParams.has("_rsc") || request.headers.get("RSC") === "1"
}

const isRSCResponse = (response) => {
    const contentType = response.headers.get("content-type") || ""
    return contentType.includes("text/x-component") || contentType.includes("application/rsc")
}

// 报告缓存管理
const REPORT_CACHE_STATUS = new Map() // 存储报告缓存状态

// 获取报告的所有相关页面URL
const getReportPages = (repId, template, version) => {
    const baseUrl = `/rep/${repId}/${template}/${version}`

    // 基础页面
    const pages = [
        baseUrl, // 主页面
        `${baseUrl}/Conclusion`, // 结论页面
        `${baseUrl}/Accessories`, // 附件页面
        `${baseUrl}/Summary`, // 摘要页面
        `${baseUrl}/Analysis`, // 分析页面
        `${baseUrl}/Inspection`, // 检验页面
        `${baseUrl}/Testing`, // 测试页面
        `${baseUrl}/Calibration`, // 校准页面
        `${baseUrl}/Maintenance`, // 维护页面
        `${baseUrl}/Configuration`, // 配置页面
    ]

    // 添加RSC请求URL
    const rscPages = pages.map((page) => `${page}?_rsc=${Date.now()}`)

    return [...pages, ...rscPages]
}

// 预加载报告的所有页面
const preloadReport = async (repId, template, version) => {
    console.log(`[v0] Starting report preload: ${repId}/${template}/${version}`)

    const reportKey = `${repId}/${template}/${version}`
    const pages = getReportPages(repId, template, version)
    const cacheStatus = {}

    let successCount = 0
    const totalCount = pages.length

    // 并发预加载所有页面
    const preloadPromises = pages.map(async (pageUrl) => {
        try {
            console.log(`[v0] Preloading page: ${pageUrl}`)

            const response = await fetch(pageUrl, {
                cache: "no-cache",
                headers: {
                    "x-preload": "true",
                    "x-report-cache": "true",
                },
            })

            if (response.ok) {
                // 强制缓存这个响应
                const request = new Request(pageUrl)
                await cacheResponse(request, response.clone(), true) // 使用优先级缓存

                cacheStatus[pageUrl] = true
                successCount++
                console.log(`[v0] Successfully preloaded: ${pageUrl}`)
            } else {
                cacheStatus[pageUrl] = false
                console.log(`[v0] Failed to preload (${response.status}): ${pageUrl}`)
            }
        } catch (error) {
            cacheStatus[pageUrl] = false
            console.log(`[v0] Error preloading ${pageUrl}:`, error.message)
        }
    })

    await Promise.all(preloadPromises)

    // 更新报告缓存状态
    REPORT_CACHE_STATUS.set(reportKey, {
        template,
        version,
        repId,
        pages: cacheStatus,
        totalPages: totalCount,
        cachedPages: successCount,
        lastUpdated: Date.now(),
        isComplete: successCount === totalCount,
    })

    console.log(`[v0] Report preload complete: ${successCount}/${totalCount} pages cached`)

    return {
        success: successCount > 0,
        totalPages: totalCount,
        cachedPages: successCount,
        isComplete: successCount === totalCount,
        status: cacheStatus,
    }
}

// 获取报告缓存状态
const getReportCacheStatus = async (repId, template, version) => {
    const reportKey = `${repId}/${template}/${version}`
    const pages = getReportPages(repId, template, version)
    const cacheStatus = {}

    // 检查每个页面的缓存状态
    for (const pageUrl of pages) {
        try {
            const cachedResponse = await findCachedResponse(new Request(pageUrl))
            cacheStatus[pageUrl] = !!cachedResponse
        } catch (error) {
            cacheStatus[pageUrl] = false
        }
    }

    const cachedCount = Object.values(cacheStatus).filter(Boolean).length
    const totalCount = pages.length

    // 更新状态记录
    REPORT_CACHE_STATUS.set(reportKey, {
        template,
        version,
        repId,
        pages: cacheStatus,
        totalPages: totalCount,
        cachedPages: cachedCount,
        lastUpdated: Date.now(),
        isComplete: cachedCount === totalCount,
    })

    return {
        totalPages: totalCount,
        cachedPages: cachedCount,
        isComplete: cachedCount === totalCount,
        status: cacheStatus,
    }
}

// 清理报告缓存
const clearReportCache = async (repId, template, version) => {
    const pages = getReportPages(repId, template, version)
    let clearedCount = 0

    if (isCacheAPISupported()) {
        const cacheNames = [DYNAMIC_CACHE, PRIORITY_CACHE, STATIC_CACHE]

        for (const cacheName of cacheNames) {
            try {
                const cache = await caches.open(cacheName)

                for (const pageUrl of pages) {
                    const deleted = await cache.delete(pageUrl)
                    if (deleted) {
                        clearedCount++
                        console.log(`[v0] Cleared cache for: ${pageUrl}`)
                    }
                }
            } catch (error) {
                console.error(`Error clearing cache ${cacheName}:`, error)
            }
        }
    }

    // 清理状态记录
    const reportKey = `${repId}/${template}/${version}`
    REPORT_CACHE_STATUS.delete(reportKey)

    return { clearedCount }
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
                            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== PRIORITY_CACHE) {
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
                if (url.pathname.includes("/graphql")) {
                    if (isDevelopment()) {
                        // 开发环境直接透传，不拦截
                        return fetch(request)
                    }

                    try {
                        const networkResponse = await fetch(request)
                        return networkResponse
                    } catch (networkError) {
                        console.log("GraphQL request failed:", networkError.message)

                        // 返回离线响应而不是让请求失败
                        return new Response(
                            JSON.stringify({
                                errors: [
                                    {
                                        message: "服务暂时不可用，请稍后重试",
                                        extensions: { offline: true },
                                    },
                                ],
                            }),
                            {
                                status: 503,
                                headers: {
                                    "Content-Type": "application/json",
                                    "Cache-Control": "no-cache",
                                },
                            },
                        )
                    }
                }

                if (isAuthRequest(request.url)) {
                    try {
                        return await fetch(request)
                    } catch (networkError) {
                        console.log("Auth request failed offline, allowing access to cached content")
                        if (isProtectedPage(request.url)) {
                            const cachedResponse = await findCachedResponse(request)
                            if (cachedResponse) {
                                return cachedResponse
                            }
                        }

                        // 只有在访问登录页面本身时才返回离线登录页面
                        if (url.pathname === "/login") {
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
                            max-width: 400px;
                        }
                        .icon { font-size: 2rem; margin-bottom: 1rem; }
                        h1 { color: #3498db; margin-bottom: 1rem; font-size: 1.5rem; }
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">📱</div>
                        <h1>离线模式</h1>
                        <p>当前处于离线状态，无法进行登录验证。</p>
                        <p>您可以继续浏览已缓存的内容。</p>
                        <div class="actions">
                            <a href="/">浏览缓存内容</a>
                            <button onclick="window.location.reload()">重试连接</button>
                        </div>
                    </div>
                    <script>
                        let checkInterval;
                        
                        const checkNetwork = async () => {
                          try {
                            const response = await fetch('/api/health', { 
                              method: 'HEAD', 
                              cache: 'no-cache',
                              signal: AbortSignal.timeout(5000)
                            });
                            if (response.ok) {
                              clearInterval(checkInterval);
                              window.location.reload();
                            }
                          } catch (error) {
                            // 继续检查
                          }
                        };
                        
                        window.addEventListener('online', () => {
                            setTimeout(checkNetwork, 1000); // 延迟1秒再检查
                        });
                        
                        // 每30秒检查一次网络状态
                        checkInterval = setInterval(checkNetwork, 30000);
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

                        throw networkError
                    }
                }

                if (isRSCRequest(request)) {
                    console.log(`[v0] Handling RSC request: ${request.url}`)

                    try {
                        // RSC请求优先使用网络，确保获取最新的流式数据
                        const networkResponse = await fetch(request, {
                            cache: "no-cache", // 强制从网络获取
                        })

                        console.log(
                            `[v0] RSC network response: ${networkResponse.status}, content-type: ${networkResponse.headers.get("content-type")}`,
                        )

                        if (networkResponse.ok && isRSCResponse(networkResponse)) {
                            // 对于RSC响应，创建新的Response避免流式问题
                            const responseBody = await networkResponse.text()
                            const newResponse = new Response(responseBody, {
                                status: networkResponse.status,
                                statusText: networkResponse.statusText,
                                headers: networkResponse.headers,
                            })

                            // 只在离线模式下缓存RSC响应
                            if (url.pathname.includes("/rep/")) {
                                console.log(`[v0] Caching RSC response for offline use: ${request.url}`)
                                await cacheResponse(request, newResponse.clone(), true)
                            }

                            return newResponse
                        }

                        return networkResponse
                    } catch (networkError) {
                        console.log(`[v0] RSC network failed, trying cache: ${request.url}`)

                        // 只在网络失败时使用缓存
                        const cachedResponse = await findCachedResponse(request)
                        if (cachedResponse) {
                            console.log(`[v0] Found cached RSC response: ${request.url}`)
                            return cachedResponse
                        }

                        console.log(`[v0] No cached RSC response, returning error: ${request.url}`)
                        return new Response(
                            JSON.stringify({
                                error: "RSC content unavailable offline",
                                offline: true,
                            }),
                            {
                                status: 503,
                                headers: {
                                    "Content-Type": "application/json",
                                    "Cache-Control": "no-cache",
                                },
                            },
                        )
                    }
                }

                // API 请求策略 - 改进非RSC API请求处理
                if (url.pathname.startsWith("/api/")) {
                    console.log(`[v0] Handling API request: ${request.url}`)

                    try {
                        const networkResponse = await fetch(request)
                        console.log(
                            `[v0] API Network response status: ${networkResponse.status}, cache-control: ${networkResponse.headers.get("cache-control")}`,
                        )

                        if (networkResponse.ok) {
                            const isPriorityAPI = url.pathname.includes("/rep/") || url.pathname.includes("/report")

                            if (isPriorityAPI && !url.pathname.includes("/auth/")) {
                                console.log(`[v0] Caching priority API response: ${request.url}`)
                                await cacheResponse(request, networkResponse, true)
                            }
                        }

                        return networkResponse
                    } catch (networkError) {
                        console.log(`[v0] API network failed, trying cache: ${request.url}`)

                        const cachedResponse = await findCachedResponse(request)
                        if (cachedResponse) {
                            console.log(`[v0] Found cached API response: ${request.url}`)
                            return cachedResponse
                        }

                        console.log(`[v0] No cached API response found: ${request.url}`)
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

                if (shouldCacheStaticAsset(request.url)) {
                    const cachedResponse = await findCachedResponse(request)
                    if (cachedResponse) {
                        return cachedResponse
                    }

                    try {
                        const networkResponse = await fetch(request)
                        if (networkResponse.ok) {
                            // 只在生产环境或非代码文件时缓存
                            if (!isDevelopment() || !url.pathname.match(/\.(js|css)$/)) {
                                if (isCacheAPISupported()) {
                                    const cache = await caches.open(STATIC_CACHE)
                                    cache.put(request, networkResponse.clone())
                                } else {
                                    await saveToBackupDB(request.url, networkResponse.clone())
                                }
                            }
                        }
                        return networkResponse
                    } catch (error) {
                        return new Response("Resource not available offline", { status: 503 })
                    }
                }

                const cachedResponse = await findCachedResponse(request)

                const fetchPromise = fetch(request)
                    .then(async (networkResponse) => {
                        const contentType = networkResponse.headers.get("content-type") || ""
                        const isHtmlResponse = contentType.includes("text/html")

                        console.log(
                            `[v0] Network response for ${request.url}: status=${networkResponse.status}, content-type=${contentType}`,
                        )

                        if (networkResponse.ok && isHtmlResponse) {
                            if (shouldCacheRoute(request.url) || url.pathname.includes("/rep/")) {
                                console.log(`[v0] Caching HTML page response: ${request.url}`)

                                const isPriorityRoute = url.pathname.includes("/rep/")
                                await cacheResponse(request, networkResponse, isPriorityRoute)
                            }
                        }
                        return networkResponse
                    })
                    .catch(async (error) => {
                        console.log(`[v0] Page network failed: ${request.url}`, error)

                        if (cachedResponse) {
                            console.log(`[v0] Returning cached response for: ${request.url}`)
                            return cachedResponse
                        }

                        // 其他页面的通用离线提示
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
                    })

                // 如果有缓存，立即返回缓存，同时在后台更新
                if (cachedResponse) {
                    console.log(`[v0] Serving from cache: ${request.url}`)
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

    if (event.data && event.data.type === "SET_ENVIRONMENT") {
        isDevelopmentMode = event.data.isDevelopment
        console.log("Service Worker: Environment set to", isDevelopmentMode ? "development" : "production")
    }

    if (event.data && event.data.type === "PAGE_REFRESH_START") {
        isRefreshing = true
        if (refreshTimeout) {
            clearTimeout(refreshTimeout)
        }
        // 3秒后重置刷新状态
        refreshTimeout = setTimeout(() => {
            isRefreshing = false
        }, 3000)
    }

    if (event.data && event.data.type === "GET_CACHE_STATUS") {
        event.ports[0].postMessage({
            cacheAPISupported: isCacheAPISupported(),
            indexedDBSupported: typeof indexedDB !== "undefined",
            isDevelopment: isDevelopmentMode,
        })
    }

    if (event.data && event.data.type === "PRELOAD_REPORT") {
        const { repId, template, version } = event.data

        preloadReport(repId, template, version)
            .then((result) => {
                event.ports[0].postMessage({
                    success: true,
                    ...result,
                })
            })
            .catch((error) => {
                console.error("Report preload failed:", error)
                event.ports[0].postMessage({
                    success: false,
                    error: error.message,
                })
            })
    }

    if (event.data && event.data.type === "GET_REPORT_CACHE_STATUS") {
        const { repId, template, version } = event.data

        getReportCacheStatus(repId, template, version)
            .then((status) => {
                event.ports[0].postMessage({
                    success: true,
                    ...status,
                })
            })
            .catch((error) => {
                console.error("Get report cache status failed:", error)
                event.ports[0].postMessage({
                    success: false,
                    error: error.message,
                })
            })
    }

    if (event.data && event.data.type === "CLEAR_REPORT_CACHE") {
        const { repId, template, version } = event.data

        clearReportCache(repId, template, version)
            .then((result) => {
                event.ports[0].postMessage({
                    success: true,
                    ...result,
                })
            })
            .catch((error) => {
                console.error("Clear report cache failed:", error)
                event.ports[0].postMessage({
                    success: false,
                    error: error.message,
                })
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
