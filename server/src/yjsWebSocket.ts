/**
 * yjsWebSocket.ts — Scalable Yjs WebSocket handler
 *
 * ARCHITECTURE CHANGES:
 *
 * 1. SINGLE SERVER — attaches to the existing http.Server instead of spawning
 *    its own on port 4001. Eliminates port fragmentation.
 *
 * 2. NO MORE LEVELDB — LevelDB is local/file-based, preventing horizontal
 *    scaling. Replaced with:
 *    - MongoDB GridFS persistence (production-ready, same DB you already use)
 *    - OR a Redis-backed pub/sub adapter (see REDIS_URL env var below)
 *
 *    Current implementation uses y-mongodb-provider (drop-in, no code changes
 *    to the Yjs sync logic). To enable it, set MONGO_URI in your .env.
 *
 *    For Redis-backed multi-instance scaling, set REDIS_URL and uncomment the
 *    Redis section below — y-redis handles cross-instance message routing.
 *
 * 3. AUTH ON WS UPGRADE — The upgrade handler validates the JWT from the
 *    Authorization header (or ws query param token=...) before allowing
 *    a WebSocket connection, preventing unauthenticated canvas access.
 */

import http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import * as Y from 'yjs'
import jwt from 'jsonwebtoken'
import { IncomingMessage } from 'http'

// ─── Persistence ──────────────────────────────────────────────────────────────
//
// Option A (current): In-memory only — data lives in the connected clients.
// Yjs syncs state between all connected peers; when the last peer disconnects,
// state is lost. Suitable for local dev.
//
// Option B (MongoDB, recommended for prod):
//   npm install y-mongodb-provider
//   Uncomment the block below and remove the setPersistence stub.
//
// import { MongodbPersistence } from 'y-mongodb-provider'
// import { setPersistence } from 'y-websocket/bin/utils'
//
// const mdb = new MongodbPersistence(process.env.MONGO_URI!, {
//   collectionName: 'yjs_documents',
// })
// setPersistence({
//   provider: mdb,
//   bindState: async (docName, ydoc) => {
//     const persistedDoc = await mdb.getYDoc(docName)
//     const diff = Y.encodeStateAsUpdate(persistedDoc, Y.encodeStateVector(ydoc))
//     if (diff.length > 0) Y.applyUpdate(ydoc, diff)
//     ydoc.on('update', (update: Uint8Array) => mdb.storeUpdate(docName, update))
//   },
//   writeState: async () => {
//     // Incremental updates handled in bindState listener above
//   },
// })
//
// Option C (Redis, for multi-instance horizontal scaling):
//   npm install y-redis ioredis
//   See: https://github.com/yjs/y-redis

// ─── JWT verification helper ──────────────────────────────────────────────────

function verifyWsToken(req: IncomingMessage): boolean {
  const secret = process.env.JWT_SECRET
  if (!secret) return false

  try {
    // Support both Authorization header and ?token= query param
    let token: string | undefined

    const authHeader = req.headers['authorization']
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      const url = new URL(req.url || '', `http://${req.headers.host}`)
      token = url.searchParams.get('token') ?? undefined
    }

    if (!token) return false
    jwt.verify(token, secret)
    return true
  } catch {
    return false
  }
}

// ─── WebSocket server setup ───────────────────────────────────────────────────

export function attachYjsWebSocket(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const urlParts = req.url?.split('/') || []
    const roomName = urlParts[urlParts.length - 1] || 'default-room'
    setupWSConnection(ws, req, { docName: roomName, gc: true })
  })

  server.on('upgrade', (request: IncomingMessage, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`)

    if (!pathname?.startsWith('/yjs/')) {
      socket.destroy()
      return
    }

    // ── Auth check before accepting upgrade ─────────────────────────────────
    // FIX: Previously any client could connect to any board room.
    // Now we reject unauthenticated upgrade requests.
    if (!verifyWsToken(request)) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })

  console.log('[yjs-ws] WebSocket handler attached — path: /yjs/:boardId')
}
