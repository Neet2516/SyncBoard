import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

type QuillRegistry = {
  import: (path: string) => { whitelist?: string[] }
  register: (definition: unknown, suppressWarning?: boolean) => void
}

const quillRegistry = Quill as unknown as QuillRegistry
const SizeStyle = quillRegistry.import('attributors/style/size')
SizeStyle.whitelist = ['12px', '16px', '20px', '28px']
quillRegistry.register(SizeStyle, true)

interface QuillEditorProps {
  quillRef: React.MutableRefObject<Quill | null>
  className?: string
}

/**
 * QuillEditor Component
 */
export function QuillEditor({ quillRef, className = '' }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return

    // Initialize Quill
    const quillInstance = new Quill(containerRef.current, {
      theme: 'snow',
      modules: {
        toolbar: false,
      },
      placeholder: 'Write something...',
    })

    quillRef.current = quillInstance

    return () => {
      quillRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [quillRef])

  return (
    <div className={`quill-editor-wrapper h-full flex flex-col ${className}`}>
      <div 
        ref={containerRef} 
        className="ql-container h-full nodrag !border-none text-base dark:text-slate-200" 
        style={{ border: 'none' }}
      />
      <style>{`
        .ql-editor.ql-blank::before {
          color: rgba(156, 163, 175, 0.5);
          font-style: normal;
        }
        .dark .ql-editor.ql-blank::before {
          color: rgba(148, 163, 184, 0.4);
        }
        .ql-editor {
          padding: 8px;
        }
      `}</style>
    </div>
  )
}
