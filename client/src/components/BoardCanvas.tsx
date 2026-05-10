import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  ConnectionMode,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'
import { v4 as uuidv4 } from 'uuid'

import { NoteNode } from './NoteNode'
import { CollaboratorCursors } from './CollaboratorCursors'
import { NodeData, EdgeData, NoteNodeData, type NodeHandleId } from '../types/yjsSchema'
import { CanvasProvider, useCanvas } from '../context/CanvasContext'
import { EditorToolbar } from './EditorToolbar'

type RFNoteNode = Node<NoteNodeData>

const nodeTypes: NodeTypes = {
  noteNode: NoteNode,
}

interface BoardCanvasProps {
  yNodes: Y.Map<NodeData>
  yEdges: Y.Map<EdgeData>
  yTexts: Y.Map<Y.XmlText>
  awareness: Awareness
}

function AwarenessManager({ awareness }: { awareness: Awareness }) {
  const { screenToFlowPosition } = useReactFlow()
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    const name = localStorage.getItem('name') || 'Guest'
    const userId = localStorage.getItem('userId') || 'anonymous'
    const color = `hsl(${Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0) * 13 % 360}, 70%, 50%)`

    awareness.setLocalStateField('user', { name, color })

    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now()
      if (now - lastUpdateRef.current < 50) return
      lastUpdateRef.current = now

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      awareness.setLocalStateField('cursor', flowPos)
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => {
      awareness.setLocalStateField('cursor', null)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [awareness, screenToFlowPosition])

  return <CollaboratorCursors awareness={awareness} />
}

function isNodeHandleId(handle: string | null): handle is NodeHandleId {
  return (
    handle === 'top' ||
    handle === 'bottom' ||
    handle === 'left' ||
    handle === 'right'
  )
}

function yNodeToRfNode(yNode: NodeData, yTexts: Y.Map<Y.XmlText>, yNodes: Y.Map<NodeData>, awareness: Awareness): RFNoteNode {
  const data: NoteNodeData = {
    nodeId: yNode.id,
    yTexts,
    yNodes,
    awareness,
    color: yNode.color,
  }

  return {
    id: yNode.id,
    type: yNode.type,
    position: yNode.position,
    width: yNode.width,
    height: yNode.height,
    data,
  }
}

function yEdgeToRfEdge(yEdge: EdgeData, theme: 'light' | 'dark'): Edge {
  return {
    id: yEdge.id,
    source: yEdge.source,
    target: yEdge.target,
    sourceHandle: yEdge.sourceHandle,
    targetHandle: yEdge.targetHandle,
    animated: true,
    style: {
      stroke: theme === 'dark' ? 'rgba(255,255,255,0.42)' : 'rgba(71,85,105,0.42)',
      strokeWidth: 2.5,
      strokeDasharray: '6 10',
      strokeLinecap: 'round',
    },
  }
}

function BoardCanvasInner({ yNodes, yEdges, yTexts, awareness }: BoardCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const { setActiveQuill } = useCanvas()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const buildAllFromYjs = useCallback(() => {
    const rfNodes: Node[] = Array.from(yNodes.values()).map(
      (yNode) => yNodeToRfNode(yNode, yTexts, yNodes, awareness)
    )
    const rfEdges: Edge[] = Array.from(yEdges.values()).map(
      (yEdge) => yEdgeToRfEdge(yEdge, theme)
    )
    setNodes(rfNodes)
    setEdges(rfEdges)
  }, [yNodes, yEdges, yTexts, awareness, theme])

  useEffect(() => {
    buildAllFromYjs()

    const onNodesObserve = (event: Y.YMapEvent<NodeData>) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'delete') {
          setNodes((prev) => prev.filter((n) => n.id !== key))
        } else {
          const yNode = yNodes.get(key)
          if (!yNode) return
          const rfNode = yNodeToRfNode(yNode, yTexts, yNodes, awareness)

          setNodes((prev) => {
            const idx = prev.findIndex((n) => n.id === key)
            if (idx === -1) return [...prev, rfNode]
            const existing = prev[idx]
            const existingData = existing.data as unknown as Partial<NoteNodeData>
            if (
              existing.position.x === rfNode.position.x &&
              existing.position.y === rfNode.position.y &&
              existing.width === rfNode.width &&
              existing.height === rfNode.height &&
              existingData.color === rfNode.data.color
            ) {
              return prev
            }
            const next = [...prev]
            next[idx] = rfNode
            return next
          })
        }
      })
    }

    const onEdgesObserve = (event: Y.YMapEvent<EdgeData>) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'delete') {
          setEdges((prev) => prev.filter((e) => e.id !== key))
        } else {
          const yEdge = yEdges.get(key)
          if (!yEdge) return
          const rfEdge = yEdgeToRfEdge(yEdge, theme)
          setEdges((prev) => {
            const idx = prev.findIndex((e) => e.id === key)
            if (idx === -1) return [...prev, rfEdge]
            const next = [...prev]
            next[idx] = rfEdge
            return next
          })
        }
      })
    }

    yNodes.observe(onNodesObserve)
    yEdges.observe(onEdgesObserve)

    return () => {
      yNodes.unobserve(onNodesObserve)
      yEdges.unobserve(onEdgesObserve)
    }
  }, [yNodes, yEdges, yTexts, awareness, theme, buildAllFromYjs])

  useEffect(() => {
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        style: {
          stroke: theme === 'dark' ? 'rgba(255,255,255,0.42)' : 'rgba(71,85,105,0.42)',
          strokeWidth: 2.5,
          strokeDasharray: '6 10',
          strokeLinecap: 'round',
        },
      }))
    )
  }, [theme])

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nonRemovalChanges = changes.filter((c) => c.type !== 'remove')
      if (nonRemovalChanges.length > 0) {
        setNodes((nds) => applyNodeChanges(nonRemovalChanges, nds))
      }

      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const yNode = yNodes.get(change.id)
          if (yNode) {
            yNodes.set(change.id, { ...yNode, position: change.position })
          }
        } else if (change.type === 'dimensions' && change.dimensions) {
          const yNode = yNodes.get(change.id)
          if (yNode) {
            yNodes.set(change.id, {
              ...yNode,
              width: change.dimensions.width,
              height: change.dimensions.height,
            })
          }
        } else if (change.type === 'remove') {
          const doc = yNodes.doc
          if (!doc) return

          doc.transact(() => {
            yTexts.delete(change.id)
            Array.from(yEdges.keys()).forEach((edgeId) => {
              const edge = yEdges.get(edgeId)
              if (edge && (edge.source === change.id || edge.target === change.id)) {
                yEdges.delete(edgeId)
              }
            })
            yNodes.delete(change.id)
          })
        }
      })
    },
    [yNodes, yTexts, yEdges]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
      changes.forEach((change) => {
        if (change.type === 'remove') yEdges.delete(change.id)
      })
    },
    [yEdges]
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle, targetHandle } = connection

      if (!source || !target || !isNodeHandleId(sourceHandle) || !isNodeHandleId(targetHandle)) return
      if (source === target) return

      const edgeId = `edge-${uuidv4()}`
      const newEdge: EdgeData = {
        id: edgeId,
        source,
        target,
        sourceHandle,
        targetHandle,
      }

      yEdges.set(edgeId, newEdge)
    },
    [yEdges]
  )

  const addNote = useCallback(() => {
    const id = uuidv4()
    const doc = yNodes.doc
    if (!doc) return

    doc.transact(() => {
      yTexts.set(id, new Y.XmlText())
      const newNode: NodeData = {
        id,
        type: 'noteNode',
        position: {
          x: 180 + Math.random() * 420,
          y: 140 + Math.random() * 320,
        },
        width: 280,
        height: 210,
        color: 'white',
      }
      yNodes.set(id, newNode)
    })
  }, [yNodes, yTexts])

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  return (
    <div
      className={`board-surface relative h-full w-full overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#251915]' : 'bg-[#e7d2ad]'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(180deg, rgba(19,12,10,0.45), rgba(49,33,27,0.72)), radial-gradient(circle at 20% 15%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 82% 22%, rgba(255,255,255,0.07), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.02) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(225deg, rgba(0,0,0,0.08) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(315deg, rgba(255,255,255,0.02) 25%, transparent 25%) 0px 0/36px 36px, linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%) 0px 0/36px 36px'
              : 'linear-gradient(180deg, rgba(255,250,241,0.28), rgba(195,158,109,0.18)), radial-gradient(circle at 20% 15%, rgba(255,255,255,0.55), transparent 30%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.35), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.08) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(225deg, rgba(92,45,17,0.08) 25%, transparent 25%) -18px 0/36px 36px, linear-gradient(315deg, rgba(255,255,255,0.08) 25%, transparent 25%) 0px 0/36px 36px, linear-gradient(45deg, rgba(92,45,17,0.08) 25%, transparent 25%) 0px 0/36px 36px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_58%)]" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setActiveQuill(null)}
        nodeTypes={memoNodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        colorMode={theme}
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color={theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(92,45,17,0.18)'}
          gap={22}
          size={1.5}
        />
        <Controls
          className="!overflow-hidden !rounded-2xl !border !border-white/20 !bg-white/10 !shadow-2xl !backdrop-blur-md"
          showInteractive={false}
        />

        <Panel position="top-left" className="ml-4 mt-4">
          <div className={`rounded-[28px] border px-5 py-4 shadow-2xl backdrop-blur-xl ${
            theme === 'dark'
              ? 'border-white/25 bg-white/12 text-white'
              : 'border-amber-200/70 bg-white/38 text-slate-900'
          }`}>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
              theme === 'dark' ? 'text-white/65' : 'text-slate-600'
            }`}>Studio board</div>
            <div className={`mt-2 max-w-[240px] text-sm leading-6 ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-800'
            }`}>
              Pin notes, sketch connections, and keep your ideas floating on a tactile shared wall.
            </div>
          </div>
        </Panel>

        <Panel position="top-center" className="mt-4">
          <div className={`rounded-[28px] border p-2 shadow-2xl backdrop-blur-xl ${
            theme === 'dark'
              ? 'border-white/20 bg-white/12'
              : 'border-amber-200/70 bg-white/38'
          }`}>
            <EditorToolbar />
          </div>
        </Panel>

        <Panel position="top-right" className="mr-4 mt-4 flex flex-col space-y-3">
          <button
            onClick={addNote}
            className="flex items-center space-x-2 rounded-2xl border border-white/20 bg-blue-600/90 px-6 py-3 text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
          >
            <PlusIcon />
            <span className="text-sm font-semibold tracking-wide">Add Note</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-2xl border border-white/20 bg-white/14 p-3 text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/20"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </Panel>

        <AwarenessManager awareness={awareness} />
      </ReactFlow>
    </div>
  )
}

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <CanvasProvider>
      <ReactFlowProvider>
        <BoardCanvasInner {...props} />
      </ReactFlowProvider>
    </CanvasProvider>
  )
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
)
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
)
