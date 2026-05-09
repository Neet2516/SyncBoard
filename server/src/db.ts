import mongoose from 'mongoose'
import { env } from './config/env'
let connectionPromise: Promise<void> | null = null

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri)
      .then(() => {
        console.log(`[db] Connected to MongoDB -> ${env.mongoUri}`)
      })
      .catch((error) => {
        connectionPromise = null
        console.error('[db] MongoDB connection failed:', error)
        throw error
      })
      .then(() => undefined)
  }

  await connectionPromise
}
