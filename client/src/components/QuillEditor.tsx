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
        className="ql-container h-full nodrag !border-none text-base text-slate-700 dark:text-slate-100" 
        style={{ border: 'none' }}
      />
      <style>{`
        .ql-editor.ql-blank::before {
          color: rgba(100, 116, 139, 0.62);
          font-style: normal;
          left: 16px;
          right: 16px;
        }
        .dark .ql-editor.ql-blank::before {
          color: rgba(226, 232, 240, 0.52);
        }
        .ql-editor {
          min-height: 100%;
          padding: 14px 16px 16px;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          font-size: 16px;
          line-height: 1.65;
          color: #334155;
        }
        .ql-editor p,
        .ql-editor li {
          letter-spacing: 0.01em;
        }
        .dark .ql-editor {
          color: #f8fafc;
        }
      `}</style>
    </div>
  )
}
