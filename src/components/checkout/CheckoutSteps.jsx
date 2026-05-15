import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'info',    label: 'Tus datos'  },
  { key: 'payment', label: 'Pago'       },
  { key: 'confirm', label: 'Confirmado' },
]

export function CheckoutSteps({ current }) {
  const currentIdx = STEPS.findIndex(s => s.key === current)

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx

        return (
          <div key={step.key} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                done   && 'bg-ocv-cyan text-surface-950 shadow-glow-cyan',
                active && 'bg-ocv-cyan/20 border-2 border-ocv-cyan text-ocv-cyan',
                !done && !active && 'bg-surface-700 border border-surface-500 text-ink-400'
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-xs whitespace-nowrap',
                active ? 'text-ocv-cyan font-medium' : done ? 'text-ink-300' : 'text-ink-400'
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-px w-16 sm:w-24 mb-4 transition-colors',
                i < currentIdx ? 'bg-ocv-cyan' : 'bg-surface-600'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
