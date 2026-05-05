declare module 'y-websocket/bin/utils' {
  import type { IncomingMessage } from 'http'
  import type { WebSocket } from 'ws'
  import type * as Y from 'yjs'

  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void

  export function setPersistence(persistence: {
    provider: unknown
    bindState: (docName: string, ydoc: Y.Doc) => void | Promise<void>
    writeState: (docName: string, ydoc: Y.Doc) => void | Promise<void>
  } | null): void
}
