/**
 * 主项目使用 shared-auth-config 的示例
 *
 * 此文件展示了如何在 mainProj 中集成 shared-auth-config
 */

import { createServerUrqlClient } from "@/auth/urql"
import { createSharedAuthConfig, AUTHENTICATE_MUTATION, type AuthUser } from "@fjsei/shared-auth-config"

/**
 * 实现授权函数
 * 使用 mainProj 的 URQL 客户端进行 GraphQL 认证
 */
async function authorize(credentials: {
  username?: string | null
  password?: string | null
  deviceId?: string | null
}): Promise<AuthUser | null> {
  if (!credentials?.username || !credentials?.password) {
    return null
  }

  try {
    const deviceId = credentials.deviceId || ""
    const client = createServerUrqlClient(deviceId)

    const result = await client
      .mutation(AUTHENTICATE_MUTATION, {
        username: credentials.username,
        password: credentials.password,
      })
      .toPromise()

    if (result.error || !result.data?.authenticate) {
      console.error("[MainProj Auth] 认证失败:", result.error)
      return null
    }

    const authData = result.data.authenticate
    return {
      id: authData.user.id,
      name: authData.user.name || authData.user.username,
      email: authData.user.email,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      deviceId: deviceId,
      authorities: authData.user.authorities,
    }
  } catch (error) {
    console.error("[MainProj Auth] 认证错误:", error)
    return null
  }
}

/**
 * 导出共享认证配置
 * 在 app/api/auth/[...nextauth]/route.ts 中使用
 */
export const authConfig = createSharedAuthConfig({
  authorize,
})
