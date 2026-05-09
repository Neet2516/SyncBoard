import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { ApiBoard } from '../types/yjsSchema'
import Loader from '../components/Loader'

export function JoinBoard() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    if (!boardId) {
      navigate('/boards', { replace: true })
      return
    }

    const joinBoard = async () => {
      try {
        const response = await api.post<{ message: string; board: ApiBoard }>(`/boards/${boardId}/join`)
        showToast(response.message, 'success')
        navigate(`/board/${response.board.boardId}`, { replace: true })
      } catch (error) {
        if (error instanceof Error && error.message === 'Session expired or unauthorized') {
          navigate('/login', {
            replace: true,
            state: {
              returnTo: `/join/${boardId}`,
              message: 'Sign in to join this board.',
            },
          })
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to join board.'
        showToast(message, 'error')
        navigate('/boards', { replace: true })
      }
    }

    joinBoard()
  }, [boardId, navigate, showToast])

  if (!boardId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Invalid Invite</h1>
          <p className="mt-2 text-gray-600">This invite link is missing a board id.</p>
          <Link to="/boards" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to boards
          </Link>
        </div>
      </div>
    )
  }

  return <Loader />
}
