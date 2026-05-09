import type { CookieOptions } from 'express'
import { env, isProduction } from './env'

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: env.authSessionTtlSeconds * 1000,
    path: '/',
  }
}

export function getClearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  }
}
