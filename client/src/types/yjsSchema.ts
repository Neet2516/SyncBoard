import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'

// ─── Node Data ───────────────────────────────────────────────────────────────

export interface NodePosition {
  x: number
  y: number
}

export type NodeColor = 'white' | 'blue' | 'green' | 'yellow' | 'red'

export interface NodeData {
  id: string
  type: 'noteNode'
  position: NodePosition
  width: number
  height: number
  label?: string
  color?: NodeColor
}

// ─── Edge Data ───────────────────────────────────────────────────────────────

export interface EdgeData {
  id: string
  source: string   // nodeId of source
  target: string   // nodeId of target
  sourceHandle?: NodeHandleId
  targetHandle?: NodeHandleId
  label?: string
}

export type NodeHandleSide = 'top' | 'bottom' | 'left' | 'right'

export type NodeHandleId = NodeHandleSide

// ─── NoteNode Props (React Flow custom node) ─────────────────────────────────

/**
 * Data bag passed by React Flow to every NoteNode instance.
 * React Flow merges this into: { id, type, selected, data, ... }
 */
export interface NoteNodeData extends Record<string, unknown> {
  nodeId: string
  yTexts: Y.Map<Y.XmlText>
  yNodes: Y.Map<NodeData>
  awareness: Awareness
  color?: NodeColor
}

/** Full props received by the NoteNode custom node component */
export interface NoteNodeProps {
  id: string
  data: NoteNodeData
  selected: boolean
  dragging: boolean
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiBoard {
  _id: string
  boardId: string
  name: string
  ownerId: string
  collaboratorIds: string[]
  createdAt: string
  collaborators?: BoardCollaborator[]
}

export interface PaginatedBoards {
  boards: ApiBoard[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface LoginResponse {
  userId: string
  name: string
}

export interface RegisterResponse {
  message: string
}

export interface BoardCollaborator {
  userId: string
  name: string
  email: string
}

// ─── Board Y.Doc Shape ───────────────────────────────────────────────────────

/**
 * Describes the three top-level Yjs shared data structures on a BoardDoc.
 *
 * CRITICAL RULE: yTexts (Y.Map<Y.XmlText>) is a SEPARATE top-level map.
 * Y.XmlText instances must NOT be nested inside yNodes entries.
 * Embedding them causes Quill binding deserialization failures.
 */
export interface BoardYDoc {
  doc: Y.Doc
  /** Keyed by nodeId — stores React Flow node metadata (position, size, type) */
  yNodes: Y.Map<NodeData>
  /** Keyed by edgeId — stores React Flow edge connections */
  yEdges: Y.Map<EdgeData>
  /** Keyed by nodeId — stores Quill rich-text content per node */
  yTexts: Y.Map<Y.XmlText>
}

// ─── Factory Function ────────────────────────────────────────────────────────

/**
 * Creates a new Y.Doc and extracts the three canonical shared maps.
 *
 * String keys ('nodes', 'edges', 'texts') are the source of truth.
 * All clients MUST use these exact keys to converge on the same structure.
 *
 * @returns BoardYDoc — the doc + all three typed shared maps
 */
export function createBoardDoc(): BoardYDoc {
  const doc = new Y.Doc()

  const yNodes = doc.getMap<NodeData>('nodes')
  const yEdges = doc.getMap<EdgeData>('edges')
  const yTexts = doc.getMap<Y.XmlText>('texts')

  return { doc, yNodes, yEdges, yTexts }
}
