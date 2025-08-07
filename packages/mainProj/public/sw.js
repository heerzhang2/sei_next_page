const CACHE_NAME = 'report-app-v1';
const STATIC_CACHE_NAME = 'report-static-v1';
const DYNAMIC_CACHE_NAME = 'report-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/_next/static/css/app/globals.css',
    '/manifest.json'
];

// 需要缓存的 API 路径模式
const API_CACHE_PATTERNS = [
    /^\/api\//,
    /^.*\/graphql$/
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');

    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('缓存静态资源');
                return cache.addAll(STATIC_ASSETS.filter(url => url !== '/offline'));
            }),
            // 预缓存离线页面
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                return cache.add('/offline');
            })
        ])
    );

    // 强制激活新的 Service Worker
    self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker 激活中...');

    event.waitUntil(
        Promise.all([
            // 清理旧缓存
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName !== CACHE_NAME) {
                            console.log('删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // 立即控制所有客户端
            self.clients.claim()
        ])
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求的缓存（除了 GraphQL）
    if (request.method !== 'GET' && !isGraphQLRequest(request)) {
        return handleNonGetRequest(event);
    }

    // 处理不同类型的请求
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(url) || isGraphQLRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
    } else {
        event.respondWith(handleOtherRequest(request));
    }
});

// 判断是否为静态资源
function isStaticAsset(url) {
    return url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/static/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname === '/manifest.json';
}

// 判断是否为 API 请求
function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 判断是否为 GraphQL 请求
function isGraphQLRequest(request) {
    return request.url.includes('/graphql') ||
        (request.headers.get('content-type') &&
            request.headers.get('content-type').includes('application/json'));
}

// 判断是否为导航请求
function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
        (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// 处理静态资源请求
async function handleStaticAsset(request) {
    try {
        // 先尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 网络请求
        const networkResponse = await fetch(request);

        // 缓存成功的响应
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('静态资源请求失败:', error);
        // 返回缓存的版本
        return caches.match(request);
    }
}

// 处理 API 请求 - 与 URQL 协调
async function handleAPIRequest(request) {
    try {
        // 先尝试网络请求
        const networkResponse = await fetch(request);

        // 对于 GraphQL 请求，让 URQL 的 offlineExchange 处理缓存
        // Service Worker 只处理网络层面的回退
        if (isGraphQLRequest(request)) {
            return networkResponse;
        }

        // 只缓存成功的 GET 请求
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('API 请求失败:', error);

        // 对于 GraphQL 请求，返回特殊的离线响应，让 URQL 处理
        if (isGraphQLRequest(request)) {
            return new Response(JSON.stringify({
                data: null,
                errors: [{
                    message: '网络连接失败，正在离线模式下运行',
                    extensions: { code: 'NETWORK_ERROR', offline: true }
                }]
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 网络失败时，尝试从缓存获取
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 其他 API 请求返回错误响应
        return new Response(JSON.stringify({ error: '离线模式' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 处理导航请求
async function handleNavigationRequest(request) {
    try {
        // 先尝试网络请求
        const networkResponse = await fetch(request);

        // 缓存成功的页面
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('页面请求失败，使用离线页面:', error);

        // 尝试从缓存获取页面
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // 返回离线页面
        return caches.match('/offline') || new Response('离线模式', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// 处理其他请求
async function handleOtherRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('资源不可用', { status: 404 });
    }
}

// 处理非 GET 请求（POST、PUT、DELETE 等）
function handleNonGetRequest(event) {
    // 对于非 GET 请求，直接尝试网络请求
    event.respondWith(
        fetch(event.request).catch(() => {
            // 网络失败时，可以返回一个表示操作将在网络恢复时重试的响应
            return new Response(JSON.stringify({
                error: '网络连接失败，操作将在连接恢复时自动重试',
                offline: true
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        })
    );
}

// 监听消息
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
