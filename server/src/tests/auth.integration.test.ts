import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User } from '../models/User'

let mongoServer: MongoMemoryServer
let app: any

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.REDIS_URL = ''
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = '5'
  process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS = '600'

  mongoServer = await MongoMemoryServer.create()
  process.env.MONGO_URI = mongoServer.getUri()

  const appModule = await import('../index.js')
  const { connectDB } = await import('../db.js')

  app = appModule.default
  await connectDB()
})

afterEach(async () => {
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('auth flow', () => {
  it('registers a user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .set('X-Forwarded-For', '10.0.0.1')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })

    expect(response.status).toBe(201)
    expect(response.body.message).toContain('Account created successfully')
    expect(response.body.user.email).toBe('jane@example.com')

    const createdUser = await User.findOne({ email: 'jane@example.com' }).select('+passwordHash')
    expect(createdUser).not.toBeNull()
    expect(createdUser?.passwordHash).not.toBe('Password1!')
  })

  it('rejects mismatched passwords', async () => {
    const response = await request(app)
      .post('/auth/register')
      .set('X-Forwarded-For', '10.0.0.2')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1!',
        confirmPassword: 'Password2!',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Passwords do not match')
  })

  it('rejects weak passwords', async () => {
    const response = await request(app)
      .post('/auth/register')
      .set('X-Forwarded-For', '10.0.0.3')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password',
        confirmPassword: 'password',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Password must be at least 8 characters')
  })

  it('rejects duplicate emails', async () => {
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'hashed',
    })

    const response = await request(app)
      .post('/auth/register')
      .set('X-Forwarded-For', '10.0.0.4')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })

    expect(response.status).toBe(409)
    expect(response.body.error).toContain('already exists')
  })

  it('creates a secure session cookie after login and restores the session', async () => {
    await request(app)
      .post('/auth/register')
      .set('X-Forwarded-For', '10.0.0.5')
      .send({
        fullName: 'Session User',
        email: 'session@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })

    const loginResponse = await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', '10.0.0.5')
      .send({
        email: 'session@example.com',
        password: 'Password1!',
      })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.headers['set-cookie']?.[0]).toContain('syncboard_session=')
    expect(loginResponse.body.user.email).toBe('session@example.com')

    const meResponse = await request(app)
      .get('/auth/me')
      .set('Cookie', loginResponse.headers['set-cookie'])

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.user.email).toBe('session@example.com')
  })

  it('rate limits repeated auth attempts', async () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await request(app)
        .post('/auth/login')
        .set('X-Forwarded-For', '10.0.0.250')
        .send({
          email: 'nobody@example.com',
          password: 'Password1!',
        })

      expect(response.status).toBe(401)
    }

    const limitedResponse = await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', '10.0.0.250')
      .send({
        email: 'nobody@example.com',
        password: 'Password1!',
      })

    expect(limitedResponse.status).toBe(429)
    expect(limitedResponse.body.error).toContain('Too many authentication attempts')
  })
})
