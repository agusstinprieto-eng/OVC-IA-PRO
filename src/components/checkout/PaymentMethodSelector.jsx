import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const METHODS = [
  {
    id:    'stripe',
    label: 'Tarjeta de crédito / débito',
    sub:   'Visa, Mastercard, American Express',
    icon:  (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="3" fill="#1a1f2e" stroke="#313a42"/>
        <rect x="1" y="8" width="22" height="4" fill="#00aad1" opacity=".25"/>
        <rect x="4" y="14" width="5" height="2" rx="0.5" fill="#00aad1" opacity=".6"/>
      </svg>
    ),
  },
  {
    id:    'mercadopago',
    label: 'MercadoPago',
    sub:   'Tarjeta, OXXO, transferencia, meses sin intereses',
    icon:  (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
        <circle cx="12" cy="12" r="11" fill="#009EE3"/>
        <path d="M6 12c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="15" r="2.5" fill="white"/>
      </svg>
    ),
  },
]

export function PaymentMethodSelector({ selected, onSelect, onBack, onContinue, total, loading }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Paso 2</p>
        <h2 className="font-display text-3xl text-ink-100 tracking-wide">Método de pago</h2>
        <p className="text-sm text-ink-400 mt-1">
          Total: <span className="text-ocv-cyan font-bold">{formatCurrency(total)}</span>
        </p>
      </div>

      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
              selected === m.id
                ? 'border-ocv-cyan bg-ocv-cyan/10 shadow-glow-cyan'
                : 'border-surface-600 bg-surface-700/50 hover:border-ocv-cyan/40 hover:bg-surface-700'
            )}
          >
            {/* Radio */}
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              selected === m.id ? 'border-ocv-cyan' : 'border-surface-500'
            )}>
              {selected === m.id && <div className="w-2.5 h-2.5 rounded-full bg-ocv-cyan shadow-glow-cyan" />}
            </div>

            {m.icon}

            <div>
              <p className="text-sm font-medium text-ink-100">{m.label}</p>
              <p className="text-xs text-ink-400 mt-0.5">{m.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>← Atrás</Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          disabled={!selected || loading}
          onClick={onContinue}
        >
          {loading ? 'Preparando pago...' : 'Continuar →'}
        </Button>
      </div>
    </div>
  )
}
