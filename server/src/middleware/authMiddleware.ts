import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

/**
 * authMiddleware
 *
 * SECURITY FIX: JWT is now read from the HttpOnly 'auth_token' cookie
 * (set by /auth/login). The Authorization Bearer header is kept as a
 * fallback for backward-compat during migration and for API clients / tests.
 *
 * HttpOnly cookies cannot be read by JavaScript, so even if an XSS
 * vulnerability exists in the rich-text editor (Quill), the attacker
 * cannot exfiltrate the session token.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('[auth] JWT_SECRET is not defined in environment variables')
    return res.status(500).json({ error: 'Internal server error' })
  }

  // 1. Prefer HttpOnly cookie
  const cookieToken: string | undefined = req.cookies?.['auth_token']

  // 2. Fallback: Authorization: Bearer <token>
  const authHeader = req.headers.authorization
  const headerToken =
    authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined

  const token = cookieToken ?? headerToken

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' })
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; email: string }
    req.user = { userId: decoded.userId, email: decoded.email }
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' })
  }
}
