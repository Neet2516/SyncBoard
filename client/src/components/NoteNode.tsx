import { useRef, useEffect, useState, lazy, Suspense, useMemo } from 'react'
import {
  Handle,
  NodeResizeControl,
  Position,
  ResizeControlVariant,
  useReactFlow,
} from '@xyflow/react'
import Quill from 'quill'

import { useYjsQuill } from '../hooks/useYjsQuill'
import { useCanvas } from '../context/CanvasContext'
import { NodeData, NoteNodeProps, type NodeHandleSide, NodeColor } from '../types/yjsSchema'

const QuillEditor = lazy(() => import('./QuillEditor').then(module => ({ default: module.QuillEditor })))

const COLOR_MAP: Record<NodeColor, {
  surface: string
  border: string
  glow: string
  header: string
  pin: string
}> = {
  white: {
    surface: 'linear-gradient(165deg, rgba(255,255,255,0.82) 0%, rgba(244,247,255,0.72) 100%)',
    border: 'rgba(255,255,255,0.68)',
    glow: 'rgba(255,255,255,0.44)',
    header: 'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(241,245,249,0.14))',
    pin: 'linear-gradient(180deg, #d946ef 0%, #7c3aed 100%)',
  },
  blue: {
    surface: 'linear-gradient(165deg, rgba(226,240,255,0.78) 0%, rgba(191,219,254,0.62) 100%)',
    border: 'rgba(147,197,253,0.62)',
    glow: 'rgba(96,165,250,0.26)',
    header: 'linear-gradient(180deg, rgba(191,219,254,0.52), rgba(219,234,254,0.18))',
    pin: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
  },
  green: {
    surface: 'linear-gradient(165deg, rgba(220,252,231,0.78) 0%, rgba(187,247,208,0.62) 100%)',
    border: 'rgba(110,231,183,0.58)',
    glow: 'rgba(52,211,153,0.22)',
    header: 'linear-gradient(180deg, rgba(187,247,208,0.5), rgba(220,252,231,0.16))',
    pin: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
  },
  yellow: {
    surface: 'linear-gradient(165deg, rgba(254,249,195,0.82) 0%, rgba(254,240,138,0.6) 100%)',
    border: 'rgba(250,204,21,0.52)',
    glow: 'rgba(250,204,21,0.18)',
    header: 'linear-gradient(180deg, rgba(254,240,138,0.46), rgba(254,249,195,0.14))',
    pin: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
  },
  red: {
    surface: 'linear-gradient(165deg, rgba(255,228,230,0.8) 0%, rgba(254,205,211,0.62) 100%)',
    border: 'rgba(251,113,133,0.52)',
    glow: 'rgba(251,113,133,0.2)',
    header: 'linear-gradient(180deg, rgba(254,205,211,0.48), rgba(255,228,230,0.14))',
    pin: 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)',
  },
}

const COLOR_KEYS = Object.keys(COLOR_MAP) as NodeColor[]

const SIDES: Array<{ id: NodeHandleSide; position: Position; type: 'source' | 'target' }> = [
  { id: 'top', position: Position.Top, type: 'source' },
  { id: 'right', position: Position.Right, type: 'source' },
  { id: 'bottom', position: Position.Bottom, type: 'target' },
  { id: 'left', position: Position.Left, type: 'target' },
]

export function NoteNode({ id, data, selected }: NoteNodeProps) {
  const quillRef = useRef<Quill | null>(null)
  const activeQuillRef = useRef<Quill | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { activeQuill, setActiveQuill } = useCanvas()
  const { deleteElements } = useReactFlow()

  const nodeColor: NodeColor = data.color ?? 'white'
  const currentColor = COLOR_MAP[nodeColor] ?? COLOR_MAP.white
  const tilt = useMemo(() => {
    const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return `${((seed % 7) - 3) * 0.35}deg`
  }, [id])

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
    setActiveQuill(null)
    deleteElements({ nodes: [{ id }] })
  }

  return (
    <div
      className={`note-node group relative h-full w-full transition-all duration-300 ${
        selected
          ? 'shadow-[0_34px_80px_rgba(15,23,42,0.34)]'
          : 'shadow-[0_24px_56px_rgba(15,23,42,0.2)] hover:shadow-[0_28px_68px_rgba(15,23,42,0.26)]'
      }`}
      style={{
        transform: `rotate(${tilt})`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => quillRef.current && setActiveQuill(quillRef.current)}
      onMouseDown={() => {
        if (quillRef.current) setActiveQuill(quillRef.current)
      }}
    >
      <div className="pointer-events-none absolute inset-x-12 -top-4 z-30 flex justify-center">
        <div
          className={`relative h-7 w-7 rounded-full border border-white/70 shadow-[0_8px_18px_rgba(15,23,42,0.34)] ${
            selected ? 'scale-110' : ''
          }`}
          style={{ background: currentColor.pin }}
        >
          <div className="absolute inset-[4px] rounded-full bg-white/45 blur-[1px]" />
          <div className="absolute left-1/2 top-[19px] h-6 w-[2px] -translate-x-1/2 rounded-full bg-slate-500/60" />
          <div className="absolute left-1/2 top-[22px] h-0 w-0 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[9px] border-l-transparent border-r-transparent border-t-slate-500/65" />
        </div>
      </div>

      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border ${
          selected ? 'ring-2 ring-blue-400/70 ring-offset-4 ring-offset-transparent' : ''
        }`}
        style={{
          background: currentColor.surface,
          borderColor: currentColor.border,
          backdropFilter: 'blur(18px) saturate(1.15)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.58), inset 0 -20px 44px ${currentColor.glow}`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-0 top-0 h-24 w-full bg-white/22 blur-2xl" />
          <div className="absolute inset-x-5 bottom-3 h-8 rounded-full bg-slate-900/8 blur-xl" />
        </div>

        <div
          className="node-header relative z-10 flex h-11 flex-shrink-0 items-center justify-between px-4"
          style={{
            background: currentColor.header,
            borderBottom: '1px solid rgba(255,255,255,0.28)',
          }}
        >
          <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                onClick={() => updateColor(c)}
                title={`Color: ${c}`}
                className={`h-4 w-4 rounded-full border border-white/60 shadow-sm transition-transform hover:scale-110 ${
                  nodeColor === c ? 'ring-2 ring-slate-800/30 ring-offset-1 ring-offset-transparent' : ''
                }`}
                style={{ background: COLOR_MAP[c].pin }}
              />
            ))}
          </div>

          <div className="flex cursor-grab items-center rounded-full bg-white/18 px-3 py-1.5 shadow-sm backdrop-blur-sm active:cursor-grabbing">
            <GripHorizontalIcon className="text-slate-400" />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDelete()
            }}
            className={`rounded-full p-2 text-slate-500 transition-colors hover:bg-red-500 hover:text-white ${
              isHovered || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="Delete Note"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="relative z-10 min-h-0 flex-grow overflow-hidden px-3 pb-3 pt-2">
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded-2xl bg-white/30" />}>
            <QuillEditor quillRef={quillRef} className="h-full" />
          </Suspense>
        </div>
      </div>

      {SIDES.map(({ id: side, position, type }) => (
        <SideHandle key={side} side={side} position={position} type={type} />
      ))}

      <NodeResizeControl
        position="bottom-right"
        variant={ResizeControlVariant.Handle}
        minWidth={220}
        minHeight={160}
        className={`!z-40 !border-transparent transition-opacity duration-150 ${
          isHovered || selected ? '!opacity-100' : '!pointer-events-none !opacity-0'
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/65 bg-white/80 text-slate-700 shadow-lg backdrop-blur-md">
          <ResizeIcon />
        </div>
      </NodeResizeControl>
    </div>
  )
}

function SideHandle({
  side,
  position,
  type,
}: {
  side: NodeHandleSide
  position: Position
  type: 'source' | 'target'
}) {
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
      className="!z-30 !h-4 !w-4 !border-2 !border-white/90 !bg-slate-700 opacity-0 shadow-md transition-opacity group-hover:opacity-95"
    />
  )
}

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
