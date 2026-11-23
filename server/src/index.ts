import http from 'http'
import path from 'path'
import fs from 'fs'
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

// CORS (allow all origins, reflecting requesting origin to support credentials)
const ALLOWED_ORIGINS = env.allowedOrigins

console.log(`[server] Allowed Origins:`, ALLOWED_ORIGINS)

const corsOptions: CorsOptions = {
  origin: (
    _origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow all origins (reflects the requesting origin so credentials: true works)
    callback(null, true)
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

// In production or fullstack container, serve built client SPA if present
const clientDistPath = process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist')
if (fs.existsSync(clientDistPath)) {
  console.log(`[server] Serving static client from: ${clientDistPath}`)
  app.use(express.static(clientDistPath))
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/health') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/boards') ||
      req.path.startsWith('/yjs')
    ) {
      return next()
    }
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

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
