import { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { formatDate } from '../utils'
import { ApiBoard, PaginatedBoards } from '../types/yjsSchema'
import Loader from '../components/Loader'

const PAGE_SIZE = 20

/**
 * BoardList Page (Dashboard)
 *
 * Provides a user dashboard for managing and accessing boards.
 * Supports pagination and search filtering.
 */
export function BoardList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { logout, user } = useAuth()

  const [boards, setBoards] = useState<ApiBoard[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [boardPendingDelete, setBoardPendingDelete] = useState<ApiBoard | null>(null)
  const [isDeletingBoard, setIsDeletingBoard] = useState(false)

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

  const openCreateBoardModal = () => {
    setNewBoardName('')
    setIsCreateModalOpen(true)
  }

  const closeCreateBoardModal = () => {
    if (isCreatingBoard) return
    setIsCreateModalOpen(false)
    setNewBoardName('')
  }

  const handleCreateBoard = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const name = newBoardName.trim()
    if (!name) {
      showToast('Please enter a board name.', 'error')
      return
    }

    try {
      setIsCreatingBoard(true)
      const newBoard = await api.post<ApiBoard>('/boards', { name })
      showToast('Board created successfully.', 'success')
      setIsCreateModalOpen(false)
      setNewBoardName('')
      navigate(`/board/${newBoard.boardId}`)
    } catch (err) {
      console.error('[BoardList] Create error:', err)
      showToast(err instanceof Error ? err.message : 'Error creating board.', 'error')
    } finally {
      setIsCreatingBoard(false)
    }
  }

  const handleDeleteBoard = async (e: React.MouseEvent, board: ApiBoard) => {
    e.preventDefault()
    e.stopPropagation()
    setBoardPendingDelete(board)
  }

  const closeDeleteModal = () => {
    if (isDeletingBoard) return
    setBoardPendingDelete(null)
  }

  const confirmDeleteBoard = async () => {
    if (!boardPendingDelete) return

    try {
      setIsDeletingBoard(true)
      await api.delete(`/boards/${boardPendingDelete._id}`)
      showToast('Board deleted successfully.', 'success')
      setBoards((prev) => prev.filter((b) => b._id !== boardPendingDelete._id))
      setTotal((t) => t - 1)
      setBoardPendingDelete(null)
    } catch (err) {
      console.error('[BoardList] Delete error:', err)
      showToast(err instanceof Error ? err.message : 'Error deleting board.', 'error')
    } finally {
      setIsDeletingBoard(false)
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

  const ownedBoards = boards.filter((board) => board.ownerId === user?.id)
  const sharedBoards = boards.filter((board) => board.ownerId !== user?.id)

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <nav className="border-b border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="brand-mark text-2xl text-blue-600">SyncBoard</h1>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {user && (
            <div className="rounded-full bg-white/80 px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
              {user.name}
            </div>
          )}
          <button
            onClick={openCreateBoardModal}
            className="min-h-12 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-blue-700"
          >
            + Create Board
          </button>
          <button
            onClick={handleLogout}
            className="min-h-12 rounded-full px-3 py-3 font-medium text-gray-500 transition-colors hover:text-gray-800"
          >
            Logout
          </button>
        </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8 md:py-10">
        {/* Title + Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="brand-kicker mb-2">Workspace</p>
            <h2 className="section-title text-3xl text-gray-800">My Boards</h2>
            <span className="stat-label text-sm text-gray-500">
              {total} {total === 1 ? 'board' : 'boards'}{search ? ` matching "${search}"` : ''}
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search boards…"
              className="min-h-12 w-full rounded-full border border-gray-300 bg-white/90 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
            />
            <button
              type="submit"
              className="min-h-12 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold tracking-wide text-gray-700 transition-colors hover:bg-gray-200"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput('') }}
                className="min-h-12 rounded-full px-4 py-3 text-sm font-semibold text-gray-400 hover:text-gray-700"
              >
                ✕ Clear
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div className="paper-card rounded-[2rem] border-2 border-dashed border-gray-200 p-12 text-center">
            <h3 className="panel-title mb-2 text-lg text-gray-700">
              {search ? 'No boards match your search' : 'No boards yet'}
            </h3>
            <p className="section-copy mb-6 text-base">
              {search ? 'Try a different search term.' : 'Create your first board to start collaborating.'}
            </p>
            {!search && (
              <button
                onClick={openCreateBoardModal}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </button>
            )}
          </div>
        ) : (
          <>
            <BoardSection
              title="Owned by me"
              description="Boards where you can invite teammates and manage access."
              boards={ownedBoards}
              canDelete
              onDelete={handleDeleteBoard}
            />

            <BoardSection
              title="Shared with me"
              description="Boards other people shared with you."
              boards={sharedBoards}
              canDelete={false}
              onDelete={handleDeleteBoard}
            />

            {/* Pagination */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold tracking-wide text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : `Load More (${total - boards.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="paper-card w-full max-w-md rounded-[2rem] bg-white/95 p-6">
            <div className="mb-5">
              <h3 className="panel-title text-xl text-gray-900">Create a new board</h3>
              <p className="mt-1 text-sm text-gray-500">Give your board a name to get started.</p>
            </div>

            <form onSubmit={handleCreateBoard}>
              <label htmlFor="board-name" className="stat-label mb-2 block text-sm font-semibold text-gray-700">
                Board name
              </label>
              <input
                id="board-name"
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
                autoFocus
                disabled={isCreatingBoard}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateBoardModal}
                  disabled={isCreatingBoard}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold tracking-wide text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBoard}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingBoard ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {boardPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="paper-card w-full max-w-md rounded-[2rem] bg-white/95 p-6">
            <div className="mb-5">
              <h3 className="panel-title text-xl text-gray-900">Delete board?</h3>
              <p className="mt-1 text-sm text-gray-500">
                This will permanently delete <span className="font-semibold text-gray-700">{boardPendingDelete.name}</span>.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeletingBoard}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold tracking-wide text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBoard}
                disabled={isDeletingBoard}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingBoard ? 'Deleting...' : 'Delete Board'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BoardSection({
  title,
  description,
  boards,
  canDelete,
  onDelete,
}: {
  title: string
  description: string
  boards: ApiBoard[]
  canDelete: boolean
  onDelete: (event: React.MouseEvent, board: ApiBoard) => void
}) {
  if (boards.length === 0) {
    return null
  }

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h3 className="panel-title text-lg text-gray-800">{title}</h3>
        <p className="section-copy text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div key={board._id} className="relative group">
            <Link
              to={`/board/${board.boardId}`}
              className="paper-card block h-full rounded-[1.75rem] border border-gray-200 p-6 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h4 className="panel-title truncate text-lg text-gray-800 transition-colors group-hover:text-blue-600">
                      {board.name}
                    </h4>
                    {!canDelete && (
                      <span className="stat-label rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="stat-label text-sm text-gray-400">
                    Created on {formatDate(board.createdAt)}
                  </p>
                  {!canDelete && (
                    <p className="stat-label mt-2 text-xs text-gray-500">
                      {board.collaboratorIds.length} collaborator{board.collaboratorIds.length === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold tracking-wide text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Open Board
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
            {canDelete && (
              <button
                onClick={(e) => onDelete(e, board)}
                className="absolute right-4 top-4 z-10 rounded-full p-3 text-gray-400 opacity-100 transition-all hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                title="Delete Board"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
