import { useRef, useEffect, useState } from 'react'
import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  useReactFlow,
} from '@xyflow/react'
import Quill from 'quill'

import { QuillEditor } from './QuillEditor'
import { useYjsQuill } from '../hooks/useYjsQuill'
import { useCanvas } from '../context/CanvasContext'
import { NodeData, NoteNodeProps, type NodeHandleSide, NodeColor } from '../types/yjsSchema'

// ─── Color definitions ────────────────────────────────────────────────────────

const COLOR_MAP: Record<NodeColor, { bg: string; darkBg: string }> = {
  white:  { bg: 'bg-white',       darkBg: 'dark:bg-slate-800'       },
  blue:   { bg: 'bg-blue-50',     darkBg: 'dark:bg-blue-900/30'     },
  green:  { bg: 'bg-green-50',    darkBg: 'dark:bg-green-900/30'    },
  yellow: { bg: 'bg-yellow-50',   darkBg: 'dark:bg-yellow-900/30'   },
  red:    { bg: 'bg-red-50',      darkBg: 'dark:bg-red-900/30'      },
}

const COLOR_KEYS = Object.keys(COLOR_MAP) as NodeColor[]

// ─── Handle positions ─────────────────────────────────────────────────────────
//
// FIX: Previously both source and target handles were rendered at calc(50%)
// on the same edge, stacked on top of each other. Now we use a single
// handle per side typed as "source" with ConnectionMode.Strict on the canvas,
// which means a connection is only accepted when you drag from source to target.
// The handles are now offset (25% / 75%) on orthogonal sides to prevent
// them colliding when a node has connections on the same edge.

const SIDES: Array<{ id: NodeHandleSide; position: Position; type: 'source' | 'target' }> = [
  { id: 'top',    position: Position.Top,    type: 'source' },
  { id: 'right',  position: Position.Right,  type: 'source' },
  { id: 'bottom', position: Position.Bottom, type: 'target' },
  { id: 'left',   position: Position.Left,   type: 'target' },
]

/**
 * NoteNode Component — fully typed, no `any`
 *
 * FIX (NodeResizer): The `overflow-hidden` was on the outer wrapper div,
 * clipping the resize handle portal. The outer wrapper is now `overflow-visible`
 * and only the inner content div uses `overflow-hidden`.
 */
export function NoteNode({ id, data, selected }: NoteNodeProps) {
  const quillRef = useRef<Quill | null>(null)
  const activeQuillRef = useRef<Quill | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { activeQuill, setActiveQuill } = useCanvas()
  const { deleteElements } = useReactFlow()

  const nodeColor: NodeColor = data.color ?? 'white'
  const currentColor = COLOR_MAP[nodeColor] ?? COLOR_MAP.white

  useYjsQuill(quillRef.current, id, data.yTexts, data.awareness)

  useEffect(() => {
    if (selected && quillRef.current) setActiveQuill(quillRef.current)
  }, [selected, setActiveQuill])

  useEffect(() => {
    activeQuillRef.current = activeQuill
  }, [activeQuill])

  useEffect(() => {
    return () => {
      if (quillRef.current && activeQuillRef.current === quillRef.current) {
        setActiveQuill(null)
      }
    }
  }, [setActiveQuill])

  const updateColor = (colorName: NodeColor) => {
    const yNode = data.yNodes.get(id) as NodeData | undefined
    if (yNode) {
      data.yNodes.set(id, { ...yNode, color: colorName })
    }
  }

  const handleDelete = () => {
    // Clear active quill BEFORE deleteElements so the toolbar unmounts cleanly
    setActiveQuill(null)
    // Let RF fire an 'remove' NodeChange, which BoardCanvas handles via Yjs transaction
    deleteElements({ nodes: [{ id }] })
  }

  return (
    // ── OUTER: overflow-visible so NodeResizeControl portal is not clipped ──
    <div
      className={`note-node group relative w-full h-full transition-all duration-300 ${
        selected
          ? 'shadow-2xl ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900'
          : 'shadow-md hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => quillRef.current && setActiveQuill(quillRef.current)}
      onMouseDown={() => {
        if (quillRef.current) setActiveQuill(quillRef.current)
      }}
    >
      {/* ── INNER: overflow-hidden for content clipping only ── */}
      <div className={`h-full w-full overflow-hidden rounded-2xl flex flex-col border ${
        selected
          ? 'border-transparent'
          : 'border-gray-200 dark:border-slate-700'
      } ${currentColor.bg} ${currentColor.darkBg}`}>

        {/* Header / Action Bar */}
        <div className="node-header h-8 flex-shrink-0 flex items-center justify-between px-2 bg-black/5 dark:bg-white/5 cursor-grab active:cursor-grabbing">
          <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(c)}
                title={`Color: ${c}`}
                className={`w-3.5 h-3.5 rounded-full border border-black/10 transition-transform hover:scale-125 ${COLOR_MAP[c].bg} ${
                  nodeColor === c ? 'ring-1 ring-black/40' : ''
                }`}
              />
            ))}
          </div>

          <GripHorizontalIcon className="text-gray-400 dark:text-gray-500" />

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDelete()
            }}
            className={`p-1 rounded-md hover:bg-red-500 hover:text-white transition-colors text-gray-400 dark:text-gray-500 ${
              isHovered || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Delete Note"
          >
            <TrashIcon />
          </button>
        </div>

        {/* Editor area — flex-grow fills remaining height */}
        <div className="flex-grow relative overflow-hidden p-2 min-h-0">
          <QuillEditor quillRef={quillRef} className="h-full" />
        </div>
      </div>

      {/* ── Connection Handles ──────────────────────────────────────────────
          FIX: Placed OUTSIDE the overflow-hidden inner div.
          Each side has ONE handle. Top/Right are sources, Bottom/Left are targets.
          This gives users a clear mental model (flow top→bottom, left→right)
          and eliminates the overlap that made connections impossible.
      */}
      {SIDES.map(({ id: side, position, type }) => (
        <SideHandle key={side} side={side} position={position} type={type} />
      ))}

      {/* ── NodeResizer ─────────────────────────────────────────────────────
          FIX: Placed OUTSIDE the overflow-hidden inner div.
          The resize handle is now visible and reachable.
      */}
      <NodeResizeControl
        position="bottom-right"
        variant={ResizeControlVariant.Handle}
        minWidth={200}
        minHeight={150}
        className={`!z-40 !border-transparent transition-opacity duration-150 ${
          isHovered || selected ? '!opacity-100' : '!opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/95 dark:text-slate-200">
          <ResizeIcon />
        </div>
      </NodeResizeControl>
    </div>
  )
}

// ─── SideHandle ───────────────────────────────────────────────────────────────

function SideHandle({
  side,
  position,
  type,
}: {
  side: NodeHandleSide
  position: Position
  type: 'source' | 'target'
}) {
  // Offset handles to different percentages so they don't stack at 50%
  // Sources (top/right) sit at 30%, targets (bottom/left) sit at 70%
  const offsetPercent = type === 'source' ? '30%' : '70%'

  const style =
    position === Position.Top || position === Position.Bottom
      ? { left: offsetPercent, transform: 'translate(-50%, -50%)' }
      : { top: offsetPercent, transform: 'translate(-50%, -50%)' }

  return (
    <Handle
      id={side}
      type={type}
      position={position}
      style={style}
      className="!z-30 !w-4 !h-4 !border-2 !border-white dark:!border-slate-800 !bg-blue-500 opacity-0 group-hover:opacity-90 transition-opacity"
    />
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const GripHorizontalIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/></svg>
)

const ResizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M21 3 14 10" />
    <path d="M9 21H3v-6" />
    <path d="m3 21 7-7" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
)
