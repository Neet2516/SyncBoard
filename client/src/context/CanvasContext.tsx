import React, { createContext, useContext, useState, useCallback } from 'react'
import type Quill from 'quill'

interface CanvasContextType {
  activeQuill: Quill | null
  setActiveQuill: (quill: Quill | null) => void
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [activeQuill, setActiveQuillState] = useState<Quill | null>(null)

  const setActiveQuill = useCallback((quill: Quill | null) => {
    setActiveQuillState(quill)
  }, [])

  return (
    <CanvasContext.Provider value={{ activeQuill, setActiveQuill }}>
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}
