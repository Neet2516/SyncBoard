import bcrypt from 'bcryptjs'
import type { IUser } from '../../models/User'
import { User } from '../../models/User'
import { env } from '../../config/env'
import type { AuthenticatedUser } from '../../types/auth'
import { authStoreService, AuthStoreService } from './authStoreService'

export class AuthService {
  constructor(private readonly store = authStoreService) {}

  private toAuthenticatedUser(user: Pick<IUser, '_id' | 'email' | 'name'>): AuthenticatedUser {
    return {
      userId: String(user._id),
      email: user.email,
      name: user.name,
    }
  }

  async register(input: { fullName: string; email: string; password: string }) {
    const existingUser = await User.findOne({ email: input.email }).select('_id')
    if (existingUser) {
      return { error: 'An account with this email already exists.', status: 409 as const }
    }

    const passwordHash = await bcrypt.hash(input.password, env.bcryptSaltRounds)

    try {
      const user = await User.create({
        email: input.email,
        passwordHash,
        name: input.fullName,
      })

      return { user: this.toAuthenticatedUser(user), status: 201 as const }
    } catch (error: any) {
      if (error?.code === 11000) {
        return { error: 'An account with this email already exists.', status: 409 as const }
      }

      throw error
    }
  }

  async login(input: { email: string; password: string }) {
    const user = await User.findOne({ email: input.email }).select('+passwordHash name email')
    if (!user) {
      return { error: 'Invalid email or password.', status: 401 as const }
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isValid) {
      return { error: 'Invalid email or password.', status: 401 as const }
    }

    const authUser = this.toAuthenticatedUser(user)
    const sessionToken = await this.store.createSession(authUser)

    return {
      user: authUser,
      sessionToken,
      status: 200 as const,
    }
  }

  async getAuthenticatedUser(sessionToken: string) {
    const session = await this.store.getSession(sessionToken)
    if (!session) {
      return null
    }

    const cachedUser = await this.store.getCachedUser(session.userId)
    if (cachedUser) {
      return cachedUser
    }

    const user = await User.findById(session.userId).select('name email')
    if (!user) {
      await this.store.destroySession(sessionToken)
      return null
    }

    const authUser = this.toAuthenticatedUser(user)
    await this.store.cacheUser(authUser)
    return authUser
  }

  async logout(sessionToken: string) {
    await this.store.destroySession(sessionToken)
  }

  async issueTemporaryToken(userId: string, purpose: string) {
    return this.store.storeTemporaryToken(userId, purpose)
  }

  async consumeTemporaryToken(token: string, purpose: string) {
    return this.store.consumeTemporaryToken(token, purpose)
  }
}

export const authService = new AuthService(authStoreService)
