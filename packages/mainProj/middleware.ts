import NextAuth from "next-auth"
import { authConfig } from "@/app/auth.config"
import { type NextRequest, NextResponse } from "next/server"

// 应用 NextAuth 中间件
const authMiddleware = NextAuth(authConfig).auth

const isOfflineRequest = (request: NextRequest): boolean => {
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    const purpose = request.headers.get("sec-fetch-dest") || ""
    const cacheControl = request.headers.get("cache-control") || ""

    // 检查是否来自 Service Worker 或离线环境
    return (
        userAgent.includes("ServiceWorker") ||
        referer.includes("offline") ||
        cacheControl.includes("no-cache") ||
        purpose === "document" ||
        request.headers.get("x-offline-mode") === "true" ||
        // 检查是否为PWA离线请求
        (request.headers.get("sec-fetch-mode") === "navigate" && !request.headers.get("sec-fetch-site"))
    )
}

const isNetworkAvailable = async (request: NextRequest): Promise<boolean> => {
    try {
        // 构建健康检查URL
        const protocol = request.headers.get("x-forwarded-proto") || "http"
        const host = request.headers.get("host") || "localhost:3000"
        const healthUrl = `${protocol}://${host}/api/nextLive`

        const response = await fetch(healthUrl, {
            method: "HEAD",
            cache: "no-cache",
            signal: AbortSignal.timeout(2000), // 2秒超时
        })
        return response.ok
    } catch (error) {
        console.log("Network availability check failed:", error)
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

        const networkAvailable = await isNetworkAvailable(request)
        if (!networkAvailable) {
            console.log("Network unavailable for protected path, allowing cached access")
            const response = NextResponse.next()
            response.headers.set("x-offline-fallback", "true")
            response.headers.set("x-cache-control", "max-age=3600") // 1小时缓存
            return response
        }
    }

    if (isOfflineRequest(request)) {
        console.log("Offline request detected, bypassing auth middleware")
        const response = NextResponse.next()
        response.headers.set("x-offline-mode", "true")
        return response
    }

    // 首先应用 NextAuth 中间件
    try {
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
    } catch (error) {
        console.error("Auth middleware error:", error)
        const response = NextResponse.next()
        response.headers.set("x-auth-error", "true")
        response.headers.set("x-offline-fallback", "true")
        return response
    }
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
