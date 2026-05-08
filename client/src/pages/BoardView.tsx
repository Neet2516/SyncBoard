import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Awareness } from 'y-protocols/awareness'
import { useYjsDoc } from '../hooks/useYjsDoc'
import { BoardCanvas } from '../components/BoardCanvas'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { ApiBoard, BoardCollaborator } from '../types/yjsSchema'
import { useAuth } from '../context/AuthContext'

/**
 * BoardView Page
 *
 * FIX: Removed inline fetch with localStorage token.
 * Now uses the shared api client (credentials:'include') consistently.
 * Also removed the hardcoded 'http://localhost:4000' fallback.
 */
export function BoardView() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  const [board, setBoard] = useState<ApiBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const { yNodes, yEdges, yTexts, awareness, connected } = useYjsDoc(boardId || '')
  const isOwner = user?.id === board?.ownerId
  const activeUsers = useActiveUsers(awareness)
  const collaboratorCount = useMemo(() => board?.collaborators?.length ?? board?.collaboratorIds.length ?? 0, [board])

  const handleDelete = async () => {
    if (!board) return
    if (!window.confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/boards/${board._id}`)
      showToast('Board deleted successfully', 'success')
      navigate('/boards')
    } catch (err) {
      console.error('[BoardView] Delete error:', err)
      showToast(err instanceof Error ? err.message : 'Failed to delete board', 'error')
    }
  }

  const handleRemoveCollaborator = async (collaborator: BoardCollaborator) => {
    if (!board) return
    if (!window.confirm(`Remove ${collaborator.name} from this board?`)) return

    try {
      const response = await api.delete<{ message: string; board: ApiBoard }>(
        `/boards/${board._id}/collaborators/${collaborator.userId}`
      )
      setBoard(response.board)
      showToast(response.message, 'success')
    } catch (err) {
      console.error('[BoardView] Remove collaborator error:', err)
      showToast(err instanceof Error ? err.message : 'Failed to remove collaborator', 'error')
    }
  }

  useEffect(() => {
    if (!boardId) return

    const fetchBoardMetadata = async () => {
      try {
        const data = await api.get<ApiBoard>(`/boards/${boardId}`)
        setBoard(data)
      } catch (err) {
        console.error('[BoardView] Fetch error:', err)
        const message = err instanceof Error ? err.message : 'Failed to load board.'

        // AuthGuard will handle redirection if the session is invalid
        // upon page load or re-authentication.
        setError(message)
        showToast(message, 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchBoardMetadata()
  }, [boardId, navigate, showToast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Board not found'}</p>
          <Link to="/boards" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/boards" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800 truncate max-w-md">
            {board.name}
          </h1>
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-xs font-medium text-gray-600">
              {connected ? 'Live' : 'Reconnecting...'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <PresenceAvatars activeUsers={activeUsers} />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 font-medium">
            {collaboratorCount} collaborator{collaboratorCount === 1 ? '' : 's'}
          </div>
          {isOwner && (
            <button
              onClick={() => setShareOpen(true)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
          )}
          <div className="text-sm text-gray-500 font-medium">
            Room: <span className="text-gray-800 font-mono text-xs">{board.boardId}</span>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
              title="Delete Board"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Main Canvas Area */}
      <main className="flex-grow relative overflow-hidden">
        {awareness && (
          <BoardCanvas
            yNodes={yNodes}
            yEdges={yEdges}
            yTexts={yTexts}
            awareness={awareness}
          />
        )}
      </main>

      {shareOpen && board && isOwner && (
        <ShareModal
          board={board}
          onBoardUpdated={setBoard}
          onClose={() => {
            setShareOpen(false)
          }}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      )}
    </div>
  )
}

function useActiveUsers(awareness: Awareness | undefined) {
  const [activeUsers, setActiveUsers] = useState<Array<{ name: string; color: string }>>([])

  useEffect(() => {
    if (!awareness) return

    const sync = () => {
      const nextUsers: Array<{ name: string; color: string }> = []
      const seen = new Set<string>()

      awareness.getStates().forEach((state: any, clientId) => {
        if (clientId === awareness.clientID || !state?.user?.name || !state?.user?.color) {
          return
        }

        const key = `${state.user.name}:${state.user.color}`
        if (seen.has(key)) return
        seen.add(key)
        nextUsers.push({ name: state.user.name, color: state.user.color })
      })

      setActiveUsers(nextUsers)
    }

    awareness.on('change', sync)
    sync()

    return () => awareness.off('change', sync)
  }, [awareness])

  return activeUsers
}

function PresenceAvatars({ activeUsers }: { activeUsers: Array<{ name: string; color: string }> }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Active now</span>
      <div className="flex -space-x-2">
        {activeUsers.length === 0 ? (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
            Just you
          </span>
        ) : (
          activeUsers.map((user) => (
            <div
              key={`${user.name}-${user.color}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-sm"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ShareModal({
  board,
  onBoardUpdated,
  onClose,
  onRemoveCollaborator,
}: {
  board: ApiBoard
  onBoardUpdated: React.Dispatch<React.SetStateAction<ApiBoard | null>>
  onClose: () => void
  onRemoveCollaborator: (collaborator: BoardCollaborator) => void
}) {
  const { showToast } = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      setInviting(true)
      const response = await api.post<{ message: string; board: ApiBoard }>(
        `/boards/${board._id}/collaborators`,
        { email: inviteEmail.trim() }
      )
      onBoardUpdated(response.board)
      setInviteEmail('')
      showToast(response.message, 'success')
    } catch (err) {
      console.error('[ShareModal] Invite error:', err)
      showToast(err instanceof Error ? err.message : 'Failed to invite collaborator', 'error')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Share Board</h2>
            <p className="mt-1 text-sm text-gray-500">
              Invite teammates to collaborate on <span className="font-semibold text-gray-700">{board.name}</span>.
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleInvite} className="mb-6 flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="teammate@example.com"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Editors</h3>
          <div className="space-y-3">
            {(board.collaborators ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                No collaborators yet.
              </div>
            ) : (
              (board.collaborators ?? []).map((collaborator) => (
                <div key={collaborator.userId} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800">{collaborator.name}</p>
                    <p className="text-sm text-gray-500">{collaborator.email}</p>
                  </div>
                  <button
                    onClick={() => onRemoveCollaborator(collaborator)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
