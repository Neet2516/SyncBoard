import { ReactNode, useCallback, useMemo, useState } from 'react'
import { ToastContext, ToastItem, ToastVariant } from '../context/ToastContext'

const toastStyles: Record<
  ToastVariant,
  { border: string; bg: string; text: string; badge: string; icon: string }
> = {
  success: {
    border: 'border-emerald-200/90',
    bg: 'bg-white/95 text-emerald-950',
    text: 'text-emerald-900',
    badge: 'bg-emerald-500 text-white',
    icon: '✓',
  },
  error: {
    border: 'border-rose-200/90',
    bg: 'bg-white/95 text-rose-950',
    text: 'text-rose-900',
    badge: 'bg-rose-500 text-white',
    icon: '!',
  },
  info: {
    border: 'border-blue-200/90',
    bg: 'bg-white/95 text-blue-950',
    text: 'text-blue-900',
    badge: 'bg-blue-600 text-white',
    icon: '✦',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)

    setToasts((current) => [...current, { id, message, variant }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3600)
  }, [])

  const value = useMemo(() => ({ showToast, toasts }), [showToast, toasts])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-5 z-[9999] flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const config = toastStyles[toast.variant] || toastStyles.info
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_18px_40px_rgba(15,23,42,0.15)] backdrop-blur-xl transition-all duration-300 ${config.border} ${config.bg}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${config.badge}`}>
                {config.icon}
              </span>
              <p className={`text-sm font-semibold tracking-wide ${config.text}`}>{toast.message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

