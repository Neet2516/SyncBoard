import Redis from 'ioredis'
import { env } from '../../config/env'

export interface KeyValueStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  increment(key: string): Promise<number>
  expire(key: string, ttlSeconds: number): Promise<void>
  disconnect(): Promise<void>
}

export class MemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, { value: string; expiresAt?: number }>()

  private prune(key: string) {
    const record = this.values.get(key)
    if (!record) return

    if (record.expiresAt && record.expiresAt <= Date.now()) {
      this.values.delete(key)
    }
  }

  async get(key: string) {
    this.prune(key)
    return this.values.get(key)?.value ?? null
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    this.values.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    })
  }

  async delete(key: string) {
    this.values.delete(key)
  }

  async increment(key: string) {
    this.prune(key)
    const current = Number(this.values.get(key)?.value ?? '0')
    const nextValue = current + 1
    const existingExpiry = this.values.get(key)?.expiresAt
    this.values.set(key, { value: String(nextValue), expiresAt: existingExpiry })
    return nextValue
  }

  async expire(key: string, ttlSeconds: number) {
    this.prune(key)
    const existing = this.values.get(key)
    if (!existing) return

    this.values.set(key, {
      value: existing.value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  async disconnect() {
    this.values.clear()
  }
}

export class HybridKeyValueStore implements KeyValueStore {
  private readonly fallback = new MemoryKeyValueStore()
  private readonly redis: Redis | null

  constructor() {
    this.redis = env.redisUrl
      ? new Redis(env.redisUrl, {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => Math.min(times * 200, 2000),
        })
      : null

    this.redis?.on('connect', () => {
      console.log('[redis] Connected')
    })

    this.redis?.on('error', (error) => {
      console.error('[redis] Connection error:', error)
    })
  }

  private async useRedis<T>(operation: (redis: Redis) => Promise<T>, fallback: () => Promise<T>) {
    if (!this.redis) {
      return fallback()
    }

    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect()
      }

      return await operation(this.redis)
    } catch (error) {
      console.error('[redis] Falling back to memory store:', error)
      return fallback()
    }
  }

  async get(key: string) {
    return this.useRedis(
      async (redis) => redis.get(key),
      () => this.fallback.get(key)
    )
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    await this.fallback.set(key, value, ttlSeconds)
    await this.useRedis(
      async (redis) => {
        if (ttlSeconds) {
          await redis.set(key, value, 'EX', ttlSeconds)
          return
        }

        await redis.set(key, value)
      },
      async () => undefined
    )
  }

  async delete(key: string) {
    await this.fallback.delete(key)
    await this.useRedis(
      async (redis) => {
        await redis.del(key)
      },
      async () => undefined
    )
  }

  async increment(key: string) {
    return this.useRedis(
      async (redis) => redis.incr(key),
      () => this.fallback.increment(key)
    )
  }

  async expire(key: string, ttlSeconds: number) {
    await this.fallback.expire(key, ttlSeconds)
    await this.useRedis(
      async (redis) => {
        await redis.expire(key, ttlSeconds)
      },
      async () => undefined
    )
  }

  async disconnect() {
    await this.fallback.disconnect()
    if (this.redis && this.redis.status !== 'end') {
      await this.redis.quit().catch(() => undefined)
    }
  }
}
