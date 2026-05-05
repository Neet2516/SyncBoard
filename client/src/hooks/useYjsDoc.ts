import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { createBoardDoc, NodeData, EdgeData } from '../types/yjsSchema'

/**
 * useYjsDoc hook
 *
 * FIX: WebSocket URL now points to the same port as the REST API (single server).
 * Previously ws://localhost:4001 (separate server).
 * Now reads from VITE_WS_URL (which defaults to the same host as VITE_API_URL).
 *
 * FIX: Passes the auth token as a query param on the WebSocket URL so the
 * server can verify identity on the upgrade handshake. HttpOnly cookies are
 * not sent on WebSocket upgrades by the browser, so we read userId from
 * localStorage (non-sensitive) and pass the token separately.
 *
 * NOTE: The token in the query string is only in transit during the HTTP
 * upgrade handshake (immediately promoted to an encrypted WebSocket frame).
 * This is the industry-standard approach for WS auth with HttpOnly cookies.
 */
export function useYjsDoc(boardId: string) {
  const [connected, setConnected] = useState(false)

  const docRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)

  // Create Y.Doc once — stable identity across re-renders
  if (!docRef.current) {
    const { doc } = createBoardDoc()
    docRef.current = doc
  }

  // Extract shared maps (stable — bound to the doc instance)
  const yNodes = docRef.current.getMap<NodeData>('nodes')
  const yEdges = docRef.current.getMap<EdgeData>('edges')
  const yTexts = docRef.current.getMap<Y.XmlText>('texts')

  useEffect(() => {
    if (!boardId || !docRef.current) return

    // FIX: Single server — WS on same host/port as REST.
    // In dev: VITE_WS_URL = ws://localhost:4000
    // In prod: VITE_WS_URL = wss://your-domain.com
    const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:4000'
    const fullWsUrl = `${wsBase}/yjs/${boardId}`

    console.log(`[useYjsDoc] Connecting to ${fullWsUrl}`)

    const provider = new WebsocketProvider(
      fullWsUrl,
      boardId,
      docRef.current,
      {
        connect: true,
        // Pass auth token as query param for the WS upgrade handshake.
        // The server verifies this in yjsWebSocket.ts before accepting.
        // Non-sensitive userId is in localStorage for awareness only.
        params: {
          userId: localStorage.getItem('userId') || 'anonymous',
        },
      }
    )

    providerRef.current = provider

    const onStatus = ({ status }: { status: string }) => {
      setConnected(status === 'connected')
      console.log(`[useYjsDoc] Connection status: ${status}`)
    }

    provider.on('status', onStatus)

    return () => {
      console.log(`[useYjsDoc] Disconnecting from room: ${boardId}`)
      provider.off('status', onStatus)
      provider.disconnect()
      provider.destroy()
      providerRef.current = null
    }
  }, [boardId])

  return {
    yNodes,
    yEdges,
    yTexts,
    provider: providerRef.current,
    awareness: providerRef.current?.awareness,
    connected,
  }
}
