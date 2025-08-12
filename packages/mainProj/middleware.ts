import NextAuth from "next-auth"
import { authConfig } from "@/app/auth.config"
import { type NextRequest, NextResponse } from "next/server"

// 应用 NextAuth 中间件
const authMiddleware = NextAuth(authConfig).auth

const isOfflineRequest = (request: NextRequest): boolean => {
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    const purpose = request.headers.get("sec-fetch-dest") || ""

    // 检查是否来自 Service Worker 或离线环境
    return (
        userAgent.includes("ServiceWorker") ||
        referer.includes("offline") ||
        request.headers.get("cache-control")?.includes("no-cache") ||
        (purpose === "document" && !navigator.onLine) ||
        request.headers.get("x-offline-mode") === "true"
    )
}

const isNetworkAvailable = async (): Promise<boolean> => {
    try {
        // 尝试访问一个轻量级的健康检查端点
        const response = await fetch("/api/health", {
            method: "HEAD",
            cache: "no-cache",
            signal: AbortSignal.timeout(3000), // 3秒超时
        })
        return response.ok
    } catch {
        return false
    }
}

// 创建一个处理函数来添加缓存控制头
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 对于受保护的路由，在离线模式下不强制认证
    const protectedPaths = ["/rep/", "/profile", "/dashboard", "/settings"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    if (isProtectedPath) {
        const isOffline = isOfflineRequest(request)

        if (isOffline) {
            console.log("Offline request detected for protected path, allowing access")
            const response = NextResponse.next()
            response.headers.set("x-offline-mode", "true")
            response.headers.set("x-cache-control", "max-age=86400") // 24小时缓存
            return response
        }

        const networkAvailable = await isNetworkAvailable()
        if (!networkAvailable && pathname.startsWith("/rep/")) {
            console.log("Network unavailable for report path, allowing cached access")
            const response = NextResponse.next()
            response.headers.set("x-offline-fallback", "true")
            return response
        }
    }

    // 首先应用 NextAuth 中间件
    const response = await authMiddleware(request)

    if (!response) {
        const newResponse = NextResponse.next()
        addNoCacheHeaders(newResponse.headers)
        return newResponse
    }

    if (pathname.startsWith("/rep/")) {
        const newHeaders = new Headers(response.headers)
        // 允许缓存报告页面
        newHeaders.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
        newHeaders.set("x-cacheable", "true")

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        })
    }

    // 如果是 API 请求或数据请求，添加缓存控制头
    const isApiRequest = pathname.startsWith("/api/")
    const isDataRequest = pathname.includes("/_next/data/")
    const isGraphQLRequest = pathname.includes("/graphql")

    if (isApiRequest || isDataRequest || isGraphQLRequest) {
        const newHeaders = new Headers(response.headers)
        addNoCacheHeaders(newHeaders)

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        })
    }

    return response
}

// 辅助函数：添加禁用缓存的头
function addNoCacheHeaders(headers: Headers) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Surrogate-Control", "no-store")
}

export const config = {
    // 匹配所有路径，除了静态资源和一些特定路径
    matcher: ["/((?!_next/static|_next/image|favicon.ico$|favicons/|grid$|$).*)", "/api/:path*", "/graphql"],
}
