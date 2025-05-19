// 用于在 API 路由和服务器组件中禁用缓存的辅助函数

/**
 * 设置响应头以禁用缓存
 * @param headers - 响应头对象
 */
export function setNoCacheHeaders(headers: Headers): void {
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  headers.set("Pragma", "no-cache")
  headers.set("Expires", "0")
  headers.set("Surrogate-Control", "no-store")
}

/**
 * 在 fetch 请求中禁用缓存的选项
 */
export const noCacheOptions = {
  cache: "no-store",
  next: { revalidate: 0 },
} as const

/**
 * 包装 fetch 请求以禁用缓存
 * @param url - 请求 URL
 * @param options - fetch 选项
 * @returns fetch 响应
 */
export async function fetchWithNoCache(url: string, options: RequestInit = {}) {
  // 添加时间戳参数到 URL 以确保绕过缓存
  const urlWithTimestamp = url.includes("?") ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`

  const response = await fetch(urlWithTimestamp, {
    ...options,
    cache: "no-store",
    headers: {
      ...options.headers,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
    },
  })

  return response
}

/**
 * 为 URQL 客户端创建禁用缓存的请求策略
 */
export const urqlNoCacheExchangeOptions = {
  requestPolicy: "network-only",
  fetchOptions: {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
    },
  },
}
