import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { formatDate } from '../utils'
import { ApiBoard, PaginatedBoards } from '../types/yjsSchema'

const PAGE_SIZE = 20

/**
 * BoardList Page (Dashboard)
 *
 * FIX: Consumes paginated GET /boards response (boards, total, hasMore).
 * Supports load-more and optional search filtering.
 */
export function BoardList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { logout } = useAuth()

  const [boards, setBoards] = useState<ApiBoard[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = useCallback(async (pageNum: number, searchTerm: string, append = false) => {
    try {
      const params: Record<string, string> = {
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      }
      if (searchTerm) params['search'] = searchTerm

      const data = await api.get<PaginatedBoards>('/boards', { params })

      setBoards((prev) => append ? [...prev, ...data.boards] : data.boards)
      setHasMore(data.hasMore)
      setTotal(data.total)
    } catch (err) {
      console.error('[BoardList] Fetch error:', err)
      const message = err instanceof Error ? err.message : 'Failed to load boards.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [showToast])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    fetchBoards(1, search, false)
  }, [search, fetchBoards])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setLoadingMore(true)
    fetchBoards(nextPage, search, true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleCreateBoard = async () => {
    const name = window.prompt('Enter board name:')
    if (!name || name.trim() === '') return

    try {
      const newBoard = await api.post<ApiBoard>('/boards', { name })
      showToast('Board created successfully.', 'success')
      navigate(`/board/${newBoard.boardId}`)
    } catch (err) {
      console.error('[BoardList] Create error:', err)
      showToast(err instanceof Error ? err.message : 'Error creating board.', 'error')
    }
  }

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm('Are you sure you want to delete this board?')) return

    try {
      await api.delete(`/boards/${id}`)
      showToast('Board deleted successfully.', 'success')
      setBoards((prev) => prev.filter((b) => b._id !== id))
      setTotal((t) => t - 1)
    } catch (err) {
      console.error('[BoardList] Delete error:', err)
      showToast(err instanceof Error ? err.message : 'Error deleting board.', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Best-effort logout
    }
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your boards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">SyncBoard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreateBoard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            + Create Board
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-10">
        {/* Title + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Boards</h2>
            <span className="text-sm text-gray-500">
              {total} {total === 1 ? 'board' : 'boards'}{search ? ` matching "${search}"` : ''}
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search boards…"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <button
              type="submit"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput('') }}
                className="text-gray-400 hover:text-gray-700 text-sm px-2"
              >
                ✕ Clear
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {search ? 'No boards match your search' : 'No boards yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Try a different search term.' : 'Create your first board to start collaborating.'}
            </p>
            {!search && (
              <button
                onClick={handleCreateBoard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <div key={board._id} className="relative group">
                  <Link
                    to={`/board/${board.boardId}`}
                    className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all h-full"
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {board.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Created on {formatDate(board.createdAt)}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Open Board
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDeleteBoard(e, board._id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50 z-10"
                    title="Delete Board"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : `Load More (${total - boards.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
