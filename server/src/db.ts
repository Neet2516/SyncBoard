import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/syncboard'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI)
    console.log(`[db] Connected to MongoDB → ${MONGO_URI}`)
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error)
    process.exit(1)
  }
}
