import { cn } from '@/lib/utils'

export function Badge({ label, color = '#00aad1', className, ...props }) {
  const hex  = color.replace('#', '')
  const r    = parseInt(hex.slice(0,2),16)
  const g    = parseInt(hex.slice(2,4),16)
  const b    = parseInt(hex.slice(4,6),16)

  return (
    <span
      {...props}
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider', className)}
      style={{
        backgroundColor: `rgba(${r},${g},${b},0.18)`,
        color,
        border: `1px solid rgba(${r},${g},${b},0.4)`,
      }}
    >
      {label}
    </span>
  )
}
