import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={cn(
        'relative z-10 w-full max-w-lg rounded-2xl bg-surface-800 border border-ocv-cyan/30 shadow-glow-cyan',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
            <h2 className="font-display text-2xl text-ink-100 tracking-wide">{title}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-100 transition-colors text-2xl leading-none">&times;</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
