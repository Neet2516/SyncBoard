export interface AuthenticatedUser {
  userId: string
  email: string
  name: string
}

export interface SessionRecord extends AuthenticatedUser {
  sessionId: string
  createdAt: string
}

export interface SessionResponse {
  user: AuthenticatedUser
}
