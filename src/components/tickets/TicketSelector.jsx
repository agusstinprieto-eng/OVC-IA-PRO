import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

function QuantityControl({ value, min = 0, max, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-surface-600 border border-surface-500 text-ink-200 hover:border-ocv-cyan hover:text-ocv-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-bold"
      >−</button>
      <span className="w-6 text-center font-display text-xl text-ink-100">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-surface-600 border border-surface-500 text-ink-200 hover:border-ocv-cyan hover:text-ocv-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-bold"
      >+</button>
    </div>
  )
}

export function TicketSelector({ ticketTypes = [], maxPerOrder = 10, onConfirm }) {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
  )

  function setQty(id, val) {
    setQuantities((prev) => ({ ...prev, [id]: val }))
  }

  const totalQty   = useMemo(() => Object.values(quantities).reduce((s, v) => s + v, 0), [quantities])
  const subtotal   = useMemo(() =>
    ticketTypes.reduce((s, t) => s + (quantities[t.id] ?? 0) * t.price, 0),
    [quantities, ticketTypes]
  )
  const serviceFee = parseFloat((subtotal * 0.05).toFixed(2))
  const total      = subtotal + serviceFee

  const items = ticketTypes
    .filter((t) => (quantities[t.id] ?? 0) > 0)
    .map((t) => ({ ticketTypeId: t.id, name: t.name, quantity: quantities[t.id], unitPrice: t.price }))

  function handleConfirm() {
    if (!items.length) return
    onConfirm(items)
  }

  if (!ticketTypes.length) {
    return (
      <div className="rounded-xl border border-surface-600 p-6 text-center text-ink-400 text-sm">
        No hay tipos de boleto disponibles para este evento.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-ocv-cyan/20 bg-surface-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-600">
        <h3 className="font-display text-xl text-ink-100 tracking-wide">Selecciona tus Boletos</h3>
      </div>

      <div className="divide-y divide-surface-700">
        {ticketTypes.map((type) => {
          const available = type.quantity_total - type.quantity_sold - type.quantity_reserved
          const maxQty    = Math.min(available, maxPerOrder - totalQty + (quantities[type.id] ?? 0))
          const soldOut   = available <= 0

          return (
            <div key={type.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-100">{type.name}</p>
                {type.description && (
                  <p className="text-xs text-ink-400 mt-0.5 line-clamp-2">{type.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {type.price > 0 ? (
                    <span className="text-ocv-cyan font-bold">{formatCurrency(type.price)}</span>
                  ) : (
                    <span className="text-ocv-green font-bold text-sm">Gratis</span>
                  )}
                  {soldOut ? (
                    <span className="text-xs text-red-400 font-medium">Agotado</span>
                  ) : (
                    <span className="text-xs text-ink-400">{available} disponibles</span>
                  )}
                </div>
              </div>

              {soldOut ? (
                <span className="text-xs text-red-400 border border-red-400/30 px-3 py-1 rounded-full">Agotado</span>
              ) : (
                <QuantityControl
                  value={quantities[type.id] ?? 0}
                  min={0}
                  max={maxQty}
                  onChange={(v) => setQty(type.id, v)}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      {totalQty > 0 && (
        <div className="px-5 py-4 bg-surface-700/50 border-t border-surface-600 space-y-2">
          <div className="flex justify-between text-sm text-ink-400">
            <span>Subtotal ({totalQty} {totalQty === 1 ? 'boleto' : 'boletos'})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-400">
            <span>Cargo por servicio (5%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink-100 pt-1 border-t border-surface-600">
            <span>Total</span>
            <span className="text-ocv-cyan">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div className="px-5 py-4 border-t border-surface-600">
        <Button
          className="w-full"
          size="lg"
          disabled={totalQty === 0}
          onClick={handleConfirm}
        >
          {totalQty === 0 ? 'Selecciona boletos' : `Continuar — ${formatCurrency(total)}`}
        </Button>
        <p className="text-xs text-ink-400 text-center mt-2">
          Máx. {maxPerOrder} boletos por orden
        </p>
      </div>
    </div>
  )
}
