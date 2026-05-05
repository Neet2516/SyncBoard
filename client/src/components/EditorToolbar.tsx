import { useCanvas } from '../context/CanvasContext'

function getSafeFormat(activeQuill: ReturnType<typeof useCanvas>['activeQuill']) {
  if (!activeQuill) return {}

  try {
    return activeQuill.getFormat() ?? {}
  } catch {
    return {}
  }
}

function getSafeSelection(activeQuill: ReturnType<typeof useCanvas>['activeQuill']) {
  if (!activeQuill) return null

  try {
    return activeQuill.getSelection()
  } catch {
    return null
  }
}

/**
 * EditorToolbar Component
 */
export function EditorToolbar() {
  const { activeQuill } = useCanvas()
  const currentFormat = getSafeFormat(activeQuill)

  const handleFormat = (name: string, value: string | boolean) => {
    if (!activeQuill) return
    const range = getSafeSelection(activeQuill)

    try {
      if (range) activeQuill.focus()

      if (currentFormat[name] === value) {
        activeQuill.format(name, false)
      } else {
        activeQuill.format(name, value)
      }
    } catch {
      return
    }
  }

  const handleColorChange = (color: string) => {
    if (!activeQuill) return

    try {
      activeQuill.focus()
      activeQuill.format('color', color)
    } catch {
      return
    }
  }

  const handleClean = () => {
    if (!activeQuill) return
    const range = getSafeSelection(activeQuill)

    try {
      if (range) activeQuill.removeFormat(range.index, range.length)
    } catch {
      return
    }
  }

  if (!activeQuill) {
    return (
      <div className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 opacity-50 cursor-not-allowed">
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium select-none">Select a note to format</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
      <ToolbarButton 
        onClick={() => handleFormat('bold', true)} 
        active={currentFormat.bold}
        icon={<BoldIcon />} 
        label="Bold"
      />
      <ToolbarButton 
        onClick={() => handleFormat('italic', true)} 
        active={currentFormat.italic}
        icon={<ItalicIcon />} 
        label="Italic"
      />
      <ToolbarButton 
        onClick={() => handleFormat('underline', true)} 
        active={currentFormat.underline}
        icon={<UnderlineIcon />} 
        label="Underline"
      />
      
      <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

      <ColorPicker
        value={typeof currentFormat.color === 'string' ? currentFormat.color : '#111827'}
        onChange={handleColorChange}
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />
      
      <ToolbarButton 
        onClick={() => handleFormat('list', 'bullet')} 
        active={currentFormat.list === 'bullet'}
        icon={<ListIcon />} 
        label="Bullet List"
      />
      <ToolbarButton 
        onClick={() => handleFormat('list', 'ordered')} 
        active={currentFormat.list === 'ordered'}
        icon={<ListOrderedIcon />} 
        label="Ordered List"
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

      <ToolbarButton 
        onClick={handleClean} 
        icon={<EraserIcon />} 
        label="Clear Formatting"
      />
    </div>
  )
}

function ToolbarButton({ 
  onClick, 
  icon, 
  label, 
  active = false 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-slate-700 group relative ${
        active ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
      }`}
      title={label}
    >
      {icon}
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-slate-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
        {label}
      </span>
    </button>
  )
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  const palette = ['#111827', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#db2777']

  return (
    <div className="flex items-center gap-1 px-1">
      {palette.map((color) => (
        <button
          key={color}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange(color)
          }}
          className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
            value === color
              ? 'border-gray-900 dark:border-white ring-2 ring-blue-400/60'
              : 'border-gray-300 dark:border-slate-600'
          }`}
          style={{ backgroundColor: color }}
          title={`Text Color ${color}`}
          aria-label={`Text Color ${color}`}
        />
      ))}
    </div>
  )
}

// Inline SVGs
const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
)
const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
)
const UnderlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
)
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
)
const ListOrderedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
)
const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.4 4.4c1 1 1 2.5 0 3.4L7 21Z"/><path d="m22 21-12-12"/><path d="m5 11 9 9"/></svg>
)
