import mongoose, { Schema, Document } from 'mongoose'

// ─── User Interface ──────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string
  passwordHash: string
  name: string
  createdAt: Date
}

// ─── User Schema ─────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // select: false ensures passwordHash is NEVER returned in API responses
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const User = mongoose.model<IUser>('User', UserSchema)
