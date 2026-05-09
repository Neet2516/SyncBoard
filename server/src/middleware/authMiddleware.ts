import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { getClearAuthCookieOptions } from '../config/auth'
import { authService } from '../services/auth/authService'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    name: string
  }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cookieToken: string | undefined = req.cookies?.[env.authCookieName]
  const authHeader = req.headers.authorization
  const headerToken =
    authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined

  const token = cookieToken ?? headerToken

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await authService.getAuthenticatedUser(token)
    if (!user) {
      res.clearCookie(env.authCookieName, getClearAuthCookieOptions())
      return res.status(401).json({ error: 'Session expired or unauthorized' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('[auth] Session validation error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
