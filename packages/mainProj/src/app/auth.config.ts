import { cookies } from "next/headers"
import { createSharedAuthConfig } from "@fjsei/shared-auth-config"
import { createServerUrqlClient } from "@/auth/urql"

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
    const result = await client.mutation(
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
      }
    ).toPromise()

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
    cookieStore.set("refreshToken", authData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60, // 60 天
      path: "/api/refresh-token",
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
export const authConfig = createSharedAuthConfig({
  authorize,
})
