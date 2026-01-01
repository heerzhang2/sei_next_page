import { cookies } from "next/headers"
import { createSharedAuthConfig } from "@fjsei/shared-auth-config"
import { createServerUrqlClient } from "@/auth/urql"
import type { NextAuthConfig } from "next-auth"

/**
 * 项目特定的授权函数实现
 * 使用 urql 客户端调用后端 GraphQL 认证接口
 */
const authorize = async (credentials: {
  username?: string | null
  password?: string | null
  deviceId?: string | null
}) => {
  const username = credentials.username || ""
  const password = credentials.password || ""
  const deviceId = credentials.deviceId || ""

  if (!username || !password) {
    return null
  }

  try {
    console.log("[mainProj Auth] 开始认证 - username:", username, "deviceId:", deviceId)

    const client = createServerUrqlClient(deviceId)
    const result = await client
      .mutation(
        `
        mutation Authenticate($username: String!, $password: String!) {
          authenticate(username: $username, password: $password, setCookie: false) {
            accessToken
            refreshToken
            user {
              id
              username
            }
          }
        }
      `,
        {
          username,
          password,
        },
      )
      .toPromise()

    if (result.error) {
      console.error("[mainProj Auth] GraphQL 认证错误:", result.error)
      return null
    }

    if (!result.data?.authenticate) {
      console.error("[mainProj Auth] 认证失败: 无数据返回")
      return null
    }

    const authData = result.data.authenticate

    // 设置 refreshToken cookie
    const cookieStore = await cookies()
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    cookieStore.set("refreshToken", authData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60, // 60 天
      path: `${basePath}/api/refresh-token`,
    })
    console.log("[mainProj Auth] refreshToken cookie 已设置")

    return {
      id: authData.user.id,
      name: authData.user.name || authData.user.username,
      email: authData.user.email,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      deviceId: deviceId,
      authorities: authData.user.authorities || [],
    }
  } catch (error) {
    console.error("[mainProj Auth] 认证异常:", error)
    return null
  }
}

/**
 * 导出共享认证配置
 */
const baseConfig = createSharedAuthConfig({
  authorize,
})

// 从 NEXTAUTH_URL 中提取 basePath
const getNextAuthBasePath = () => {
  const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL
  if (nextAuthUrl) {
    try {
      const url = new URL(nextAuthUrl)
      const pathname = url.pathname
      if (pathname !== "/") {
        return pathname.endsWith("/api/auth") ? pathname : `${pathname}/api/auth`
      }
    } catch (e) {
      console.warn("Failed to parse NEXTAUTH_URL:", e)
    }
  }

  // 回退到 NEXT_PUBLIC_BASE_PATH
  return process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` : "/api/auth"
}

/**
 * 合并配置，添加 basePath 支持
 */
export const authConfig: NextAuthConfig = {
  ...baseConfig,
  // NextAuth basePath 是相对于 Next.js 应用的，不需要包含 Next.js basePath
  basePath: "/api/auth",
  // pages 路径需要相对于根路径，NextAuth 会自动添加 basePath
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // 确保信任所有主机（在反向代理后面时需要）
  trustHost: true,
}
