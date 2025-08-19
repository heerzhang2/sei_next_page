import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist, NetworkFirst } from "serwist"

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
    }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    disableDevLogs: false,      //false不正常
    runtimeCaching: [
        ...defaultCache,
        {
            matcher: /^https?:\/\/.*\/rep\/.*$/,
            handler: new NetworkFirst({
                cacheName: "report-pages",
                networkTimeoutSeconds: 3,
                plugins: [
                    {
                        cacheKeyWillBeUsed: async ({ request }) => {
                            const url = new URL(request.url)
                            // 移除from参数，使不同from值使用同一缓存条目
                            url.searchParams.delete("from")
                            console.log("删除from之后的key=", url.href, "请求自",request.url)
                            return url.href
                        },
                    },
                ],
            }),
        },
    ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
})

serwist.addEventListeners()
