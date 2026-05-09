import Redis from 'ioredis-mock'
import { describe, expect, it } from 'vitest'
import { AuthStoreService } from '../services/auth/authStoreService'
import type { KeyValueStore } from '../services/infrastructure/keyValueStore'

class RedisMockKeyValueStore implements KeyValueStore {
  constructor(private readonly redis: any) {}

  async get(key: string) {
    return this.redis.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds)
      return
    }

    await this.redis.set(key, value)
  }

  async delete(key: string) {
    await this.redis.del(key)
  }

  async increment(key: string) {
    return this.redis.incr(key)
  }

  async expire(key: string, ttlSeconds: number) {
    await this.redis.expire(key, ttlSeconds)
  }

  async disconnect() {
    await this.redis.quit()
  }
}

describe('AuthStoreService', () => {
  it('stores and restores Redis-backed sessions', async () => {
    const redis = new Redis()
    const service = new AuthStoreService(new RedisMockKeyValueStore(redis), {
      redisPrefix: 'test',
      sessionTtlSeconds: 60,
      userCacheTtlSeconds: 60,
    })

    const token = await service.createSession({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Redis User',
    })

    const session = await service.getSession(token)
    expect(session?.userId).toBe('user-1')
    expect(session?.email).toBe('user@example.com')

    await redis.quit()
  })

  it('stores and consumes temporary auth tokens', async () => {
    const redis = new Redis()
    const service = new AuthStoreService(new RedisMockKeyValueStore(redis), {
      redisPrefix: 'test',
      sessionTtlSeconds: 60,
      userCacheTtlSeconds: 60,
    })

    const token = await service.storeTemporaryToken('user-2', 'otp', 60)
    const firstRead = await service.consumeTemporaryToken(token, 'otp')
    const secondRead = await service.consumeTemporaryToken(token, 'otp')

    expect(firstRead?.userId).toBe('user-2')
    expect(secondRead).toBeNull()

    await redis.quit()
  })

  it('handles validation edge cases with trimmed and normalized input', async () => {
    const { registerSchema } = await import('../validations/authSchemas.js')
    const parsed = registerSchema.parse({
      fullName: '  Jane   Doe  ',
      email: '  Jane@Example.com ',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    })

    expect(parsed.fullName).toBe('Jane Doe')
    expect(parsed.email).toBe('jane@example.com')
  })
})
