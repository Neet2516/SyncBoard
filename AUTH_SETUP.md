## Auth Environment

Server:

```env
cp server/.env.example server/.env
```

Client:

```env
cp client/.env.example client/.env
```

## Redis Setup

Local Redis with Docker:

```bash
docker run --name syncboard-redis -p 6379:6379 -d redis:7-alpine
```

Default local connection string:

```env
REDIS_URL=redis://127.0.0.1:6379
```

## What Redis Stores

- Session records for authenticated users
- Temporary auth tokens and OTP-ready state
- Short-lived cached user identity records
- Rate limiting counters for auth endpoints

## Notes

- Session and temporary auth data use TTL-based expiration automatically.
- If Redis is unavailable, the app falls back to an in-memory store for local resilience, but production should always provide `REDIS_URL`.
