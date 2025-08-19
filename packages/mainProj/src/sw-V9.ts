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
  disableDevLogs: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ request }) => {
        const url = new URL(request.url)
        // 排除热更新文件、RSC请求和开发环境文件
        return (
            !url.pathname.includes(".hot-update.") &&
            !url.searchParams.has("_rsc") &&
            !url.pathname.includes("/_next/static/webpack/") &&
            /^https?:\/\/.*\/rep\/.*$/.test(url.href)
        )
      },
      handler: new NetworkFirst({
        cacheName: "report-pages",
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              const url = new URL(request.url)
              url.searchParams.delete("from")
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
