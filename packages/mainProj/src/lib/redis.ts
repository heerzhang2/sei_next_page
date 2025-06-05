import { Redis } from "ioredis"
import {getUserInfo} from "@/app/auth.config";

class RedisClient {
  private static instance: Redis | null = null

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      })
    }
    return RedisClient.instance
  }
}

export const redis = RedisClient.getInstance()


//没用到！  Session 管理类 - 使用 Redis 存储 session
export class SessionManager {
  private static readonly SESSION_PREFIX = "session:"
  private static readonly SESSION_TTL = 1800 // 30分钟

  // 创建 session
  static async createSession(userId: string, userInfo: any): Promise<string> {
    const sessionToken = this.generateSessionToken()
    const sessionData = {
      userId,
      userInfo,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    }

    await redis.setex(`${this.SESSION_PREFIX}${sessionToken}`, this.SESSION_TTL, JSON.stringify(sessionData))
    return sessionToken
  }

  // 获取 session
  static async getSession(sessionToken: string): Promise<any | null> {
    try {
      const sessionData = await redis.get(`${this.SESSION_PREFIX}${sessionToken}`)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)

      // 更新最后访问时间并延长过期时间
      session.lastAccessed = new Date().toISOString()
      await redis.setex(`${this.SESSION_PREFIX}${sessionToken}`, this.SESSION_TTL, JSON.stringify(session))

      return session
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }

  // 删除 session
  static async deleteSession(sessionToken: string): Promise<void> {
    await redis.del(`${this.SESSION_PREFIX}${sessionToken}`)
  }

  // 生成 session token
  private static generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`
  }
}


//用户信息的缓存管理类
export class RoleCache {
  private static readonly CACHE_PREFIX = "user_info:"
  private static readonly CACHE_TTL = 600     //延迟10分钟,可忍受的。

  static async getUserRoles(userId: string,accessToken?:string): Promise<string[]> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`

    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const userinfo =JSON.parse(cached)
        return userinfo?.authorities
      }

      const userinfo = await getUserInfo(userId,accessToken)
      const roles =userinfo?.authorities
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(userinfo))
      return roles
    } catch (error) {
      console.warn(`Error getting roles for user ${userId}:`, error)
      const userinfo = await getUserInfo(userId,accessToken)
      //没开启缓存的：
      return userinfo?.authorities
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
      throw new Error(`鉴权失败: ${error}`)
    }
  }
}
