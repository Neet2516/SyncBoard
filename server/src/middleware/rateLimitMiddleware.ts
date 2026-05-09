import type { NextFunction, Request, Response } from 'express'
import { authStoreService } from '../services/auth/authStoreService'

export function createRateLimitMiddleware(prefix: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const forwardedFor = req.headers['x-forwarded-for']
      const clientIp =
        typeof forwardedFor === 'string'
          ? forwardedFor.split(',')[0]?.trim()
          : req.ip || 'unknown'
      const key = `${prefix}:${clientIp || 'unknown'}`
      const result = await authStoreService.consumeRateLimit(key)

      res.setHeader('X-RateLimit-Remaining', String(result.remaining))

      if (!result.allowed) {
        res.setHeader('Retry-After', String(result.retryAfterSeconds))
        return res.status(429).json({
          error: 'Too many authentication attempts. Please try again in a few minutes.',
        })
      }

      next()
    } catch (error) {
      console.error('[auth] Rate limit error:', error)
      next()
    }
  }
}
