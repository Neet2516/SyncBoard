import mongoose, { Schema, Document } from 'mongoose'

// ─── Board Interface ─────────────────────────────────────────────────────────

export interface IBoard extends Document {
  /**
   * boardId is a UUID v4 — used as the Yjs room name and in the client URL.
   * This is NOT the same as MongoDB's _id (ObjectId).
   * All WebSocket room lookups use boardId, not _id.
   */
  boardId: string
  name: string
  ownerId: mongoose.Types.ObjectId
  collaboratorIds: mongoose.Types.ObjectId[]
  createdAt: Date
}

// ─── Board Schema ────────────────────────────────────────────────────────────

const BoardSchema = new Schema<IBoard>(
  {
    boardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaboratorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const Board = mongoose.model<IBoard>('Board', BoardSchema)
