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

// ─── CORS (secure, origin-allowlisted) ───────────────────────────────────────
// FIX: was `cors()` with no config — accepted any origin.
// Now explicitly allowlisted; credentials: true required for HttpOnly cookies.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) and allowlisted browsers
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`))
      }
    },
    credentials: true, // Required for HttpOnly cookie transport
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Body / Cookie parsers ────────────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/boards', boardsRouter)

// ─── HTTP Server (shared between REST and WebSocket) ─────────────────────────
// FIX: Was spinning up a SECOND http.Server on port 4001 for Yjs WebSocket.
// Now both REST and WebSocket share the same server on one port.
// This eliminates double SSL termination, double CORS config, and simplifies
// reverse proxy / load balancer setup.

const server = http.createServer(app)

// Attach Yjs WebSocket upgrade handler to the shared server
attachYjsWebSocket(server)

// ─── Start ────────────────────────────────────────────────────────────────────

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`)
    console.log(`[server] WebSocket: ws://localhost:${PORT}/yjs/:boardId`)
    console.log(`[server] REST:      http://localhost:${PORT}/health|/auth|/boards`)
  })
})

export { server }
