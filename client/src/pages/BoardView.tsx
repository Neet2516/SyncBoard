import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useYjsDoc } from '../hooks/useYjsDoc'
import { BoardCanvas } from '../components/BoardCanvas'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { ApiBoard } from '../types/yjsSchema'

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

  const [board, setBoard] = useState<ApiBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { yNodes, yEdges, yTexts, awareness, connected } = useYjsDoc(boardId || '')

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

  useEffect(() => {
    if (!boardId) return

    const fetchBoardMetadata = async () => {
      try {
        const data = await api.get<ApiBoard>(`/boards/${boardId}`)
        setBoard(data)
      } catch (err) {
        console.error('[BoardView] Fetch error:', err)
        const message = err instanceof Error ? err.message : 'Failed to load board.'

        // api.ts already handles 401 by redirecting to /login
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
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 font-medium">
            Room: <span className="text-gray-800 font-mono text-xs">{board.boardId}</span>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
            title="Delete Board"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
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
    </div>
  )
}
