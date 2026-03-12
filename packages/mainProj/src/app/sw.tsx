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
      // 保留 subrid 和 redId，这些是子报告的关键标识
      // searchParams.delete("subrid");
      // searchParams.delete("redId");
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
      networkTimeoutSeconds: 2, // 2秒超时,快速回退到缓存
      plugins: [
        new ExpirationPlugin({
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
          maxAgeSeconds: 90 * 24 * 60 * 60,
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
      networkTimeoutSeconds: isOfflineMode ? 0 : 2, // 离线模式立即返回缓存
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
      networkTimeoutSeconds: 3,
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
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 48 * 60 * 60,
        }),
        enhancedErrorHandlingPlugin,
      ],
    }),
  },
  {
    // 同源静态图片资源 - 覆盖 defaultCache 中的 static-image-assets
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const publicPath = basePath ? `${basePath}/` : "/";
      return (
        sameOrigin &&
        pathname.startsWith(publicPath) &&
        /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i.test(pathname)
      );
    },
    handler: new NetworkFirst({
      cacheName: "static-image-assets",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    // Cross-origin（包含 MinIO OSS 图片） - CacheFirst
    matcher: ({ sameOrigin }) => !sameOrigin,
    handler: new NetworkFirst({
      cacheName: "cross-origin",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
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
// 服务器状态跟踪
// ============================================================
let serverStatus = {
  isOnline: true,
  lastCheckTime: 0,
  consecutiveFailures: 0,
  lastNotificationTime: 0
};

// 离线模式标志 - 当服务器连续失败后立即切换到离线模式
let isOfflineMode = false;

// 发送服务器状态更新消息到主线程
function notifyServerStatus(isOnline: boolean) {
  const now = Date.now();

  // 如果状态是从离线恢复到在线，立即发送，不要节流
  if (!serverStatus.isOnline && isOnline) {
    console.log(`[SW][服务器状态] 检测到服务器从离线恢复为在线，立即发送通知`);
    serverStatus.lastNotificationTime = now;
    serverStatus.isOnline = isOnline;
    isOfflineMode = false;
    console.log(`[SW][服务器状态] 离线模式: ${isOfflineMode}`);

    console.log(`[SW][服务器状态] 准备发送服务器状态更新: ${isOnline}`);
    // 发送消息到所有客户端
    self.clients.matchAll({ type: 'window' }).then(clients => {
      console.log(`[SW][服务器状态] 找到 ${clients.length} 个客户端窗口`);
      clients.forEach(client => {
        console.log(`[SW][服务器状态] 向客户端发送消息: ${isOnline}`);
        client.postMessage({
          type: 'SERVER_STATUS_UPDATE',
          isOnline: isOnline,
          timestamp: now
        });
      });
    });
    return;
  }

  // 其他情况，避免频繁发送消息，至少间隔 5 秒
  if (now - serverStatus.lastNotificationTime < 5000) {
    console.log(`[SW][服务器状态] 距离上次通知不足5秒，跳过发送`);
    return;
  }

  serverStatus.lastNotificationTime = now;
  serverStatus.isOnline = isOnline;

  // 更新离线模式标志
  isOfflineMode = !isOnline;
  console.log(`[SW][服务器状态] 离线模式: ${isOfflineMode}`);

  console.log(`[SW][服务器状态] 准备发送服务器状态更新: ${isOnline}`);
  // 发送消息到所有客户端
  self.clients.matchAll({ type: 'window' }).then(clients => {
    console.log(`[SW][服务器状态] 找到 ${clients.length} 个客户端窗口`);
    clients.forEach(client => {
      console.log(`[SW][服务器状态] 向客户端发送消息: ${isOnline}`);
      client.postMessage({
        type: 'SERVER_STATUS_UPDATE',
        isOnline: isOnline,
        timestamp: now
      });
    });
  });
}

// 检查服务器状态
function checkServerStatus(response: Response, request: Request) {
  const now = Date.now();
  const url = new URL(request.url);

  // 检查是否为 Next.js 页面请求（包括文档请求和 RSC 请求）
  const isDocumentRequest = request.destination === 'document';
  const isRSCRequest = request.headers.get('RSC') === '1';
  const isNextJSPageRequest = isDocumentRequest || isRSCRequest;

  console.log(`[SW][服务器状态] 检查请求: ${url.pathname}, status: ${response.status}, isNextJSPageRequest: ${isNextJSPageRequest}, 当前离线模式: ${isOfflineMode}`);

  // 只处理 Next.js 页面请求，不处理 API 请求和健康检查请求
  // 并且跳过 prefetch 请求（prefetch 失败不应影响服务器状态判断）
  if (!isNextJSPageRequest || request.headers.get('Next-Router-Prefetch') === '1') {
    return;
  }

  // 检查是否为 5xx 服务器错误
  const isServerError = response.status >= 500 && response.status <= 599;
  const isSuccess = response.status >= 200 && response.status < 300;

  if (isServerError) {
    serverStatus.consecutiveFailures++;
    console.log(`[SW][服务器状态] 检测到 ${response.status} 错误，连续失败次数: ${serverStatus.consecutiveFailures}`);

    // 连续失败 3 次以上，认为服务器不可用
    if (serverStatus.consecutiveFailures >= 3) {
      console.log(`[SW][服务器状态] 达到失败阈值(3次)，通知主线程服务器不可用`);
      notifyServerStatus(false);
    }
  } else if (isSuccess) {
    // 成功响应，重置失败计数器
    if (serverStatus.consecutiveFailures > 0) {
      serverStatus.consecutiveFailures = 0;
      console.log(`[SW][服务器状态] 服务器响应正常(${response.status})，重置失败计数器`);
    }

    // 如果之前服务器不可用，现在恢复正常，发送通知
    if (!serverStatus.isOnline) {
      console.log(`[SW][服务器状态] 服务器从不可用恢复为可用，通知主线程`);
      notifyServerStatus(true);
    }
  }
}

// 快速检查网络可用性（用于离线模式检测）
async function quickNetworkCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${getBasePath()}/api/nextLive`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(1000), // 1秒超时
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ============================================================
// 移除了 SW 内部的定期健康检查机制
// 理由：Service Worker 的 setInterval 在页面刷新后不可靠
// 现在由主线程统一管理健康检查，并通过消息通知 SW
// ============================================================

// 接收主线程的服务器状态更新
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'NEXTJS_SERVER_STATUS_UPDATE') {
    const { isOnline, timestamp } = event.data;
    console.log(`[SW] 收到主线程的 Next.js 服务器状态更新: ${isOnline}, 时间戳: ${timestamp}`);

    if (isOnline) {
      if (!serverStatus.isOnline) {
        console.log(`[SW][主线程通知] Next.js 服务器已恢复，更新状态为在线`);
        serverStatus.consecutiveFailures = 0;
        notifyServerStatus(true);
      }
    } else {
      if (serverStatus.isOnline) {
        serverStatus.consecutiveFailures++;
        console.log(`[SW][主线程通知] Next.js 服务器不可用，连续失败次数: ${serverStatus.consecutiveFailures}`);

        // 连续失败 1 次以上，认为服务器不可用
        if (serverStatus.consecutiveFailures >= 1) {
          console.log(`[SW][主线程通知] 达到失败阈值(1次)，通知主线程服务器不可用`);
          notifyServerStatus(false);
        }
      }
    }
  }
});

// ============================================================
// 网络状态变化监听
// ============================================================
self.addEventListener('online', async () => {
  console.log(`[SW] 网络连接已恢复`);

  // 如果当前是离线模式，立即检查服务器状态
  if (isOfflineMode) {
    console.log(`[SW] 当前处于离线模式，检查服务器是否恢复...`);
    const isServerOnline = await quickNetworkCheck();
    if (isServerOnline) {
      console.log(`[SW] 服务器已恢复，立即更新状态`);
      notifyServerStatus(true);
    } else {
      console.log(`[SW] 服务器仍不可用，保持离线模式`);
    }
  }
});

// ============================================================
// 自定义 fetch 处理器 - 最高优先级
// ============================================================
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  console.log(`[SW][自定义Fetch] ${event.request.method} ${url.pathname}, 离线模式: ${isOfflineMode}`);

  // 跳过健康检查请求，直接传递到网络
  if (url.pathname.includes('/api/nextLive') || url.pathname.includes('/api/actuator/health')) {
    console.log(`[SW][自定义Fetch] 健康检查请求，直接传递到网络: ${url.pathname}`);
    return; // 让 Serwist 处理这些请求
  }

  // 检查是否为文档请求
  if (event.request.destination === 'document') {
    // 离线模式：直接使用缓存，不等待网络
    if (isOfflineMode) {
      console.log(`[SW][自定义Fetch] 离线模式，直接使用缓存: ${url.pathname}`);
      event.respondWith((async () => {
        // 1. 尝试精确匹配原始请求
        let cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`[SW][自定义Fetch] 使用缓存(精确): ${url.pathname}`);
          return cachedResponse.clone();
        }

        // 2. 特殊处理首页：如果访问 /report，尝试查找 /report/ 的缓存（反之亦然）
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

        // 3. 对于 report 路由，尝试使用规范化的 key 匹配
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

            // 4. 如果 RSC 请求没找到缓存，尝试查找 HTML 版本
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

          // 5. 如果规范化匹配失败，尝试从 report-pages-normalized 缓存中智能查找
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
          } catch (e) {
            console.error(`[SW][自定义Fetch] 查询缓存失败:`, e);
          }
        }

        // 6. 最后兜底:返回离线页面
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
      })());
      return;
    }

    // 在线模式：尝试网络，但快速失败到缓存
    event.respondWith((async () => {
      // 先快速检查缓存，如果有缓存，同时发起网络请求
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        console.log(`[SW][自定义Fetch] 找到缓存，立即返回并在后台更新: ${url.pathname}`);

        // 在后台尝试更新缓存
        fetch(event.request.clone())
          .then(async response => {
            if (response.ok) {
              // 检查服务器状态
              checkServerStatus(response, event.request);
              // 避免缓存空响应
              const clonedResponse = response.clone();
              const blob = await clonedResponse.blob();
              if (blob.size > 0) {
                caches.open('serwist-precache-v1').then(cache => {
                  cache.put(event.request, response.clone());
                });
              }
            }
          })
          .catch(error => {
            console.log(`[SW][自定义Fetch] 后台更新失败: ${error.message}`);
          });

        return cachedResponse.clone();
      }

      // 没有缓存，尝试网络请求，使用快速超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时

      try {
        const response = await fetch(event.request.clone(), {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // 检查服务器状态
        checkServerStatus(response, event.request);

        // 如果响应正常，缓存它
        if (response.ok) {
          const clonedResponse = response.clone();
          const blob = await clonedResponse.blob();
          // 避免缓存空响应
          if (blob.size > 0) {
            const cache = await caches.open('serwist-precache-v1');
            cache.put(event.request, response.clone());
          }
          return response;
        }

        throw new Error(`Server returned ${response.status}`);
      } catch (error) {
        clearTimeout(timeoutId);

        // 网络错误计入失败
        serverStatus.consecutiveFailures++;
        console.log(`[SW][自定义Fetch] 文档请求网络错误: ${error.message}, 连续失败次数: ${serverStatus.consecutiveFailures}`);

        // 连续失败 3 次，认为服务器不可用
        if (serverStatus.consecutiveFailures >= 3) {
          notifyServerStatus(false);
        }

        console.log(`[SW][自定义Fetch] 网络请求失败，尝试查找缓存`);

        // 尝试智能查找缓存（同上面的逻辑）
        const basePath = getBasePath();
        let cachedResponse: Response | null = null;

        // 首页替代处理
        if (url.pathname === basePath || url.pathname === `${basePath}/`) {
          const alternativeUrl = url.pathname === basePath ? `${basePath}/` : basePath;
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
        }

        // report 路由规范化匹配
        if (!cachedResponse && url.pathname.includes('/rep/')) {
          try {
            const normalizedKey = await normalizeReportCacheKey({ request: event.request });
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

            // RSC 降级到 HTML
            if (!cachedResponse && (url.searchParams.has('_rsc') || normalizedKey.includes('_v=rsc'))) {
              const htmlKey = normalizedKey.replace('_v=rsc', '_v=html');
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
            }
          } catch (e) {
            console.error(`[SW][自定义Fetch] 规范化匹配失败:`, e);
          }
        }

        if (cachedResponse) {
          return cachedResponse.clone();
        }

        // 最后兜底：离线页面
        const offlinePageUrl = `${getBasePath()}/~offline`;
        const cachedOffline = await caches.match(offlinePageUrl);
        if (cachedOffline) {
          return cachedOffline.clone();
        }

        return new Response(OFFLINE_FALLBACK_HTML, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Offline-Mode': 'true',
          },
        });
      }
    })());
    return;
  }

  // RSC 请求特殊处理 - 使用快速网络检查策略
  if (event.request.headers.get('RSC') === '1') {
    event.respondWith((async () => {
      // 检查是否为 prefetch 请求
      const isPrefetch = event.request.headers.get('Next-Router-Prefetch') === '1';
      console.log(`[SW][RSC-ENTER] ${url.pathname}, prefetch: ${isPrefetch}, offline: ${isOfflineMode}`);

      // 先检查缓存
      let cachedResponse = await caches.match(event.request);

      if (isOfflineMode) {
        // 离线模式：直接返回缓存或查找替代
        console.log(`[SW][自定义Fetch] RSC 离线模式${isPrefetch ? '(prefetch)' : '(navigation)'}: ${url.pathname}, 有缓存: ${!!cachedResponse}`);

        // Prefetch 请求在离线模式下尝试返回缓存，如果没有缓存则返回空 RSC
        if (isPrefetch) {
          console.log(`[SW][自定义Fetch] RSC prefetch 离线模式: ${url.pathname}`);
          if (cachedResponse) {
            console.log(`[SW][自定义Fetch] RSC prefetch 使用缓存: ${url.pathname}`);
            return cachedResponse.clone();
          }
          // 返回一个简单的占位 RSC 响应
          // 注意：在离线模式下，prefetch 返回空响应后，Next.js 点击 Link 时
          // 会发送真实的 navigation RSC 请求，我们需要确保那个请求能正确处理
          const emptyRsc = '[["$","div",null,{"children":[["$","$L1",null,{"children":"Loading..."}]]}]]';
          return new Response(emptyRsc, {
            status: 200,
            headers: {
              'Content-Type': 'text/x-component',
              'X-Prefetch-Skipped': 'offline',
            },
          });
        }

        if (cachedResponse) {
          console.log(`[SW][自定义Fetch] 使用 RSC 缓存: ${url.pathname}`);
          return cachedResponse.clone();
        }

        // 尝试 HTML 版本
        const htmlKey = url.href.replace('_v=rsc', '_v=html');
        const htmlRequest = new Request(htmlKey, {
          method: event.request.method,
          headers: event.request.headers,
          mode: event.request.mode,
          credentials: event.request.credentials,
          cache: event.request.cache,
        });
        const htmlResponse = await caches.match(htmlRequest);
        if (htmlResponse) {
          console.log(`[SW][自定义Fetch] RSC 降级到 HTML: ${url.pathname}`);
          return htmlResponse.clone();
        }

        // 尝试从所有缓存中查找（包括规范化后的路径）
        try {
          // 对于报告页面，尝试使用规范化 key 查找
          if (url.pathname.includes('/rep/')) {
            const normalizedKey = await normalizeReportCacheKey({ request: event.request });
            const normalizedRequest = new Request(normalizedKey, {
              method: event.request.method,
              headers: event.request.headers,
              mode: event.request.mode,
              credentials: event.request.credentials,
              cache: event.request.cache,
            });
            const normalizedResponse = await caches.match(normalizedRequest);
            if (normalizedResponse) {
              console.log(`[SW][自定义Fetch] RSC 使用规范化缓存: ${url.pathname}`);
              return normalizedResponse.clone();
            }

            // 尝试查找 HTML 版本的规范化缓存
            const htmlNormalizedKey = normalizedKey.replace('_v=rsc', '_v=html');
            const htmlNormalizedRequest = new Request(htmlNormalizedKey, {
              method: event.request.method,
              headers: event.request.headers,
              mode: event.request.mode,
              credentials: event.request.credentials,
              cache: event.request.cache,
            });
            const htmlNormalizedResponse = await caches.match(htmlNormalizedRequest);
            if (htmlNormalizedResponse) {
              console.log(`[SW][自定义Fetch] RSC 降级到 HTML (规范化): ${url.pathname}`);
              return htmlNormalizedResponse.clone();
            }
          }
        } catch (e) {
          console.error(`[SW][自定义Fetch] RSC 查找缓存失败:`, e);
        }

        // 完全没有缓存，返回空 RSC 响应（避免报错）
        console.log(`[SW][自定义Fetch] RSC 无缓存可用，返回空响应: ${url.pathname}`);
        return new Response('', {
          status: 200,
          headers: {
            'Content-Type': 'text/x-component',
            'X-Cache-Miss': 'true',
          },
        });
      }

      // 在线模式：有缓存则先返回缓存，后台更新
      if (cachedResponse) {
        console.log(`[SW][自定义Fetch] RSC 找到缓存${isPrefetch ? '(prefetch)' : '(navigation)'}，立即返回: ${url.pathname}`);

        // Prefetch 请求不需要后台更新
        if (!isPrefetch) {
          // 后台更新
          fetch(event.request.clone())
            .then(async response => {
              if (response.ok) {
                checkServerStatus(response, event.request);
                const clonedResponse = response.clone();
                const blob = await clonedResponse.blob();
                if (blob.size > 0) {
                  caches.open('serwist-precache-v1').then(cache => {
                    cache.put(event.request, response.clone());
                  });
                }
              }
            })
            .catch(() => {});
        }

        return cachedResponse.clone();
      }

      // 没有缓存，快速网络请求
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // RSC 请求 5秒超时

      try {
        const response = await fetch(event.request.clone(), {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        checkServerStatus(response, event.request);

        if (response.ok) {
          const clonedResponse = response.clone();
          const blob = await clonedResponse.blob();
          if (blob.size > 0) {
            const cache = await caches.open('serwist-precache-v1');
            cache.put(event.request, response.clone());
          }
          return response;
        }

        throw new Error(`Server returned ${response.status}`);
      } catch (error) {
        clearTimeout(timeoutId);

        // 网络错误（超时、连接失败）也计入失败
        if (!isPrefetch) {
          serverStatus.consecutiveFailures++;
          console.log(`[SW][自定义Fetch] RSC 网络错误: ${error.message}, 连续失败次数: ${serverStatus.consecutiveFailures}`);

          // 连续失败 3 次，认为服务器不可用
          if (serverStatus.consecutiveFailures >= 3) {
            notifyServerStatus(false);
          }
        }

        console.log(`[SW][自定义Fetch] RSC 网络请求失败${isPrefetch ? '(prefetch)' : ''}: ${error.message}, 尝试查找缓存`);

        // Prefetch 请求失败时返回空 RSC 响应
        if (isPrefetch) {
          console.log(`[SW][自定义Fetch] RSC prefetch 失败，返回空响应: ${url.pathname}`);
          const emptyRsc = '[]';
          return new Response(emptyRsc, {
            status: 200,
            headers: {
              'Content-Type': 'text/x-component',
              'X-Prefetch-Failed': 'true',
            },
          });
        }

        // 网络失败时，尝试查找缓存（同离线模式逻辑）
        try {
          // 尝试 HTML 版本
          const htmlKey = url.href.replace('_v=rsc', '_v=html');
          const htmlRequest = new Request(htmlKey, {
            method: event.request.method,
            headers: event.request.headers,
            mode: event.request.mode,
            credentials: event.request.credentials,
            cache: event.request.cache,
          });
          const htmlResponse = await caches.match(htmlRequest);
          if (htmlResponse) {
            console.log(`[SW][自定义Fetch] RSC 网络失败，降级到 HTML: ${url.pathname}`);
            return htmlResponse.clone();
          }

          // 对于报告页面，尝试使用规范化 key 查找
          if (url.pathname.includes('/rep/')) {
            const normalizedKey = await normalizeReportCacheKey({ request: event.request });
            const normalizedRequest = new Request(normalizedKey, {
              method: event.request.method,
              headers: event.request.headers,
              mode: event.request.mode,
              credentials: event.request.credentials,
              cache: event.request.cache,
            });
            const normalizedResponse = await caches.match(normalizedRequest);
            if (normalizedResponse) {
              console.log(`[SW][自定义Fetch] RSC 网络失败，使用规范化缓存: ${url.pathname}`);
              return normalizedResponse.clone();
            }

            const htmlNormalizedKey = normalizedKey.replace('_v=rsc', '_v=html');
            const htmlNormalizedRequest = new Request(htmlNormalizedKey, {
              method: event.request.method,
              headers: event.request.headers,
              mode: event.request.mode,
              credentials: event.request.credentials,
              cache: event.request.cache,
            });
            const htmlNormalizedResponse = await caches.match(htmlNormalizedRequest);
            if (htmlNormalizedResponse) {
              console.log(`[SW][自定义Fetch] RSC 网络失败，降级到 HTML (规范化): ${url.pathname}`);
              return htmlNormalizedResponse.clone();
            }
          }
        } catch (e) {
          console.error(`[SW][自定义Fetch] RSC 失败后查找缓存异常:`, e);
        }

        // 最后兜底：返回空响应（避免页面崩溃）
        console.log(`[SW][自定义Fetch] RSC 完全失败，返回空响应: ${url.pathname}`);
        return new Response('', {
          status: 200,
          headers: {
            'Content-Type': 'text/x-component',
            'X-Fetch-Failed': 'true',
          },
        });
      }
    })());
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

            const clonedResponse = response.clone();
            const blob = await clonedResponse.blob();
            if (blob.size > 0) {
              await cache.put(pageUrl, response.clone());
              console.log(`[SW] ✓ 预缓存成功: ${pageUrl}`);
            } else {
              console.log(`[SW] ✗ 预缓存失败 (空响应): ${pageUrl}`);
            }
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

      // 清理空缓存项
      await cleanupEmptyCacheEntries();

      // 不再在此启动定期健康检查
      // 现在由主线程统一管理健康检查，并通过消息通知 SW

      console.log("[SW] Service Worker 激活完成");
    })(),
  );
});

// ============================================================
// 清理空缓存项
// ============================================================
async function cleanupEmptyCacheEntries() {
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const clonedResponse = response.clone();
          const blob = await clonedResponse.blob();
          if (blob.size === 0) {
            console.log(`[SW] 清理空缓存: ${cacheName} - ${request.url}`);
            await cache.delete(request);
          }
        }
      }
    }
    console.log(`[SW] 空缓存清理完成`);
  } catch (error) {
    console.error(`[SW] 清理空缓存时出错:`, error);
  }
}

self.addEventListener("message", (event) => {
  const { data } = event;
  console.log(`[SW] 收到消息:`, data);

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
  } else if (data?.type === "GET_SERVER_STATUS") {
    // 响应主线程的服务器状态查询请求
    console.log(`[SW] 响应服务器状态查询:`, serverStatus);
    event.ports[0]?.postMessage({
      type: "SERVER_STATUS_RESPONSE",
      isOnline: serverStatus.isOnline,
      timestamp: serverStatus.lastNotificationTime
    });
  } else if (data?.type === "SERVER_RECOVERED") {
    // 主线程检测到服务器恢复，通知 Service Worker
    console.log(`[SW] 收到服务器恢复通知，更新离线模式状态`);
    notifyServerStatus(true);
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
        // 跳过通配符 URL，它们不需要被直接缓存
        if (url.includes('/rep/*/')) {
          console.log(`[SW] 跳过通配符 URL: ${url}`);
          return true; // 返回 true 表示成功处理
        }

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
          const clonedResponse = response.clone();
          const blob = await clonedResponse.blob();
          if (blob.size > 0) {
            const reportCache = await caches.open("report-pages-normalized");
            await reportCache.put(htmlRequest, response.clone());
            return true;
          }
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
