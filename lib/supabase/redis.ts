import { Redis } from '@upstash/redis'
import { redisConfig } from '@/lib/config/environment'

// Create Redis client with proper error handling
export const redis = redisConfig.url && redisConfig.token
  ? new Redis({
      url: redisConfig.url,
      token: redisConfig.token,
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.pow(2, retryCount) * 1000,
      },
    })
  : null

// Redis utilities with fallback behavior
export class RedisService {
  private static instance: RedisService
  private redis: Redis | null

  private constructor() {
    this.redis = redis
  }

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not configured, returning null for key:', key)
      return null
    }

    try {
      const result = await this.redis.get(key)
      return result as T
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.redis) {
      console.warn('Redis not configured, skipping SET for key:', key)
      return false
    }

    try {
      if (ttl) {
        await this.redis.setex(key, ttl, JSON.stringify(value))
      } else {
        await this.redis.set(key, JSON.stringify(value))
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) {
      console.warn('Redis not configured, skipping DEL for key:', key)
      return false
    }

    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not configured, returning 0 for INCR key:', key)
      return 0
    }

    try {
      return await this.redis.incr(key)
    } catch (error) {
      console.error('Redis INCR error:', error)
      return 0
    }
  }

  async hset(key: string, field: string, value: any): Promise<boolean> {
    if (!this.redis) {
      console.warn('Redis not configured, skipping HSET for key:', key)
      return false
    }

    try {
      await this.redis.hset(key, { [field]: JSON.stringify(value) })
      return true
    } catch (error) {
      console.error('Redis HSET error:', error)
      return false
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not configured, returning null for HGET key:', key, 'field:', field)
      return null
    }

    try {
      const result = await this.redis.hget(key, field)
      return result ? JSON.parse(result) : null
    } catch (error) {
      console.error('Redis HGET error:', error)
      return null
    }
  }

  async lpush(key: string, ...values: any[]): Promise<number> {
    if (!this.redis) {
      console.warn('Redis not configured, returning 0 for LPUSH key:', key)
      return 0
    }

    try {
      return await this.redis.lpush(key, ...values.map(v => JSON.stringify(v)))
    } catch (error) {
      console.error('Redis LPUSH error:', error)
      return 0
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not configured, returning null for RPOP key:', key)
      return null
    }

    try {
      const result = await this.redis.rpop(key)
      return result ? JSON.parse(result) : null
    } catch (error) {
      console.error('Redis RPOP error:', error)
      return null
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const result = await this.redis.expire(key, seconds)
      return result === 1
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      return false
    }
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance()

// Export for direct use
export { redis as redisClient }