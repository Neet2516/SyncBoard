import dotenv from 'dotenv'

dotenv.config()

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function readOrigins(value: string | undefined) {
  return (value || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: readNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/syncboard',
  redisUrl: process.env.REDIS_URL,
  redisPrefix: process.env.REDIS_PREFIX || 'syncboard',
  allowedOrigins: readOrigins(process.env.ALLOWED_ORIGINS),
  authCookieName: process.env.AUTH_COOKIE_NAME || 'syncboard_session',
  authSessionTtlSeconds: readNumber(process.env.AUTH_SESSION_TTL_SECONDS, 60 * 60 * 24 * 7),
  authRateLimitWindowSeconds: readNumber(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS, 60 * 10),
  authRateLimitMaxRequests: readNumber(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 5),
  bcryptSaltRounds: readNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  tempAuthStateTtlSeconds: readNumber(process.env.TEMP_AUTH_STATE_TTL_SECONDS, 60 * 10),
  userCacheTtlSeconds: readNumber(process.env.AUTH_USER_CACHE_TTL_SECONDS, 60 * 5),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
}

export const isProduction = env.nodeEnv === 'production' || process.env.VERCEL === '1' || process.env.RENDER === 'true'
