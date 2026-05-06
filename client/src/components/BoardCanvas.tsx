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
import { CanvasProvider } from '../context/CanvasContext'
import { EditorToolbar } from './EditorToolbar'

type RFNoteNode = Node<NoteNodeData>

// Define custom node types outside the component so the reference is stable
// across renders — prevents React Flow from re-mounting all nodes on re-render
const nodeTypes: NodeTypes = {
  noteNode: NoteNode,
}

interface BoardCanvasProps {
  yNodes: Y.Map<NodeData>
  yEdges: Y.Map<EdgeData>
  yTexts: Y.Map<Y.XmlText>
  awareness: Awareness
}

// ─── AwarenessManager ─────────────────────────────────────────────────────────

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

// ─── Type guard ───────────────────────────────────────────────────────────────

function isNodeHandleId(handle: string | null): handle is NodeHandleId {
  return (
    handle === 'top' ||
    handle === 'bottom' ||
    handle === 'left' ||
    handle === 'right'
  )
}

// ─── Helpers to build a single RF Node / Edge from Yjs data ──────────────────

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
    style: { stroke: theme === 'dark' ? '#94a3b8' : '#64748b', strokeWidth: 2 },
  }
}

// ─── BoardCanvas (Inner — must be inside ReactFlowProvider) ──────────────────

function BoardCanvasInner({ yNodes, yEdges, yTexts, awareness }: BoardCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  // ─── Full initial hydration from Yjs ────────────────────────────────────────
  // Called ONCE on mount and on theme change (edges need to recolor).
  // Observer below handles incremental updates.

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

  // ─── Incremental Yjs observer: only diff changed entries ────────────────────
  // This replaces the O(n) full rebuild on every keystroke.

  useEffect(() => {
    // Hydrate on mount
    buildAllFromYjs()

    const onNodesObserve = (event: Y.YMapEvent<NodeData>) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'delete') {
          // Yjs delete: remove from RF state
          setNodes((prev) => prev.filter((n) => n.id !== key))
        } else {
          // Add or update: upsert the specific node
          const yNode = yNodes.get(key)
          if (!yNode) return
          const rfNode = yNodeToRfNode(yNode, yTexts, yNodes, awareness)

          setNodes((prev) => {
            const idx = prev.findIndex((n) => n.id === key)
            if (idx === -1) return [...prev, rfNode]
            // Only replace if data actually changed (avoid thrashing)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yNodes, yEdges, yTexts, awareness]) // intentionally exclude theme — handled by buildAllFromYjs below

  // Re-color edges when theme flips (they store the color inline)
  useEffect(() => {
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        style: { stroke: theme === 'dark' ? '#94a3b8' : '#64748b', strokeWidth: 2 },
      }))
    )
  }, [theme])

  // ─── React Flow → Yjs handlers (unidirectional: UI gesture → Yjs) ───────────
  //
  // DESIGN PRINCIPLE: React Flow local state is the DISPLAY layer.
  // All mutations go to Yjs first. The Yjs observer above then syncs back.
  // Exception: drag/resize position updates are applied locally for smooth
  // UX, then written to Yjs. The observer will receive the echo but the
  // positional equality check above prevents a re-render loop.

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply non-deletion changes to local RF state immediately for smooth UX
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
          // ─── DELETION RACE FIX ────────────────────────────────────────────
          // We use a Y.Doc transaction to batch all three deletions atomically.
          // This ensures Yjs fires a single 'update' event, so the QuillBinding
          // does not attempt to access the Y.XmlText after it is already gone.
          // Previously, separate deletes caused React to unmount the Quill
          // editor while Yjs was still processing the Y.XmlText destruction.
          const doc = yNodes.doc
          if (!doc) return

          doc.transact(() => {
            // First destroy the text so QuillBinding teardown gets a valid ref
            yTexts.delete(change.id)
            // Then remove connected edges
            Array.from(yEdges.keys()).forEach((edgeId) => {
              const edge = yEdges.get(edgeId)
              if (edge && (edge.source === change.id || edge.target === change.id)) {
                yEdges.delete(edgeId)
              }
            })
            // Finally remove the node metadata
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

    // Atomically create text + node so the observer never sees a node without text
    doc.transact(() => {
      yTexts.set(id, new Y.XmlText())
      const newNode: NodeData = {
        id,
        type: 'noteNode',
        position: {
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 300,
        },
        width: 260,
        height: 200,
        color: 'white',
      }
      yNodes.set(id, newNode)
    })
  }, [yNodes, yTexts])

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  return (
    <div className={`w-full h-full transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={memoNodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        colorMode={theme}
        // Disable RF's internal node deletion keybinding — we handle it via Yjs transaction
        deleteKeyCode={null}
      >
        <Background variant={BackgroundVariant.Dots} color={theme === 'dark' ? '#334155' : '#cbd5e1'} gap={20} />
        <Controls />

        <Panel position="top-center" className="mt-4">
          <EditorToolbar />
        </Panel>

        <Panel position="top-right" className="mt-4 mr-4 flex flex-col space-y-2">
          <button
            onClick={addNote}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusIcon />
            <span>Add Note</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow hover:shadow-md transition-all text-gray-700 dark:text-gray-300"
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

// ─── BoardCanvas (Public export — provides ReactFlowProvider + CanvasProvider) ─

export function BoardCanvas(props: BoardCanvasProps) {
  return (
    <CanvasProvider>
      <ReactFlowProvider>
        <BoardCanvasInner {...props} />
      </ReactFlowProvider>
    </CanvasProvider>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
)
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
)
