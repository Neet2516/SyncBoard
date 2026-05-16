import { Router, Response } from 'express'
import mongoose from 'mongoose'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { Board } from '../models/Board'
import { User } from '../models/User'
import cloudinary from '../utils/cloudinary'
import { authStoreService } from '../services/auth/authStoreService'

const router = Router()

router.use(authMiddleware)

function findBoardLookup(boardIdentifier: string) {
  return mongoose.Types.ObjectId.isValid(boardIdentifier)
    ? { $or: [{ _id: boardIdentifier }, { boardId: boardIdentifier }] }
    : { boardId: boardIdentifier }
}

function buildBoardMemberFilter(boardIdentifier: string, userId: string) {
  const objectUserId = new mongoose.Types.ObjectId(userId)

  return {
    ...findBoardLookup(boardIdentifier),
    $or: [{ ownerId: objectUserId }, { collaboratorIds: objectUserId }],
  }
}

async function findBoardForUser(boardIdentifier: string, userId?: string) {
  if (!userId) {
    return null
  }

  return Board.findOne(buildBoardMemberFilter(boardIdentifier, userId))
}

function serializeBoard(board: any) {
  const collaborators = Array.isArray(board.collaborators)
    ? board.collaborators.map((collaborator: any) => ({
        userId: String(collaborator._id),
        name: collaborator.name,
        email: collaborator.email,
      }))
    : undefined

  return {
    _id: String(board._id),
    boardId: board.boardId,
    name: board.name,
    ownerId: String(board.ownerId),
    collaboratorIds: (board.collaboratorIds ?? []).map((id: mongoose.Types.ObjectId | string) => String(id)),
    snapshotUrl: board.snapshotUrl,
    createdAt: board.createdAt,
    collaborators,
  }
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 20))
    const skip = (page - 1) * limit
    const search = (req.query['search'] as string | undefined)?.trim()

    const objectUserId = new mongoose.Types.ObjectId(userId)
    const filter: Record<string, unknown> = {
      $or: [{ ownerId: objectUserId }, { collaboratorIds: objectUserId }],
    }

    if (search) {
      filter['name'] = {
        $regex: `^${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        $options: 'i',
      }
    }

    const [boards, total] = await Promise.all([
      Board.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Board.countDocuments(filter),
    ])

    res.json({
      boards: boards.map(serializeBoard),
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
    res.status(201).json(serializeBoard(board))
  } catch (error) {
    console.error('[boards] POST / error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId

    const board = await findBoardForUser(id, userId)

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    const hydratedBoard = await Board.findById(board._id).populate('collaboratorIds', 'name email').lean()

    if (!hydratedBoard) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json(
      serializeBoard({
        ...hydratedBoard,
        collaborators: hydratedBoard.collaboratorIds,
      })
    )
  } catch (error) {
    console.error(`[boards] GET /${req.params['id']} error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/join', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const objectUserId = new mongoose.Types.ObjectId(userId)
    const board = await Board.findOne(findBoardLookup(id))

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    if (String(board.ownerId) === userId) {
      const hydratedOwnerBoard = await Board.findById(board._id).populate('collaboratorIds', 'name email').lean()

      if (!hydratedOwnerBoard) {
        return res.status(404).json({ error: 'Board not found' })
      }

      return res.json({
        message: 'You already own this board.',
        board: serializeBoard({
          ...hydratedOwnerBoard,
          collaborators: hydratedOwnerBoard.collaboratorIds,
        }),
      })
    }

    const isCollaborator = board.collaboratorIds.some((collaboratorId) => String(collaboratorId) === userId)

    if (!isCollaborator) {
      await Board.updateOne({ _id: board._id }, { $addToSet: { collaboratorIds: objectUserId } })
    }

    const updatedBoard = await Board.findById(board._id).populate('collaboratorIds', 'name email').lean()

    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json({
      message: isCollaborator ? 'You already have access to this board.' : 'Board joined successfully.',
      board: serializeBoard({
        ...updatedBoard,
        collaborators: updatedBoard.collaboratorIds,
      }),
    })
  } catch (error) {
    console.error(`[boards] POST /${req.params['id']}/join error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/collaborators', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const rateLimitKey = `invite:${userId}:${id}`
    const rateLimit = await authStoreService.consumeRateLimit(rateLimitKey, 10, 60) // 10 invites per minute per board/user

    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Too many invites. Please wait a minute and try again.' })
    }

    const board = await Board.findOne({
      ownerId: new mongoose.Types.ObjectId(userId),
      ...findBoardLookup(id),
    })

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' })
    }

    const user = await User.findOne({ email }).lean()
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' })
    }

    if (String(board.ownerId) === String(user._id)) {
      return res.status(400).json({ error: 'Board owner already has access' })
    }

    await Board.updateOne({ _id: board._id }, { $addToSet: { collaboratorIds: user._id } })

    const updatedBoard = await Board.findById(board._id).populate('collaboratorIds', 'name email').lean()

    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json({
      message: 'Collaborator added successfully',
      board: serializeBoard({
        ...updatedBoard,
        collaborators: updatedBoard.collaboratorIds,
      }),
    })
  } catch (error) {
    console.error(`[boards] POST /${req.params['id']}/collaborators error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id/collaborators/:collaboratorId', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const collaboratorId = Array.isArray(req.params['collaboratorId'])
      ? req.params['collaboratorId'][0]
      : req.params['collaboratorId']
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!mongoose.Types.ObjectId.isValid(collaboratorId)) {
      return res.status(400).json({ error: 'Invalid collaborator id' })
    }

    const board = await Board.findOne({
      ownerId: new mongoose.Types.ObjectId(userId),
      ...findBoardLookup(id),
    })

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' })
    }

    await Board.updateOne(
      { _id: board._id },
      { $pull: { collaboratorIds: new mongoose.Types.ObjectId(collaboratorId) } }
    )

    const updatedBoard = await Board.findById(board._id).populate('collaboratorIds', 'name email').lean()

    if (!updatedBoard) {
      return res.status(404).json({ error: 'Board not found' })
    }

    res.json({
      message: 'Collaborator removed successfully',
      board: serializeBoard({
        ...updatedBoard,
        collaborators: updatedBoard.collaboratorIds,
      }),
    })
  } catch (error) {
    console.error(
      `[boards] DELETE /${req.params['id']}/collaborators/${req.params['collaboratorId']} error:`,
      error
    )
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId

    const board = await Board.findOne({
      ownerId: new mongoose.Types.ObjectId(userId),
      ...findBoardLookup(id),
    })

    if (!board) {
      return res.status(404).json({ error: 'Board not found or you are not the owner' })
    }

    await Board.deleteOne({ _id: board._id })
    res.json({ message: 'Board deleted successfully' })
  } catch (error) {
    console.error(`[boards] DELETE /${req.params['id']} error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/snapshot', async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id']
    const userId = req.user?.userId
    const { image } = req.body // base64 image string

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' })
    }

    const board = await findBoardForUser(id, userId)
    if (!board) {
      return res.status(404).json({ error: 'Board not found or access denied' })
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'syncboard-snapshots',
      resource_type: 'image',
    })

    await Board.updateOne(
      { _id: board._id },
      { $set: { snapshotUrl: uploadResponse.secure_url } }
    )

    res.json({
      message: 'Snapshot uploaded successfully',
      snapshotUrl: uploadResponse.secure_url,
    })
  } catch (error) {
    console.error(`[boards] POST /${req.params['id']}/snapshot error:`, error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
