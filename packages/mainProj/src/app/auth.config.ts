import { cookies } from "next/headers"
import { createSharedAuthConfig } from "@fjsei/shared-auth-config"
import { createServerUrqlClient } from "@/auth/urql"
import type { NextAuthConfig } from "next-auth"
import { CredentialsSignin, AuthError } from "@auth/core/errors"

// 自定义认证错误类 - 账户未激活
// 必须继承 CredentialsSignin 才能正确传递 code 到前端 CredentialsSignin
class UserNotEnabledError extends AuthError {
  static type = "UserNotEnabled"
  code = "USER_NOT_ENABLED"
  // message = "您的账户还未激活，请联系管理员激活账户"
}

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
      // 检查是否是账户未激活错误
      const graphQLError = result.error.graphQLErrors?.[0]
      if (graphQLError?.message === "用户账户还未激活") {
        // 抛出 CredentialsSignin 子类错误，NextAuth 会传递 code 到前端
        // throw new UserNotEnabledError()
        throw new Error("USER_NOT_ENABLED")
      }
      return null
    }

    if (!result.data?.authenticate) {
      console.error("[mainProj Auth] 认证失败: 无数据返回")
      return null
    }

    const authData = result.data.authenticate

    // 设置 refreshToken cookie
    // 使用环境变量动态配置 path，确保与部署的 basePath 一致
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    const refreshTokenPath = `${basePath}/api/refresh-token`
    const cookieStore = await cookies()
    cookieStore.set("refreshToken", authData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60, // 60 天
      path: refreshTokenPath,
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
    // 如果是 CredentialsSignin 错误，重新抛出以便 NextAuth 传递错误码到前端
    // URL 将包含 error=CredentialsSignin&code=USER_NOT_ENABLED
    if (error instanceof CredentialsSignin) {
      throw error
    }
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

const signInPath=process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/login` : "/login";
/**
 * 合并配置，添加 basePath 支持
 */
export const authConfig: NextAuthConfig = {
  ...baseConfig,
  // NextAuth basePath 是相对于 Next.js 应用的，不需要包含 Next.js basePath
  basePath: "/api/auth",
  // pages 路径需要相对于根路径，NextAuth 会自动添加 basePath
  pages: {
    signIn: signInPath,
  },
  // 确保信任所有主机（在反向代理后面时需要）
  trustHost: true,
  // 禁用自动错误重定向，让客户端处理错误
  debug: process.env.NODE_ENV === "development",
}
