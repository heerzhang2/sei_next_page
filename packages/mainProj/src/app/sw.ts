/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // 将此属性的名称更改为你的 `injectionPoint`。
    // `injectionPoint` 是一个 InjectManifest 选项。
    // 参见 https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // 注入点，包含需要预缓存的资源列表
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache, // 默认的运行时缓存策略
  fallbacks: {
    entries: [
      {
        url: "/~offline", // 回退页面 URL
        matcher({ request }) {
          // 当请求目标是文档（HTML 页面）时触发回退
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners(); // 添加所有必要的事件监听器
