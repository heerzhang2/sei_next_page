import { redis } from "@/lib/redis"

// 角色缓存管理类
export class RoleCache {
  private static readonly CACHE_PREFIX = "user_roles:"
  private static readonly CACHE_TTL = 300 // 5分钟

  static async getUserRoles(userId: string): Promise<string[]> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`

    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const roles = await this.fetchRolesFromBackend(userId)
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(roles))
      return roles
    } catch (error) {
      console.error(`Error getting roles for user ${userId}:`, error)
      return await this.fetchRolesFromBackend(userId)
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
