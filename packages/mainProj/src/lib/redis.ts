import { Redis } from "ioredis"
import {getUserInfo} from "./user-roles";

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
        retryStrategy: (times) => {
          if (times <= 3) {
            return 3000; // 前3次失败后每3秒重试
          }
          return 20000;     //return NULL放弃重连
        },
      })
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

}