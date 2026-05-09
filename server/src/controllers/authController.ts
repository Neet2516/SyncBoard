import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { env } from '../config/env'
import { getAuthCookieOptions, getClearAuthCookieOptions } from '../config/auth'
import { authService } from '../services/auth/authService'
import { loginSchema, registerSchema } from '../validations/authSchemas'
import type { AuthRequest } from '../middleware/authMiddleware'

function formatValidationError(error: ZodError) {
  const fieldErrors = error.flatten().fieldErrors
  const firstMessage =
    Object.values(fieldErrors).flat().find(Boolean) ||
    error.flatten().formErrors.find(Boolean) ||
    'Please fix the highlighted fields.'

  return {
    error: firstMessage,
    fieldErrors,
  }
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const payload = registerSchema.parse(req.body)
      const result = await authService.register(payload)

      if ('error' in result) {
        return res.status(result.status).json({ error: result.error })
      }

      const onboardingToken = await authService.issueTemporaryToken(result.user.userId, 'signup-success')

      return res.status(result.status).json({
        message: 'Account created successfully. Please sign in.',
        user: result.user,
        onboardingToken,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatValidationError(error))
      }

      console.error('[auth] Register error:', error)
      return res.status(500).json({ error: 'Unable to create account right now.' })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const payload = loginSchema.parse(req.body)
      const result = await authService.login(payload)

      if ('error' in result) {
        return res.status(result.status).json({ error: result.error })
      }

      res.cookie(env.authCookieName, result.sessionToken, getAuthCookieOptions())

      return res.status(result.status).json({
        user: result.user,
        message: 'Signed in successfully.',
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatValidationError(error))
      }

      console.error('[auth] Login error:', error)
      return res.status(500).json({ error: 'Unable to sign in right now.' })
    }
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[env.authCookieName]

    if (token) {
      await authService.logout(token)
    }

    res.clearCookie(env.authCookieName, getClearAuthCookieOptions())
    return res.json({ message: 'Logged out successfully.' })
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.clearCookie(env.authCookieName, getClearAuthCookieOptions())
      return res.status(401).json({ error: 'Not authenticated.' })
    }

    return res.json({
      user: req.user,
    })
  },
}
