import http, { IncomingMessage } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Board } from './models/Board'

function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) {
    return {}
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...valueParts] = part.trim().split('=')
    if (!key) {
      return acc
    }

    acc[key] = decodeURIComponent(valueParts.join('='))
    return acc
  }, {})
}

function extractToken(req: IncomingMessage) {
  const authHeader = req.headers['authorization']
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }

  const cookies = parseCookies(req.headers.cookie)
  if (cookies['auth_token']) {
    return cookies['auth_token']
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`)
  return url.searchParams.get('token') ?? undefined
}

function extractBoardId(req: IncomingMessage) {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  const segments = url.pathname.split('/').filter(Boolean)
  return segments[1]
}

async function verifyWsAccess(req: IncomingMessage) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return { allowed: false as const, status: 500 }
  }

  const origin = req.headers.origin
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (origin && !allowedOrigins.includes(origin)) {
    return { allowed: false as const, status: 403 }
  }

  const token = extractToken(req)
  const boardId = extractBoardId(req)

  if (!token || !boardId) {
    return { allowed: false as const, status: 401 }
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; email: string }
    const objectUserId = new mongoose.Types.ObjectId(decoded.userId)

    const board = await Board.findOne({
      boardId,
      $or: [{ ownerId: objectUserId }, { collaboratorIds: objectUserId }],
    }).select('_id')

    if (!board) {
      return { allowed: false as const, status: 403 }
    }

    return { allowed: true as const, status: 200, boardId }
  } catch {
    return { allowed: false as const, status: 401 }
  }
}

export function attachYjsWebSocket(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const boardId = extractBoardId(req) || 'default-room'
    setupWSConnection(ws, req, { docName: boardId, gc: true })
  })

  server.on('upgrade', async (request: IncomingMessage, socket, head) => {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`)

    if (!pathname?.startsWith('/yjs/')) {
      socket.destroy()
      return
    }

    const auth = await verifyWsAccess(request)

    if (!auth.allowed) {
      const statusText =
        auth.status === 403 ? '403 Forbidden' :
        auth.status === 500 ? '500 Internal Server Error' :
        '401 Unauthorized'
      socket.write(`HTTP/1.1 ${statusText}\r\n\r\n`)
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })

  console.log('[yjs-ws] WebSocket handler attached — path: /yjs/:boardId')
}
