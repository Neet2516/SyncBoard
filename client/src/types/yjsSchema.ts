import * as Y from 'yjs'

// ─── Node Data ───────────────────────────────────────────────────────────────

export interface NodePosition {
  x: number
  y: number
}

export interface NodeData {
  id: string
  type: 'noteNode'
  position: NodePosition
  width: number
  height: number
  label?: string
}

// ─── Edge Data ───────────────────────────────────────────────────────────────

export interface EdgeData {
  id: string
  source: string   // nodeId of source
  target: string   // nodeId of target
  label?: string
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
