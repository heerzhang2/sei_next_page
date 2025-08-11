import NextAuth from "next-auth"
import { authConfig } from "@/app/auth.config"
import { type NextRequest, NextResponse } from "next/server"

// 应用 NextAuth 中间件
const authMiddleware = NextAuth(authConfig).auth

// 检查是否为离线模式的请求
const isOfflineRequest = (request: NextRequest): boolean => {
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""

    // 检查是否来自 Service Worker 或离线环境
    return (
        userAgent.includes("ServiceWorker") ||
        referer.includes("offline") ||
        request.headers.get("cache-control")?.includes("no-cache")
    )
}

// 创建一个处理函数来添加缓存控制头
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 对于受保护的路由，在离线模式下不强制认证
    const protectedPaths = ["/rep/", "/profile", "/dashboard", "/settings"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    if (isProtectedPath && isOfflineRequest(request)) {
        console.log("Offline request detected for protected path, allowing access")
        const response = NextResponse.next()
        addNoCacheHeaders(response.headers)
        return response
    }

    // 首先应用 NextAuth 中间件
    const response = await authMiddleware(request)

    if (!response) {
        // 如果 authMiddleware 没有返回响应，创建一个新的响应
        const newResponse = NextResponse.next()

        // 添加缓存控制头
        addNoCacheHeaders(newResponse.headers)

        return newResponse
    }

    // 如果是 API 请求或数据请求，添加缓存控制头
    const isApiRequest = pathname.startsWith("/api/")
    const isDataRequest = pathname.includes("/_next/data/")
    const isGraphQLRequest = pathname.includes("/graphql")

    if (isApiRequest || isDataRequest || isGraphQLRequest) {
        // 复制原始响应并添加缓存控制头
        const newHeaders = new Headers(response.headers)
        addNoCacheHeaders(newHeaders)

        // 创建一个新的响应对象，保留原始响应的状态和正文，但使用新的头
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
