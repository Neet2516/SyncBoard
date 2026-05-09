import crypto from 'crypto'
import { env } from '../../config/env'
import type { AuthenticatedUser, SessionRecord } from '../../types/auth'
import { HybridKeyValueStore, KeyValueStore } from '../infrastructure/keyValueStore'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

interface TemporaryTokenRecord {
  userId: string
  purpose: string
  createdAt: string
}

export class AuthStoreService {
  constructor(
    private readonly store: KeyValueStore,
    private readonly options = {
      redisPrefix: env.redisPrefix,
      sessionTtlSeconds: env.authSessionTtlSeconds,
      userCacheTtlSeconds: env.userCacheTtlSeconds,
    }
  ) {}

  private buildKey(type: string, value: string) {
    return `${this.options.redisPrefix}:auth:${type}:${value}`
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  async createSession(user: AuthenticatedUser) {
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionRecord: SessionRecord = {
      ...user,
      sessionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    await this.store.set(
      this.buildKey('session', this.hashToken(sessionToken)),
      JSON.stringify(sessionRecord),
      this.options.sessionTtlSeconds
    )

    await this.cacheUser(user)

    return sessionToken
  }

  async getSession(sessionToken: string) {
    const rawSession = await this.store.get(this.buildKey('session', this.hashToken(sessionToken)))
    if (!rawSession) {
      return null
    }

    await this.store.expire(
      this.buildKey('session', this.hashToken(sessionToken)),
      this.options.sessionTtlSeconds
    )

    return JSON.parse(rawSession) as SessionRecord
  }

  async destroySession(sessionToken: string) {
    await this.store.delete(this.buildKey('session', this.hashToken(sessionToken)))
  }

  async cacheUser(user: AuthenticatedUser) {
    await this.store.set(
      this.buildKey('user', user.userId),
      JSON.stringify(user),
      this.options.userCacheTtlSeconds
    )
  }

  async getCachedUser(userId: string) {
    const rawUser = await this.store.get(this.buildKey('user', userId))
    return rawUser ? (JSON.parse(rawUser) as AuthenticatedUser) : null
  }

  async invalidateUserCache(userId: string) {
    await this.store.delete(this.buildKey('user', userId))
  }

  async storeTemporaryToken(userId: string, purpose: string, ttlSeconds = env.tempAuthStateTtlSeconds) {
    const token = crypto.randomBytes(24).toString('hex')
    const record: TemporaryTokenRecord = {
      userId,
      purpose,
      createdAt: new Date().toISOString(),
    }

    await this.store.set(this.buildKey(`token:${purpose}`, token), JSON.stringify(record), ttlSeconds)
    return token
  }

  async consumeTemporaryToken(token: string, purpose: string) {
    const key = this.buildKey(`token:${purpose}`, token)
    const rawValue = await this.store.get(key)

    if (!rawValue) {
      return null
    }

    await this.store.delete(key)
    return JSON.parse(rawValue) as TemporaryTokenRecord
  }

  async consumeRateLimit(key: string, maxRequests = env.authRateLimitMaxRequests, windowSeconds = env.authRateLimitWindowSeconds): Promise<RateLimitResult> {
    const namespacedKey = this.buildKey('rate-limit', key)
    const current = await this.store.increment(namespacedKey)

    if (current === 1) {
      await this.store.expire(namespacedKey, windowSeconds)
    }

    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
      retryAfterSeconds: windowSeconds,
    }
  }
}

export const authStoreService = new AuthStoreService(new HybridKeyValueStore())
