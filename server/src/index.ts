import http from 'http'
import express from 'express'
import cors from 'cors'
import type { CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'
import healthRouter from './routes/health'
import authRouter from './routes/auth'
import boardsRouter from './routes/boards'
import { connectDB } from './db'
import { attachYjsWebSocket } from './yjsWebSocket'
import { env } from './config/env'

const app = express()
const PORT = env.port
const isVercel = process.env.VERCEL === '1'

// CORS (secure, origin-allowlisted)
const ALLOWED_ORIGINS = env.allowedOrigins

console.log(`[server] Allowed Origins:`, ALLOWED_ORIGINS)

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    if (ALLOWED_ORIGINS.includes(origin) || env.nodeEnv === 'development') {
      callback(null, true)
    } else {
      console.error(`[cors] Blocked origin: ${origin}`)
      callback(new Error(`CORS: Origin '${origin}' not allowed`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}

app.use(
  cors(corsOptions)
)

app.use(express.json())
app.use(cookieParser())
app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    next(error)
  }
})

app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/boards', boardsRouter)

const server = http.createServer(app)

if (!isVercel) {
  attachYjsWebSocket(server)
}

if (!isVercel) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`[server] Running on http://localhost:${PORT}`)
      console.log(`[server] WebSocket: ws://localhost:${PORT}/yjs/:boardId`)
      console.log(`[server] REST:      http://localhost:${PORT}/health|/auth|/boards`)
    })
  })
}

export { server }
export default app
