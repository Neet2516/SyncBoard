import { useEffect } from 'react'
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import { Awareness } from 'y-protocols/awareness'
import type Quill from 'quill'

/**
 * useYjsQuill hook
 * 
 * Binds a Quill editor instance to a Yjs shared text structure (Y.XmlText).
 * This enables real-time collaborative editing for the content of a node.
 * 
 * @param quill - The Quill editor instance (not the ref, the actual instance)
 * @param nodeId - The ID of the node this editor belongs to
 * @param yTexts - The shared Y.Map containing all node text contents
 * @param awareness - The Yjs awareness object for collaborative cursors
 */
export function useYjsQuill(
  quill: Quill | null,
  nodeId: string,
  yTexts: Y.Map<Y.XmlText>,
  awareness: Awareness | undefined
) {
  useEffect(() => {
    if (!quill || !nodeId || !yTexts || !awareness) return

    const yText = yTexts.get(nodeId)
    if (!yText) {
      return
    }

    const binding = new QuillBinding(yText, quill, awareness)

    return () => {
      try {
        binding.destroy()
      } catch {
        // Node teardown can race Yjs deletion; ignore stale binding cleanup.
      }
    }
  }, [quill, nodeId, yTexts, awareness])
}
