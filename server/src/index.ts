import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import healthRouter from './routes/health'
import authRouter from './routes/auth'
import boardsRouter from './routes/boards'
import { connectDB } from './db'
import { attachYjsWebSocket } from './yjsWebSocket'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const isVercel = process.env.VERCEL === '1'

// CORS (secure, origin-allowlisted)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
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
