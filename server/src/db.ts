import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/syncboard'
let connectionPromise: Promise<void> | null = null

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(MONGO_URI)
      .then(() => {
        console.log(`[db] Connected to MongoDB -> ${MONGO_URI}`)
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
