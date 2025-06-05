import { redis } from "@/lib/redis"
import {getUserInfo} from "@/app/auth.config";

// 角色缓存管理类
export class RoleCache {
  private static readonly CACHE_PREFIX = "user_info:"
  private static readonly CACHE_TTL = 300 // 5分钟

  static async getUserRoles(userId: string): Promise<any> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`

    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const userinfo = await getUserInfo(userId)
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(userinfo))
      return userinfo
    } catch (error) {
      console.error(`Error getting roles for user ${userId}:`, error)
      return await getUserInfo(userId)
    }
  }

  static async clearUserRoles(userId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`
    await redis.del(cacheKey)
  }

  private static async fetchRolesFromBackend(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`${process.env.JAVA_BACKEND_URL}/api/users/${userId}/roles`, {
        headers: {
          Authorization: `Bearer ${process.env.JAVA_BACKEND_TOKEN}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.roles || []
    } catch (error) {
      console.error("Error fetching user roles from Java backend:", error)
      return []
    }
  }
}
