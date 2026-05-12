import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { createBoardDoc, NodeData, EdgeData } from '../types/yjsSchema'

/**
 * useYjsDoc hook
 *
 * Initializes and manages a Yjs document synchronized over WebSockets.
 * Handles connection lifecycle, shared types, and awareness.
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

    const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:4000'
    const fullWsUrl = `${wsBase}/yjs/${boardId}`

    console.log(`[useYjsDoc] Connecting to ${fullWsUrl}`)

    const provider = new WebsocketProvider(
      fullWsUrl,
      boardId,
      docRef.current,
      {
        connect: true,
        // Pass userId for awareness only. Authentication is handled by session cookies
        // if supported, or other mechanisms during the handshake.
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
