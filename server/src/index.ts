import http from 'http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRouter from './routes/health'
import { connectDB } from './db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/health', healthRouter)

// Create http.Server explicitly — required for y-websocket to share this instance (TASK-08)
const server = http.createServer(app)

// Connect to MongoDB, then start listening
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[server] REST API running on http://localhost:${PORT}`)
    console.log(`[server] GET /health → { status: 'ok' }`)
  })
})

export { server }
