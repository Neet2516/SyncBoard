import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

const router = Router()

const IS_PROD = process.env.NODE_ENV === 'production'
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── Register ────────────────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password and name are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = new User({ email, passwordHash, name })
    await user.save()

    res.status(201).json({ message: 'User created' })
  } catch (error) {
    console.error('[auth] Register error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── Login ────────────────────────────────────────────────────────────────────
//
// SECURITY FIX: No longer returning the raw JWT in the response body.
// The token is set as an HttpOnly, SameSite=Strict cookie.
// This is inaccessible to JavaScript (XSS cannot steal it).
// The response body only contains non-sensitive identity info.

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('[auth] JWT_SECRET is not defined')
      return res.status(500).json({ error: 'Internal server error' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      secret,
      { expiresIn: '7d' }
    )

    // ── Set HttpOnly cookie instead of returning token in body ──────────────
    res.cookie('auth_token', token, {
      httpOnly: true,                        // JS cannot read this cookie
      secure: IS_PROD,                       // HTTPS only in production
      sameSite: IS_PROD ? 'strict' : 'lax', // CSRF protection
      maxAge: COOKIE_MAX_AGE_MS,
      path: '/',
    })

    // Only non-sensitive identity data in the response body
    res.json({
      userId: String(user._id),
      name: user.name,
    })
  } catch (error) {
    console.error('[auth] Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── Logout ───────────────────────────────────────────────────────────────────

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('auth_token', { path: '/' })
  res.json({ message: 'Logged out' })
})

// ─── Me (session check) ───────────────────────────────────────────────────────

router.get('/me', async (req: Request, res: Response) => {
  const secret = process.env.JWT_SECRET
  const token: string | undefined = req.cookies?.['auth_token']

  if (!secret || !token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; email: string }
    const user = await User.findById(decoded.userId).select('name email')
    if (!user) return res.status(401).json({ error: 'User not found' })
    res.json({ userId: String(user._id), name: user.name, email: user.email })
  } catch {
    res.clearCookie('auth_token', { path: '/' })
    res.status(401).json({ error: 'Invalid or expired session' })
  }
})

export default router
