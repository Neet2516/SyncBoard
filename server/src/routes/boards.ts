import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { Board } from '../models/Board'

const router = Router()

// Apply authMiddleware to all routes in this router
router.use(authMiddleware)

const findBoardForUser = async (boardIdentifier: string, userId?: string) => {
  if (!userId) {
    return null
  }

  const board = mongoose.Types.ObjectId.isValid(boardIdentifier)
    ? await Board.findOne({
        ownerId: userId,
        $or: [{ _id: boardIdentifier }, { boardId: boardIdentifier }],
      })
    : await Board.findOne({
        ownerId: userId,
        boardId: boardIdentifier,
      })

  return board
}

// ─── GET /boards ─────────────────────────────────────────────────────────────
// FIX: Was fetching all boards with no limit (O(n) query + payload).
// Now supports cursor-based pagination via ?page=1&limit=20.
// Also supports ?search= for lightweight name filtering.

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    // Pagination params with safe defaults
    const page  = Math.max(1, parseInt(req.query['page'] as string, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 20))
    const skip  = (page - 1) * limit
    const search = (req.query['search'] as string | undefined)?.trim()

    const filter: mongoose.FilterQuery<typeof Board> = { ownerId: userId }
    if (search) {
      // Case-insensitive prefix search on board name
      filter['name'] = { $regex: `^${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }
    }

    const [boards, total] = await Promise.all([
      Board.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Board.countDocuments(filter),
    ])

    res.json({
      boards,
      total,
      page,
      limit,
      hasMore: skip + boards.length < total,
    })
  } catch (error) {
    console.error('[boards] GET / error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /boards ─────────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.user?.userId

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Board name is required' })
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing from token' })
    }

    const board = new Board({
      name: name.trim(),
      ownerId: new mongoose.Types.ObjectId(userId),
      collaboratorIds: [],
    })

    await board.save()

    res.status(201).json(board)
  } catch (error) {
    console.error('[boards] POST / error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /boards/:id ─────────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId

    const board = await findBoardForUser(id, userId)

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json(board)
  } catch (error) {
    console.error(`[boards] GET /${req.params['id']} error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE /boards/:id ───────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId

    const board = await findBoardForUser(id, userId)

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    await Board.deleteOne({ _id: board._id })

    res.json({ message: 'Board deleted successfully' })
  } catch (error) {
    console.error(`[boards] DELETE /${req.params['id']} error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
