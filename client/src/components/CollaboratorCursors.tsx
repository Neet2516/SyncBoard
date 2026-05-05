import { useEffect, useState } from 'react'
import { Awareness } from 'y-protocols/awareness'

interface CursorState {
  user: {
    name: string
    color: string
  }
  cursor: {
    x: number
    y: number
  }
}

interface CollaboratorCursorsProps {
  awareness: Awareness
}

/**
 * CollaboratorCursors Component
 * 
 * Renders the mouse cursors of other users currently viewing the board.
 * Uses Yjs awareness protocol for real-time ephemeral state.
 */
export function CollaboratorCursors({ awareness }: CollaboratorCursorsProps) {
  const [remoteStates, setRemoteStates] = useState<Map<number, CursorState>>(new Map())

  useEffect(() => {
    const handleUpdate = () => {
      const states = awareness.getStates() as Map<number, CursorState>
      const filteredStates = new Map<number, CursorState>()

      // Filter out our own state and states without cursor data
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID && state.cursor && state.user) {
          filteredStates.set(clientId, state)
        }
      })

      setRemoteStates(filteredStates)
    }

    // Subscribe to awareness changes
    awareness.on('change', handleUpdate)
    
    // Initial sync
    handleUpdate()

    return () => {
      awareness.off('change', handleUpdate)
    }
  }, [awareness])

  return (
    <div className="collaborator-cursors pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {Array.from(remoteStates.entries()).map(([clientId, state]) => (
        <div
          key={clientId}
          className="absolute transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)`,
          }}
        >
          {/* Cursor Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: state.user.color }}
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
              fill="currentColor"
              stroke="white"
            />
          </svg>

          {/* User Name Label */}
          <div
            className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: state.user.color }}
          >
            {state.user.name}
          </div>
        </div>
      ))}
    </div>
  )
}
