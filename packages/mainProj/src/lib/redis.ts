import { Redis } from "ioredis"
import {getUserInfo} from "./user-roles";

class RedisClient {
  private static instance: Redis | null = null

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      const client = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times <= 3) {
            return 3000; // 前3次失败后每3秒重试
          }
          return 20000;     //return NULL放弃重连
        },
      })

      // 关键：必须注册 'error' 监听器。
      // 否则 ioredis 在连接异常时 emit('error') 无监听器，
      // 会触发 Node 未捕获异常，拖垮整个 Next.js 服务进程（需要重启才能恢复）。
      client.on("error", (err) => {
        console.error("[Redis] 客户端错误:", err?.message || err)
      })
      client.on("connect", () => {
        console.log("[Redis] 已连接")
      })
      client.on("reconnecting", () => {
        console.warn("[Redis] 正在重连...")
      })
      client.on("end", () => {
        console.warn("[Redis] 连接已关闭")
      })

      RedisClient.instance = client
    }
    return RedisClient.instance
  }
}

//实例。 连接池；
export const redis = RedisClient.getInstance()


/**用户信息的缓存类 "user_info:${userId}" 作为redis的关键key;
 这个是nextjs服务器环境的代码才能使用的 全部用户数据的可缓存；
 #似乎在浏览器环境是不能复用的，浏览器端需要单独自己再发起一个后端的api去查询 getUserinfoQuery 用户数据。
* */
export class UserInfoCache {
  private static readonly CACHE_PREFIX = "user_info:"
  private static readonly CACHE_TTL = 600     //延迟10分钟才能刷新,可忍受的。

  static async getUserRoles(userId: string, accessToken?: string): Promise<string[]> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`

    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const userinfo = JSON.parse(cached)
        return userinfo?.authorities
      }

      const userinfo = await getUserInfo(userId, accessToken)
      const roles = userinfo?.authorities
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(userinfo))
      return roles
    } catch (error: any) {
      // 检查是否是 401 未授权错误
      const response = error?.response
      if (response?.status === 401) {
        console.warn(`User ${userId} is not authenticated (401)`)
        // 重新抛出错误，让调用方处理（如重定向到登录页或返回错误信息）
        throw new Error("UNAUTHORIZED: 用户未登录或登录已过期")
      }
      // 其他错误也继续抛出，不要静默处理
      console.error(`Error getting roles for user ${userId}:`, error)
      throw error
    }
  }

  static async clearUserRoles(userId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`
    await redis.del(cacheKey)
  }

}
