/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { ExpirationPlugin, NetworkFirst, NetworkOnly, type PrecacheEntry, type RuntimeCaching, type SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/turbopack/worker";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // 将此属性的名称更改为你的 `injectionPoint`。
    // `injectionPoint` 是一个 InjectManifest 选项。
    // 参见 https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;
// 从 Service Worker 获取 basePath
//【极为特殊的】在build命令运行之后，这里可能被直接自动修改的； basePath 在构建时注入，默认为空
const __NEXT_PUBLIC_BASE_PATH__ = "/report";

const getBasePath = () => {
  // 使用构建时注入的 basePath，来自环境变量 NEXT_PUBLIC_BASE_PATH
  return __NEXT_PUBLIC_BASE_PATH__;
};

const createCacheKeyPlugin = (normalizeFunction: (param: { request: Request }) => Promise<string>) => ({
  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
    const normalizedKey = await normalizeFunction({ request });
    console.log(`[SW]cacheKeyWillBeUsed: ${request.url} -> ${normalizedKey}`);

    // 调试：查找缓存中是否匹配的键
    if (normalizedKey.includes("/rep/*/")) {
      try {
        const reportCache = await caches.open("report-pages-normalized");
        const keys = await reportCache.keys();
        // 查找包含相同路径部分的键
        const pathPart = normalizedKey.split("/rep/*/")[1]?.split("?")[0];
        const matchingKeys = keys.filter(k => k.url.includes(`/rep/*/${pathPart}`));
        console.log(`[SW]查找路径 /rep/*/${pathPart} 的缓存，找到 ${matchingKeys.length} 个匹配项`);
        if (matchingKeys.length > 0) {
          console.log(`[SW]缓存中的键: ${matchingKeys[0].url}`);
        }
      } catch (e) {
        console.error("[SW]查找缓存失败:", e);
      }
    }

    return normalizedKey;
  },
  cachedResponseWillBeUsed: async ({ request, cachedResponse, cacheName }: { request: Request; cachedResponse?: Response; cacheName: string }) => {
    const url = new URL(request.url);

    // 如果没有找到缓存的响应，进行详细调试
    if (!cachedResponse && cacheName === "report-pages-normalized" && url.pathname.includes("/rep/")) {
      console.log(`[SW]KeyPlugin没有找到缓存，尝试手动查找: ${request.url}`);
      
      try {
        const reportCache = await caches.open(cacheName);
        
        // 获取所有缓存键
        const allKeys = await reportCache.keys();
        const repKeys = allKeys.filter(k => k.url.includes("/rep/*/"));
        
        console.log(`[SW]report-pages-normalized 中共有 ${repKeys.length} 个 /rep/*/ 缓存`);
        
        // 提取请求的路径部分
        const pathPart = url.pathname.split("/rep/*/")[1]?.split("?")[0];
        if (pathPart) {
          const matchingKeys = repKeys.filter(k => k.url.includes(`/rep/*/${pathPart}`));
          console.log(`[SW]找到 ${matchingKeys.length} 个路径匹配项: ${pathPart}`);
          
          // 检查每个匹配项
          for (const matchKey of matchingKeys) {
            const cached = await reportCache.match(matchKey);
            console.log(`[SW]  - ${matchKey.url}: ${cached ? "有内容" : "无内容"}`);
          }
        }
      } catch (e) {
        console.error("[SW]手动查找缓存失败:", e);
      }
    }

    // 如果找到了缓存的响应
    if (cachedResponse) {
      if (url.pathname.includes("/rep/")) {
        const isRSCRequest = request.headers.get("RSC") === "1";
        const isNavigationRequest = request.mode === "navigate";

        const contentType = cachedResponse.headers.get("content-type") || "";
        const isRSCResponse = contentType.includes("text/x-component");

        if (isNavigationRequest && isRSCResponse) {
          console.warn(`[SW]KeyPlugin导航请求不应返回 RSC 响应: ${request.url}`);
          return null;
        }

        if (isRSCRequest && !isRSCResponse) {
          console.warn(`[SW]KeyPluginRSC 请求不应返回 HTML 响应: ${request.url}`);
          return null;
        }

        console.log(`[SW]KeyPlugin✓返回匹配的缓存响应: ${request.url}, RSC=${isRSCResponse}`);
      }
      return cachedResponse;
    }

    // 如果没有找到精确匹配，尝试查找相同路径的另一种格式
    if (cacheName === "report-pages-normalized" && url.pathname.includes("/rep/")) {
      try {
        const isRSCRequest = request.headers.get("RSC") === "1";
        const searchParams = new URLSearchParams(url.search);
        const currentV = searchParams.get("_v");

        // 如果当前请求是 _v=rsc 或 _v=html，尝试查找另一种格式
        if (currentV === "rsc" || currentV === "html") {
          // 创建回退的 URL
          searchParams.set("_v", currentV === "rsc" ? "html" : "rsc");
          url.search = searchParams.toString();

          const reportCache = await caches.open(cacheName);
          const fallbackResponse = await reportCache.match(url.toString());

          if (fallbackResponse) {
            const contentType = fallbackResponse.headers.get("content-type") || "";
            const isRSCResponse = contentType.includes("text/x-component");

            // 对于导航请求，HTML 响应可以接受
            if (request.mode === "navigate" && !isRSCResponse) {
              console.log(`[SW]KeyPlugin使用 HTML 回退响应（导航请求）: ${request.url}`);
              return fallbackResponse;
            }

            // 如果请求的是 RSC 但只有 HTML 回退
            if (isRSCRequest && !isRSCResponse) {
              console.warn(`[SW]KeyPluginRSC 请求只有 HTML 缓存，返回 null: ${request.url}`);
              return null;
            }

            console.log(`[SW]KeyPlugin使用回退响应: ${request.url}`);
            return fallbackResponse;
          } else {
            console.log(`[SW]KeyPlugin没有找到回退缓存: ${url.toString()}`);
          }
        }
      } catch (e) {
        console.error("[SW]查找回退缓存失败:", e);
      }
    }

    console.log(`[SW]KeyPlugin没有找到缓存 - ${request.url}`);
    return null;
  },
});

// 创建自定义的错误处理插件 - 优先从缓存中查找，最后才返回错误页面
const errorHandlingPlugin = {
  handlerDidError: async ({ request, error }: { request: Request; error: Error }) => {
    console.log(`[SW]handlerDidError 触发: ${request.url}, 错误: ${error.message}`);

    // 尝试从 report-pages-normalized 缓存中手动查找
    try {
      const normalizedKey = await normalizeReportCacheKey({ request });
      const reportCache = await caches.open("report-pages-normalized");

      // 先尝试精确匹配
      let cachedResponse = await reportCache.match(normalizedKey);
      if (cachedResponse) {
        console.log(`[SW]handlerDidError 从缓存中找到精确匹配: ${normalizedKey}`);
        return cachedResponse.clone();
      }

      // 如果精确匹配失败，尝试查找 _v=html 版本（导航请求通常需要 HTML）
      if (normalizedKey.includes("_v=rsc")) {
        const htmlKey = normalizedKey.replace("_v=rsc", "_v=html");
        cachedResponse = await reportCache.match(htmlKey);
        if (cachedResponse) {
          console.log(`[SW]handlerDidError 从缓存中找到 HTML 回退: ${htmlKey}`);
          return cachedResponse.clone();
        }
      }

      // 最后兜底：在所有缓存键中搜索路径匹配
      const url = new URL(normalizedKey);
      const pathPart = url.pathname.split("/rep/*/")[1]?.split("?")[0];
      if (pathPart) {
        const allKeys = await reportCache.keys();
        const htmlSuffix = `_v=html`;
        for (const key of allKeys) {
          if (key.url.includes(`/rep/*/${pathPart}`) && key.url.includes(htmlSuffix)) {
            cachedResponse = await reportCache.match(key);
            if (cachedResponse) {
              console.log(`[SW]handlerDidError 通过路径搜索找到缓存: ${key.url}`);
              return cachedResponse.clone();
            }
          }
        }
      }
    } catch (e) {
      console.error("[SW]handlerDidError 查找缓存失败:", e);
    }

    // 所有缓存查找都失败，返回错误页面
    console.warn(`[SW]handlerDidError 没有找到任何缓存，返回错误页面: ${request.url}`);
    return createErrorPageResponse({
      errorType: "CHUNK_LOAD_ERROR",
      originalUrl: request.url,
      errorMessage: error.message,
    });
  },
};

// 报告路由约定使用的：这个并非preloadCache，没有参数自动过滤
const normalizeReportCacheKey = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const basePath = getBasePath();

  // 移除 basePath 前缀，得到标准化的相对路径
  let pathname = url.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }

  // 提取路径部分，移除动态的 repid
  const pathParts = pathname.split("/");
  if (pathParts[1] === "rep" && pathParts.length >= 4) {
    const hasAction = pathParts.length >= 5 && pathParts[5] !== ""; // 若有编辑器的子路由
    if (hasAction) {
      // 重构路径：/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
      const normalizedPath = `/rep/*/${pathParts.slice(3).join("/")}`;
      // 移除 subrid 查询参数 subrid from utm_idx #这些参数还需要在整个路由之内做协调统一的。
      const searchParams = new URLSearchParams(url.search);
      searchParams.delete("subrid");
      searchParams.delete("redId");

      searchParams.delete("from");
      searchParams.delete("original");
      searchParams.delete("unitIndex");
      // 控制器情况
      searchParams.delete("modelkey");
      // 删除动态的 _rsc 参数（这个值是动态的，不参与缓存键）
      searchParams.delete("_rsc");

      const isRSC = request.headers.get("RSC") === "1";
      searchParams.set("_v", isRSC ? "rsc" : "html");

      // 构建标准化的缓存键（带 basePath）
      const normalizedUrl = `${url.origin}${basePath}${normalizedPath}?${searchParams.toString()}`;
      console.log(`[SW]normalizeReportCacheKey (有子路由): ${request.url} -> ${normalizedUrl}`);
      return normalizedUrl;
    } else {
      const normalizedPath = `/rep/*/${pathParts[3]}/${pathParts[4]}`;
      // 移除 ?print=1 查询参数
      const searchParams = new URLSearchParams(url.search);
      searchParams.delete("original");
      // 删除动态的 _rsc 参数（这个值是动态的，不参与缓存键）
      searchParams.delete("_rsc");

      const isRSC = request.headers.get("RSC") === "1";
      searchParams.set("_v", isRSC ? "rsc" : "html");

      // 构建标准化的缓存键（带 basePath）
      const normalizedUrl = `${url.origin}${basePath}${normalizedPath}?${searchParams.toString()}`;
      console.log(`[SW]normalizeReportCacheKey (无子路由): ${request.url} -> ${normalizedUrl}`);
      return normalizedUrl;
    }
  }
  return request.url;
};

// 自定义运行时缓存配置
const customCache: RuntimeCaching[] = [
  {
    matcher: ({ url: { pathname }, sameOrigin }) =>
      sameOrigin &&
      (pathname.startsWith("/_next/static/chunks/") ||
        pathname.startsWith("/_next/static/css/") ||
        pathname.includes("webpack-")),
    handler: new NetworkFirst({
      cacheName: "next-chunks", // 静态资源,DEV模式用?
      networkTimeoutSeconds: 2,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  // 字体文件使用 CacheFirst 策略，优先从缓存读取
  {
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const mediaPath = basePath ? `${basePath}/_next/static/media/` : "/_next/static/media/";
      return sameOrigin && (pathname.startsWith(mediaPath) && pathname.match(/.*\.woff2?$/));
    },
    handler: new NetworkFirst({
      cacheName: "fonts",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存一年
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    matcher: ({ url: { pathname }, sameOrigin }) => {
      const basePath = getBasePath();
      const repPath = basePath ? `${basePath}/rep/` : "/rep/";
      const matches = sameOrigin && pathname.startsWith(repPath);
      if (matches) {
        console.log(`[SW]Matcher 匹配报告路由: ${pathname}, basePath=${basePath}, repPath=${repPath}`);
      }
      return matches;
    },
    handler: new NetworkFirst({
      cacheName: "report-pages-normalized",
      networkTimeoutSeconds: 3,
      plugins: [
        createCacheKeyPlugin(normalizeReportCacheKey),
        new ExpirationPlugin({
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30天缓存
          maxAgeFrom: "last-used",
        }),
        errorHandlingPlugin, // 避免未加载完成页面没动静
        {
          fetchDidSucceed: async ({ request, response }: { request: Request; response: Response }) => {
            // 如果网络响应是 502 或 5xx 错误，不使用缓存
            if (response.status >= 500) {
              console.warn(`[SW]网络返回错误状态 ${response.status}，尝试使用缓存: ${request.url}`);
              // 抛出错误，让策略尝试使用缓存
              throw new Error(`Network error: ${response.status}`);
            }
            return response;
          },
        },
      ],
    }),
  },
  {
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
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 48 * 60 * 60,
        }),
      ],
    }),
  },
  {
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
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 48 * 60 * 60,
        }),
      ],
    }),
  },
  {
    matcher: ({ url: { pathname }, sameOrigin }) => !sameOrigin && pathname === "/actuator/health",
    method: "GET",
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ sameOrigin }) => !sameOrigin,
    handler: new NetworkFirst({
      cacheName: "cross-origin",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 4 * 60 * 60,
        }),
      ],
      networkTimeoutSeconds: 10,
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // 注入点，包含需要预缓存的资源列表
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // 禁用: 与自定义 cacheKeyWillBeUsed 插件冲突，导致离线时 502 响应绕过缓存回退
  disableDevLogs: false, // 启用调试日志
  runtimeCaching: customCache,
  fallbacks: {
    entries: [
      {
        url: `${getBasePath()}/~offline`, // 回退页面 URL（包含 basePath）
        matcher: ({ request }: { request: Request }) => {
          // 当请求目标是文档（HTML 页面）时触发回退
          return request.destination === "document";
        },
      },
    ],
  },
  precacheOptions: {
    plugins: [],
  },
});

// 创建错误页面响应
function createErrorPageResponse(options: {
  errorType: string;
  originalUrl: string;
  errorMessage: string;
}): Response {
  const errorPageHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>应用程序加载失败</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 2rem; 
            background: #f5f5f5; 
            color: #333;
            line-height: 1.6;
        }
        .error-container { 
            max-width: 500px; 
            margin: 4rem auto; 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .error-icon { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
        }
        h1 { 
            color: #e74c3c; 
            margin-bottom: 1rem; 
        }
        .button { 
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 0.5rem; 
            font-size: 1rem;
        }
        .button:hover { 
            background: #2980b9; 
        }
        .error-details {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            text-align: left;
            font-size: 0.9rem;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>应用程序加载失败</h1>
        <p>抱歉，应用程序所需的资源未能正确加载。这可能是由于网络问题或版本升级但缓存未更新导致的。</p>
        <div class="error-details">
            <strong>错误类型:</strong> ${options.errorType}<br>
            <strong>请求资源:</strong> ${new URL(options.originalUrl).pathname}<br>
            <strong>建议操作:</strong> 请尝试刷新页面或清除浏览器缓存
        </div>
        <div>
            <button class="button" onclick="window.location.reload()">🔄 刷新页面</button>
            <button class="button" onclick="window.location.href='/'">🏠 返回首页</button>
        </div>
        <p style="margin-top: 2rem; font-size: 0.9rem; color: #999;">
            如果问题持续存在，请联系技术支持
        </p>
    </div>
    <script>
        window.addEventListener('online', () => {
            window.location.reload();
        });
    </script>
</body>
</html>`;
  return new Response(errorPageHtml, {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

serwist.addEventListeners();

const APP_VERSION = "1.0"; // 构建时替换

self.addEventListener("install", (event) => {
  console.log(`[SW] Service Worker 安装中... 版本: ${APP_VERSION}`);

  event.waitUntil(
    (async () => {
      await self.skipWaiting();
      console.log("[SW] Service Worker 安装完成");
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
      console.log("✅ 离线功能: 已激活并控制所有页面");
    })(),
  );
});

self.addEventListener("error", (event) => {
  console.error("[SW] Service Worker 错误:", event.error);
  notifyClientsOfError(event.error?.message || "未知的 Service Worker 错误", "SW_ERROR");
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("[SW] 未处理的拒绝:", event.reason);
  const error = event.reason;
  if (
    error &&
    (error.name === "InvalidStateError" ||
      error.message?.includes("database connection is closing") ||
      error.message?.includes("transaction") ||
      error.message?.includes("IDBDatabase"))
  ) {
    notifyClientsOfError("IndexedDB 连接异常，建议刷新页面以重置缓存状态", "INDEXEDDB_ERROR");
  } else {
    notifyClientsOfError(error?.message || String(error) || "未知的异步错误", "ASYNC_ERROR");
  }
  event.preventDefault();
});

self.addEventListener("message", (event) => {
  const { data } = event;
  // 针对CACHE_URLS实际上serwist默认能处理的，但是这里改成自定义代码处理。
  if (data?.type === "CACHE_URLS") {
    event.waitUntil(
      cacheUrls(data.payload.urlsToCache)
        .then((success) => {
          event.ports[0]?.postMessage(success);
        })
        .catch((error) => {
          console.error("[SW]cacheUrls 批量缓存失败:", error);
          event.ports[0]?.postMessage(false);
        }),
    );
    return;
  }

  if (data?.type === "CLEAR_AUTH_CACHE") {
    event.waitUntil(
      clearAuthCache()
        .then(() => {
          event.ports[0]?.postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        }),
    );
    return;
  }
});

async function cacheUrls(urls: string[]): Promise<boolean> {
  try {
    const basePath = getBasePath();
    console.log(`[SW]cacheUrls 开始批量缓存 ${urls.length} 个 URLs`);

    const cachePromises = urls.map(async (url) => {
      try {
        // URL 已经在 page.tsx 中添加了 basePath，直接使用
        let fullUrl = url;

        // 如果是相对路径，添加 origin
        if (!url.startsWith('http')) {
          fullUrl = new URL(url, self.location.origin).href;
        }

        // 构建标准化的缓存键（与 normalizeReportCacheKey 一致）
        let normalizedCacheKey = fullUrl;
        const urlObj = new URL(fullUrl);
        const pathname = urlObj.pathname;

        // 确保移除 basePath 后再判断
        let normalizedPath = pathname;
        if (basePath && normalizedPath.startsWith(basePath)) {
          normalizedPath = normalizedPath.slice(basePath.length);
        }

        const normalizedPathParts = normalizedPath.split("/");

        if (normalizedPathParts[1] === "rep" && normalizedPathParts.length >= 4) {
          const hasAction = normalizedPathParts.length >= 5 && normalizedPathParts[5] !== "";
          if (hasAction) {
            // 重构路径：/rep/[repid]/INDPL_DJ/1/ALL -> /rep/*/INDPL_DJ/1/ALL
            const pathPart = `/rep/*/${normalizedPathParts.slice(3).join("/")}`;
            // 构建查询参数
            const searchParams = new URLSearchParams();
            searchParams.set("_v", "html");
            normalizedCacheKey = `${urlObj.origin}${basePath}${pathPart}?${searchParams.toString()}`;
          } else {
            const pathPart = `/rep/*/${normalizedPathParts[3]}/${normalizedPathParts[4]}`;
            const searchParams = new URLSearchParams();
            searchParams.set("_v", "html");
            normalizedCacheKey = `${urlObj.origin}${basePath}${pathPart}?${searchParams.toString()}`;
          }
        }

        const htmlRequest = new Request(fullUrl, {
          headers: { Accept: "text/html" },
        });
        const rscRequest = new Request(fullUrl, {
          headers: {
            RSC: "1",
            Accept: "text/x-component",
            "Next-Router-State-Tree":
              "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
          },
        });

        // 每个url都有两种请求：
        const [htmlResponse, rscResponse] = await Promise.all([
          fetch(htmlRequest).catch((e) => {
            console.warn(`[SW]cacheUrls HTML 请求失败: ${url}`, e);
            return null;
          }),
          fetch(rscRequest).catch((e) => {
            console.warn(`[SW]cacheUrls RSC 请求失败: ${url}`, e);
            return null;
          }),
        ]);

        const reportCache = await caches.open("report-pages-normalized");

        let htmlCached = false;
        let rscCached = false;

        if (htmlResponse && htmlResponse.ok) {
          // 使用标准化的缓存键（与 normalizeReportCacheKey 一致）
          await reportCache.put(normalizedCacheKey, htmlResponse.clone());
          htmlCached = true;
        }

        if (rscResponse && rscResponse.ok) {
          // RSC 请求使用不同的 _v 参数
          let rscCacheKey = normalizedCacheKey;
          if (rscCacheKey.includes("_v=html")) {
            rscCacheKey = rscCacheKey.replace("_v=html", "_v=rsc");
          }
          console.log(`[SW]cacheUrls 缓存 RSC 响应: ${rscCacheKey}`);
          await reportCache.put(rscCacheKey, rscResponse.clone());
          rscCached = true;
        } else if (rscResponse && !rscResponse.ok) {
          console.warn(`[SW]cacheUrls RSC 响应非 200: ${rscResponse.status} for ${normalizedCacheKey}`);
        }

        return htmlCached && rscCached;
      } catch (error) {
        console.error(`[SW]cacheUrls 缓存失败: ${url}`, error);
        return false;
      }
    });

    const results = await Promise.all(cachePromises);
    const successCount = results.filter(Boolean).length;

    console.log(`[SW]cacheUrls 批量缓存完成: ${successCount}/${urls.length} 成功`);
    return successCount > 0;
  } catch (error) {
    console.error("[SW]cacheUrls 批量缓存过程出错:", error);
    return false;
  }
}

async function clearAuthCache() {
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      for (const request of requests) {
        if (request.url.includes("/api/auth/")) {
          await cache.delete(request);
          console.log("[SW] 清除认证缓存:", request.url);
        }
      }
    }
  } catch (error) {
    console.error("[SW] 清除认证缓存失败:", error);
  }
}

async function notifyClientsOfError(error: string, errorType = "CACHE_ERROR") {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) => {
      client.postMessage({
        type: errorType,
        error: error,
        timestamp: Date.now(),
      });
    });
  } catch (e) {
    console.error("[SW] 无法通知客户端错误:", e);
  }
}
