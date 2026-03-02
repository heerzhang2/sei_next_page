/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { ExpirationPlugin, NetworkFirst, NetworkOnly, type PrecacheEntry, type RuntimeCaching, type SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/turbopack/worker";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// 构建时注入的 basePath
const __NEXT_PUBLIC_BASE_PATH__ = "/report";

const getBasePath = () => {
  return __NEXT_PUBLIC_BASE_PATH__;
};

// ============================================================
// 🔥 激进离线策略: 预缓存的离线页面 HTML
// ============================================================
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线模式</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      animation: slideIn 0.5s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    h1 {
      color: #e74c3c;
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }
    p {
      color: #666;
      margin: 0 0 1.5rem 0;
      line-height: 1.6;
    }
    .info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      text-align: left;
      font-size: 0.9rem;
      color: #666;
      border-left: 4px solid #3498db;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      margin: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
      display: inline-block;
      text-decoration: none;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary {
      background: #f8f9fa;
      color: #333;
    }
    .btn-secondary:hover {
      background: #e9ecef;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .status {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      background: #fff3cd;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #856404;
      margin-top: 1rem;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #ffc107;
      border-radius: 50%;
      margin-right: 0.5rem;
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📴</div>
    <h1>您当前处于离线状态</h1>
    <p>后端服务暂时无法访问,但您仍可以使用以下功能:</p>
    <div class="info">
      <strong>✓ 可用功能:</strong>
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
        <li>查看已缓存的报告页面</li>
        <li>编辑和保存报告内容(本地存储)</li>
        <li>浏览报告应用界面</li>
        <li>上传新文件</li>
        <li>提交表单数据</li>
      </ul>
      <strong>⚠️ 不可用功能:</strong>
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
        <li>获取最新数据</li>
        <li>浏览非报告应用界面</li>
      </ul>
    </div>
    <a href="/" class="btn" onclick="window.location.reload()">🔄 重试连接</a>
    <a href="${getBasePath()}" class="btn btn-secondary">🏠 返回首页</a>
    <a href="${getBasePath()}/pwa" class="btn btn-secondary">📊 PWA管理</a>
    <div class="status">
      <div class="status-dot"></div>
      网络恢复后自动刷新
    </div>
  </div>
  <script>
    // 自动重试逻辑
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 3000;

    function autoRetry() {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          console.log(\`[离线模式] 自动重试 \${retryCount}/\${maxRetries}\`);
          window.location.reload();
        }, retryDelay);
      }
    }

    // 监听在线/离线状态
    if (navigator.onLine) {
      console.log('[离线模式] 当前在线,等待恢复...');
      window.addEventListener('offline', () => {
        console.log('[离线模式] 已切换到离线');
        location.reload();
      });
    } else {
      console.log('[离线模式] 当前离线');
      autoRetry();
      window.addEventListener('online', () => {
        console.log('[离线模式] 已连接到网络,刷新页面...');
        window.location.reload();
      });
    }

    // 定期检查网络状态
    setInterval(() => {
      if (navigator.onLine && retryCount < maxRetries) {
        console.log('[离线模式] 定期检查网络状态...');
        fetch(location.href, { mode: 'no-cors', cache: 'no-store' })
          .then(() => {
            console.log('[离线模式] 网络已恢复');
            window.location.reload();
          })
          .catch(() => {
            console.log('[离线模式] 网络仍未恢复');
          });
      }
    }, 10000);
  </script>
</body>
</html>`;

// ============================================================
// 🔥 自定义网络错误拦截器
// ============================================================
const aggressiveNetworkErrorPlugin = {
  fetchWillFail: async ({ request }: { request: Request }) => {
    console.log(`[SW][激进策略] 网络请求即将失败: ${request.url}`);

    // 对于文档请求(HTML页面),返回离线页面
    if (request.destination === 'document') {
      console.log(`[SW][激进策略] 文档请求失败,返回离线页面`);

      // 尝试从缓存获取离线页面
      const offlineResponse = await caches.match(`${getBasePath()}/~offline`);
      if (offlineResponse) {
        console.log(`[SW][激进策略] 使用缓存的离线页面`);
        return offlineResponse.clone();
      }

      // 如果缓存中没有,返回预构建的离线页面
      console.log(`[SW][激进策略] 使用预构建的离线页面`);
      return new Response(OFFLINE_FALLBACK_HTML, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Offline-Mode': 'true',
        },
      });
    }

    // 对于其他请求,返回空响应以避免报错
    return undefined;
  },

  fetchDidFail: async ({ request, error }: { request: Request; error: Error }) => {
    console.log(`[SW][激进策略] 网络请求失败: ${request.url}, 错误: ${error.message}`);

    // 对于关键请求,尝试从缓存获取
    if (request.url.includes('/rep/') || request.url.includes('/api/')) {
      const reportCache = await caches.open('report-pages-normalized');
      const cachedResponse = await reportCache.match(request);
      if (cachedResponse) {
        console.log(`[SW][激进策略] 从缓存找到响应: ${request.url}`);
        return cachedResponse.clone();
      }
    }

    return undefined;
  },
};

// ============================================================
// 🔥 自定义请求处理器 - 拦截所有请求并智能路由
// ============================================================
const smartRequestHandler = {
  requestWillFetch: async ({ request }: { request: Request }) => {
    console.log(`[SW][智能路由] 处理请求: ${request.url}`);

    // 检查是否为特殊路由
    const url = new URL(request.url);

    // PWA 管理页面和离线页面 - 优先从缓存
    if (url.pathname === `${getBasePath()}/pwa` || url.pathname === `${getBasePath()}/~offline`) {
      console.log(`[SW][智能路由] 特殊页面请求,优先缓存`);

      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // 即使有缓存,也尝试网络以获取最新版本
        const networkPromise = fetch(request.clone())
          .then(async response => {
            if (response.ok) {
              // 更新缓存
              const cache = await caches.open('serwist-precache-v1');
              cache.put(request, response.clone());
              return response;
            }
            return cachedResponse;
          })
          .catch(() => cachedResponse);

        // 返回缓存的响应,网络请求在后台进行
        return { request, result: networkPromise };
      }
    }

    return undefined;
  },

  handleRequest: async ({ request }: { request: Request }) => {
    console.log(`[SW][智能路由] 自定义处理: ${request.url}`);

    // 如果是文档请求且网络不可用,返回离线页面
    if (request.destination === 'document') {
      // 检查网络状态
      try {
        const response = await fetch(request.clone(), {
          mode: 'cors',
          cache: 'no-store',
          signal: AbortSignal.timeout(3000), // 3秒超时
        });

        if (response.ok) {
          return response;
        }

        // 如果响应不是 200,继续尝试缓存
      } catch (error) {
        console.log(`[SW][智能路由] 网络请求失败: ${error.message}`);
      }

      // 尝试从缓存获取
      let cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log(`[SW][智能路由] 使用缓存响应`);
        return cachedResponse.clone();
      }

      // 如果精确匹配失败，尝试忽略查询参数的匹配
      const url = new URL(request.url);
      if (url.search && url.search.length > 1) {
        // 创建一个不带查询参数的 Request
        const urlWithoutQuery = url.origin + url.pathname;
        console.log(`[SW][智能路由] 精确匹配失败，尝试忽略查询参数: ${urlWithoutQuery}`);
        const requestWithoutQuery = new Request(urlWithoutQuery, {
          method: request.method,
          headers: request.headers,
          mode: request.mode,
          credentials: request.credentials,
          cache: request.cache,
          redirect: request.redirect,
          referrer: request.referrer,
          referrerPolicy: request.referrerPolicy,
        });

        cachedResponse = await caches.match(requestWithoutQuery);
        if (cachedResponse) {
          console.log(`[SW][智能路由] 找到不带查询参数的缓存响应`);
          return cachedResponse.clone();
        }
      }

      // 最后兜底:返回离线页面
      console.log(`[SW][智能路由] 返回离线页面`);

      // 优先使用缓存的离线页面
      const offlinePageUrl = `${getBasePath()}/~offline`;
      const cachedOffline = await caches.match(offlinePageUrl);
      if (cachedOffline) {
        console.log(`[SW][智能路由] 使用缓存的离线页面: ${offlinePageUrl}`);
        return cachedOffline.clone();
      }

      // 如果缓存中没有，使用预构建的离线页面
      console.log(`[SW][智能路由] 使用预构建的离线页面`);
      return new Response(OFFLINE_FALLBACK_HTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Offline-Mode': 'true',
        },
      });
    }

    return undefined;
  },
};

// ============================================================
// 🔥 增强的缓存键插件
// ============================================================
const createCacheKeyPlugin = (normalizeFunction: (param: { request: Request }) => Promise<string>) => ({
  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
    const normalizedKey = await normalizeFunction({ request });
    console.log(`[SW]cacheKeyWillBeUsed: ${request.url} -> ${normalizedKey}`);
    return normalizedKey;
  },

  cachedResponseWillBeUsed: async ({ request, cachedResponse, cacheName }: { request: Request; cachedResponse?: Response; cacheName: string }) => {
    const url = new URL(request.url);

    // 如果没有找到缓存,尝试智能查找
    if (!cachedResponse && cacheName === "report-pages-normalized" && url.pathname.includes("/rep/")) {
      console.log(`[SW]未找到缓存,尝试智能查找: ${request.url}`);

      try {
        const reportCache = await caches.open(cacheName);
        const allKeys = await reportCache.keys();

        // 提取路径部分
        const pathPart = url.pathname.split("/rep/*/")[1]?.split("?")[0];
        if (pathPart) {
          // 查找包含相同路径部分的缓存
          for (const key of allKeys) {
            if (key.url.includes(`/rep/*/${pathPart}`)) {
              const response = await reportCache.match(key);
              if (response) {
                console.log(`[SW]通过路径匹配找到缓存: ${key.url}`);
                return response;
              }
            }
          }
        }
      } catch (e) {
        console.error("[SW]智能查找缓存失败:", e);
      }
    }

    return cachedResponse;
  },
});

// ============================================================
// 🔥 增强的错误处理插件
// ============================================================
const enhancedErrorHandlingPlugin = {
  handlerDidError: async ({ request, error }: { request: Request; error: Error }) => {
    console.log(`[SW][增强错误处理] 触发: ${request.url}, 错误: ${error.message}`);

    // 1. 对于文档请求,返回离线页面
    if (request.destination === 'document') {
      console.log(`[SW][增强错误处理] 文档请求错误,返回离线页面`);

      // 尝试获取缓存的离线页面
      const offlineResponse = await caches.match(`${getBasePath()}/~offline`);
      if (offlineResponse) {
        return offlineResponse.clone();
      }

      // 返回预构建的离线页面
      return new Response(OFFLINE_FALLBACK_HTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Offline-Mode': 'true',
        },
      });
    }

    // 2. 对于其他请求,尝试从所有缓存中查找
    try {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(request);
        if (response) {
          console.log(`[SW][增强错误处理] 从缓存 ${cacheName} 找到响应`);
          return response.clone();
        }
      }
    } catch (e) {
      console.error("[SW][增强错误处理] 查找所有缓存失败:", e);
    }

    // 3. 最后兜底:返回空响应
    console.log(`[SW][增强错误处理] 没有找到任何缓存,返回空响应`);
    return new Response('Offline', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },

  // 拦截 502/503/504 错误
  fetchDidSucceed: async ({ request, response }: { request: Request; response: Response }) => {
    // 如果响应是服务器错误,视为请求失败
    if (response.status >= 500 && response.status <= 599) {
      console.log(`[SW][增强错误处理] 检测到 ${response.status} 错误,触发离线模式`);

      // 对于文档请求,返回离线页面
      if (request.destination === 'document') {
        throw new Error(`Server error: ${response.status}`);
      }

      // 对于其他请求,尝试从缓存获取
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        try {
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            console.log(`[SW][增强错误处理] ${response.status} 错误,使用缓存`);
            return cachedResponse.clone();
          }
        } catch (e) {
          // 忽略单个缓存错误
        }
      }
    }

    return response;
  },
};

// ============================================================
// 报告路由缓存键标准化
// ============================================================
const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const basePath = getBasePath();

  let pathname = url.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }

  const pathParts = pathname.split("/");
  if (pathParts[1] === "rep" && pathParts.length >= 4) {
    const hasAction = pathParts.length >= 5 && pathParts[5] !== "";
    if (hasAction) {
      const normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`;
      const searchParams = new URLSearchParams(url.search);
      searchParams.delete("subrid");
      searchParams.delete("redId");
      searchParams.delete("from");
      searchParams.delete("original");
      searchParams.delete("lineIndex");
      searchParams.delete("unitIndex");
      searchParams.delete("modelkey");
      searchParams.delete("_rsc");

      const isRSC = request.headers.get("RSC") === "1";
      searchParams.set("_v", isRSC ? "rsc" : "html");

      const normalizedUrl = `${url.origin}${basePath}${normalizedPath}?${searchParams.toString()}`;
      console.log(`[SW]normalizeReportCacheKey (有子路由): ${request.url} -> ${normalizedUrl}`);
      return normalizedUrl;
    } else {
      const normalizedPath = `/rep/*/${pathParts[3]}/${pathParts[4]}`;
      const searchParams = new URLSearchParams(url.search);
      searchParams.delete("original");
      searchParams.delete("lineIndex");
      searchParams.delete("_rsc");

      const isRSC = request.headers.get("RSC") === "1";
      searchParams.set("_v", isRSC ? "rsc" : "html");

      const normalizedUrl = `${url.origin}${basePath}${normalizedPath}?${searchParams.toString()}`;
      console.log(`[SW]normalizeReportCacheKey (无子路由): ${request.url} -> ${normalizedUrl}`);
      return normalizedUrl;
    }
  }
  return request.url;
};

// ============================================================
// 自定义运行时缓存配置
// ============================================================
const customCache: RuntimeCaching[] = [
  {
    // 静态资源 - NetworkFirst 但快速超时
    matcher: ({ url: { pathname }, sameOrigin }) =>
      sameOrigin &&
      (pathname.startsWith("/_next/static/chunks/") ||
        pathname.startsWith("/_next/static/css/") ||
        pathname.includes("webpack-")),
    handler: new NetworkFirst({
      cacheName: "next-chunks",
      networkTimeoutSeconds: 1, // 1秒超时,快速回退到缓存
      plugins: [
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    // 字体文件 - CacheFirst
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const mediaPath = basePath ? `${basePath}/_next/static/media/` : "/_next/static/media/";
      return sameOrigin && (pathname.startsWith(mediaPath) && pathname.match(/.*\.woff2?$/));
    },
    handler: new NetworkFirst({
      cacheName: "fonts",
      networkTimeoutSeconds: 2,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    // 报告路由 - 激进的离线策略
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const repPath = basePath ? `${basePath}/rep/` : "/rep/";
      const matches = sameOrigin && pathname.startsWith(repPath);
      if (matches) {
        console.log(`[SW]Matcher 匹配报告路由: ${pathname}`);
      }
      return matches;
    },
    handler: new NetworkFirst({
      cacheName: "report-pages-normalized",
      networkTimeoutSeconds: 2, // 2秒超时
      plugins: [
        createCacheKeyPlugin(normalizeReportCacheKey),
        new ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
        enhancedErrorHandlingPlugin, // 使用增强的错误处理
        aggressiveNetworkErrorPlugin, // 激进的网络错误拦截
      ],
    }),
  },
  {
    // PWA 管理页面 - 优先缓存
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const pwaPath = `${basePath}/pwa`;
      const offlinePath = `${basePath}/~offline`;
      return sameOrigin && (pathname === pwaPath || pathname === offlinePath);
    },
    handler: new NetworkFirst({
      cacheName: "pwa-pages",
      networkTimeoutSeconds: 2,
      plugins: [
        smartRequestHandler, // 智能请求处理
        enhancedErrorHandlingPlugin,
      ],
    }),
  },
  {
    // API 请求 - NetworkOnly 不缓存
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const apiPath = basePath ? `${basePath}/api/` : "/api/";
      return sameOrigin && pathname.startsWith(apiPath);
    },
    handler: new NetworkOnly(),
  },
  {
    // RSC Prefetch
    matcher: ({ request, url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const repPath = basePath ? `${basePath}/rep/` : "/rep/";
      const apiPath = basePath ? `${basePath}/api/` : "/api/";
      return (
        request.headers.get("RSC") === "1" &&
        request.headers.get("Next-Router-Prefetch") === "1" &&
        sameOrigin &&
        !pathname.startsWith(apiPath) &&
        !pathname.startsWith(repPath)
      );
    },
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.rscPrefetch,
      networkTimeoutSeconds: 1,
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 48 * 60 * 60,
        }),
      ],
    }),
  },
  {
    // RSC Navigation
    matcher: ({ request, url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const repPath = basePath ? `${basePath}/rep/` : "/rep/";
      const apiPath = basePath ? `${basePath}/api/` : "/api/";
      return (
        request.headers.get("RSC") === "1" &&
        sameOrigin &&
        !pathname.startsWith(apiPath) &&
        !pathname.startsWith(repPath)
      );
    },
    handler: new NetworkFirst({
      cacheName: PAGES_CACHE_NAME.rsc,
      networkTimeoutSeconds: 1,
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 48 * 60 * 60,
        }),
        enhancedErrorHandlingPlugin,
      ],
    }),
  },
  {
    // Cross-origin
    matcher: ({ sameOrigin }) => !sameOrigin,
    handler: new NetworkFirst({
      cacheName: "cross-origin",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 4 * 60 * 60,
        }),
      ],
      networkTimeoutSeconds: 5,
    }),
  },
  ...defaultCache,
];

// ============================================================
// 创建 Serwist 实例
// ============================================================
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // 禁用以支持自定义离线处理
  disableDevLogs: false,
  runtimeCaching: customCache,
  fallbacks: {
    entries: [
      {
        url: `${getBasePath()}/~offline`,
        matcher: ({ request }: { request: Request }) => {
          return request.destination === "document";
        },
      },
    ],
  },
  precacheOptions: {
    plugins: [],
  },
});

// ============================================================
// 自定义 fetch 处理器 - 最高优先级
// ============================================================
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  console.log(`[SW][自定义Fetch] ${event.request.method} ${url.pathname}`);

  // 检查是否为文档请求
  if (event.request.destination === 'document') {
    // 尝试快速检查网络状态
    const networkPromise = fetch(event.request.clone())
      .then(response => {
        // 如果是 5xx 错误,也视为失败
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response;
      })
      .catch(error => {
        console.log(`[SW][自定义Fetch] 网络失败: ${error.message}`);

        // 尝试从缓存获取 - 支持规范化 key
        return (async () => {
          // 1. 尝试精确匹配原始请求
          let cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log(`[SW][自定义Fetch] 使用缓存(精确): ${url.pathname}`);
            return cachedResponse.clone();
          }

          // 1.5. 特殊处理首页：如果访问 /report，尝试查找 /report/ 的缓存（反之亦然）
          const basePath = getBasePath();
          if (url.pathname === basePath || url.pathname === `${basePath}/`) {
            const alternativeUrl = url.pathname === basePath ? `${basePath}/` : basePath;
            console.log(`[SW][自定义Fetch] 首页尝试替代 URL: ${alternativeUrl}`);
            const alternativeRequest = new Request(url.origin + alternativeUrl, {
              method: event.request.method,
              headers: event.request.headers,
              mode: event.request.mode,
              credentials: event.request.credentials,
              cache: event.request.cache,
              redirect: event.request.redirect,
              referrer: event.request.referrer,
              referrerPolicy: event.request.referrerPolicy,
            });
            cachedResponse = await caches.match(alternativeRequest);
            if (cachedResponse) {
              console.log(`[SW][自定义Fetch] 使用缓存(首页替代): ${url.pathname}`);
              return cachedResponse.clone();
            }
          }

          // 2. 对于 report 路由，尝试使用规范化的 key 匹配
          if (url.pathname.includes('/rep/')) {
            try {
              const normalizedKey = await normalizeReportCacheKey({ request: event.request });
              console.log(`[SW][自定义Fetch] 尝试规范化 key: ${normalizedKey}`);

              // 创建一个带有规范化 URL 的 Request
              const normalizedRequest = new Request(normalizedKey, {
                method: event.request.method,
                headers: event.request.headers,
                mode: event.request.mode,
                credentials: event.request.credentials,
                cache: event.request.cache,
                redirect: event.request.redirect,
                referrer: event.request.referrer,
                referrerPolicy: event.request.referrerPolicy,
              });

              cachedResponse = await caches.match(normalizedRequest);
              if (cachedResponse) {
                console.log(`[SW][自定义Fetch] 使用缓存(规范化): ${url.pathname}`);
                return cachedResponse.clone();
              }

              // 3. 如果 RSC 请求没找到缓存，尝试查找 HTML 版本
              if (url.searchParams.has('_rsc') || normalizedKey.includes('_v=rsc')) {
                const htmlKey = normalizedKey.replace('_v=rsc', '_v=html');
                console.log(`[SW][自定义Fetch] RSC 请求未找到缓存，尝试查找 HTML 版本: ${htmlKey}`);

                const htmlRequest = new Request(htmlKey, {
                  method: event.request.method,
                  headers: event.request.headers,
                  mode: event.request.mode,
                  credentials: event.request.credentials,
                  cache: event.request.cache,
                  redirect: event.request.redirect,
                  referrer: event.request.referrer,
                  referrerPolicy: event.request.referrerPolicy,
                });

                cachedResponse = await caches.match(htmlRequest);
                if (cachedResponse) {
                  console.log(`[SW][自定义Fetch] 使用缓存(HTML 版本): ${url.pathname}`);
                  return cachedResponse.clone();
                }
              }
            } catch (e) {
              console.error(`[SW][自定义Fetch] 规范化匹配失败:`, e);
            }

            // 4. 如果规范化匹配失败，尝试从 report-pages-normalized 缓存中智能查找
            try {
              const reportCache = await caches.open('report-pages-normalized');
              const allKeys = await reportCache.keys();
              console.log(`[SW][自定义Fetch] report-pages-normalized 缓存中有 ${allKeys.length} 个条目`);

              // 提取路径特征（去除 reportId 和查询参数）
              const pathPattern = url.pathname.replace(/\/rep\/[^/]+/, '/rep/*');
              console.log(`[SW][自定义Fetch] 路径模式: ${pathPattern}`);

              // 遍历所有缓存的 key，寻找匹配的路径
              for (const key of allKeys) {
                const cachedUrl = new URL(key.url);
                const cachedPathPattern = cachedUrl.pathname.replace(/\/rep\/[^/]+/, '/rep/*');

                // 比较路径模式
                if (cachedPathPattern === pathPattern) {
                  console.log(`[SW][自定义Fetch] 找到路径匹配: ${key.url}`);

                  // 尝试获取这个缓存响应
                  const response = await reportCache.match(key);
                  if (response) {
                    console.log(`[SW][自定义Fetch] 使用缓存(模糊匹配): ${key.url}`);
                    return response.clone();
                  }
                }
              }

              // 打印所有 key 用于调试
              if (allKeys.length > 0 && allKeys.length <= 10) {
                allKeys.forEach((key, index) => {
                  console.log(`[SW][自定义Fetch] 缓存 key ${index + 1}: ${key.url}`);
                });
              }
            } catch (e) {
              console.error(`[SW][自定义Fetch] 查询缓存失败:`, e);
            }
          }

          // 最后兜底:返回离线页面
          console.log(`[SW][自定义Fetch] 返回离线页面`);

          // 优先使用缓存的离线页面
          const offlinePageUrl = `${getBasePath()}/~offline`;
          const cachedOffline = await caches.match(offlinePageUrl);
          if (cachedOffline) {
            console.log(`[SW][自定义Fetch] 使用缓存的离线页面: ${offlinePageUrl}`);
            return cachedOffline.clone();
          }

          // 如果缓存中没有，使用预构建的离线页面
          console.log(`[SW][自定义Fetch] 使用预构建的离线页面`);
          return new Response(OFFLINE_FALLBACK_HTML, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Offline-Mode': 'true',
            },
          });
        })();
      });

    event.respondWith(networkPromise);
    return;
  }

  // 其他请求交给 Serwist 处理
  return;
});

// ============================================================
// Service Worker 事件监听
// ============================================================
serwist.addEventListeners();

const APP_VERSION = "1.0";

self.addEventListener("install", (event) => {
  console.log(`[SW] Service Worker 安装中... 版本: ${APP_VERSION}`);
  event.waitUntil(
    (async () => {
      await self.skipWaiting();

      const basePath = getBasePath();
      const cache = await caches.open('serwist-precache-v1');

      // 预缓存关键页面 - 使用带 basePath 的完整 URL
      // 注意：首页需要缓存 /report 和 /report/ 两个版本，因为尾部斜杠的差异
      const pagesToPrecache = [
        `${basePath}`,      // /report
        `${basePath}/`,     // /report/
        `${basePath}/login`,
        `${basePath}/~offline`,     //似乎都没法作为离线页面
        `${basePath}/offline`,
      ];

      console.log(`[SW] 开始预缓存 ${pagesToPrecache.length} 个关键页面...`);

      let homepageResponse: Response | null = null;

      for (const pageUrl of pagesToPrecache) {
        try {
          console.log(`[SW] 预缓存页面: ${pageUrl}`);
          const response = await fetch(pageUrl, {
            mode: 'cors',
            cache: 'no-store',
          });

          if (response.ok) {
            // 对于首页，保存响应供第二个版本使用
            if ((pageUrl === `${basePath}` || pageUrl === `${basePath}/`) && homepageResponse === null) {
              homepageResponse = response.clone();
            }

            await cache.put(pageUrl, response.clone());
            console.log(`[SW] ✓ 预缓存成功: ${pageUrl}`);
          } else {
            console.log(`[SW] ✗ 预缓存失败 (HTTP ${response.status}): ${pageUrl}`);
          }
        } catch (error) {
          console.error(`[SW] ✗ 预缓存失败: ${pageUrl}`, error);
        }
      }

      // 确保首页的两个版本都缓存了相同的响应
      if (homepageResponse) {
        const homepageUrls = [`${basePath}`, `${basePath}/`];
        for (const url of homepageUrls) {
          try {
            await cache.put(url, homepageResponse.clone());
            console.log(`[SW] ✓ 确保首页响应已缓存: ${url}`);
          } catch (e) {
            console.error(`[SW] ✗ 缓存首页响应失败: ${url}`, e);
          }
        }
      }

      // 预缓存离线页面 HTML（如果没有成功从服务器获取）
      const offlineUrl = `${basePath}/~offline`;
      const existingOffline = await cache.match(offlineUrl);
      if (!existingOffline) {
        console.log(`[SW] 预缓存默认离线页面: ${offlineUrl}`);
        await cache.put(offlineUrl, new Response(OFFLINE_FALLBACK_HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }));
      }

      console.log(`[SW] 预缓存完成`);
    })(),
  );
});

self.addEventListener("activate", (event) => {
  console.log(`[SW] Service Worker 激活中... 版本: ${APP_VERSION}`);
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => {
        client.postMessage({
          type: "SW_UPDATED",
          version: APP_VERSION,
        });
      });
      console.log("[SW] Service Worker 激活完成");
    })(),
  );
});

self.addEventListener("message", (event) => {
  const { data } = event;
  if (data?.type === "CACHE_URLS") {
    event.waitUntil(
      cacheUrls(data.payload.urlsToCache)
        .then((success) => {
          event.ports[0]?.postMessage(success);
        })
        .catch((error) => {
          console.error("[SW] cacheUrls 失败:", error);
          event.ports[0]?.postMessage(false);
        }),
    );
  }
});

// ============================================================
// 批量缓存 URLs
// ============================================================
async function cacheUrls(urls: string[]): Promise<boolean> {
  try {
    const basePath = getBasePath();
    console.log(`[SW] 开始批量缓存 ${urls.length} 个 URLs`);

    const cachePromises = urls.map(async (url) => {
      try {
        let fullUrl = url;
        if (!url.startsWith('http')) {
          fullUrl = new URL(url, self.location.origin).href;
        }

        // 简化版: 只缓存 HTML 响应
        const htmlRequest = new Request(fullUrl, {
          headers: { Accept: "text/html" },
        });

        const response = await fetch(htmlRequest).catch(() => null);
        if (response && response.ok) {
          const reportCache = await caches.open("report-pages-normalized");
          await reportCache.put(htmlRequest, response.clone());
          return true;
        }
        return false;
      } catch (error) {
        console.error(`[SW] 缓存失败: ${url}`, error);
        return false;
      }
    });

    const results = await Promise.all(cachePromises);
    const successCount = results.filter(Boolean).length;

    console.log(`[SW] 批量缓存完成: ${successCount}/${urls.length} 成功`);
    return successCount > 0;
  } catch (error) {
    console.error("[SW] 批量缓存过程出错:", error);
    return false;
  }
}
