import type { DefaultSession, JWT } from "next-auth"

/**
 * 扩展 NextAuth 类型定义
 * 用于添加自定义用户字段
 */
declare module "next-auth" {
  /**
   * 扩展 User 类型
   */
  interface User {
    id: string
    name?: string | null
    email?: string | null
    accessToken?: string
    refreshToken?: string
    deviceId?: string
    authorities?: Array<{ name: string }>
  }

  /**
   * 扩展 Session 类型
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      accessToken?: string
      refreshToken?: string
      authorities?: Array<{ name: string }>
      deviceId?: string
    } & DefaultSession["user"]
  }
}

/**
 * 扩展 JWT 类型
 */
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    deviceId?: string
    authorities?: Array<{ name: string }>
    user?: {
      id?: string
      name?: string
      email?: string
    }
  }
}
