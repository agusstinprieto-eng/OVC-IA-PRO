import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export function OrderSummary({ order, items, eventTitle, eventDate, eventVenue, coverUrl }) {
  const lineItems = items ?? order?.order_items ?? []

  const subtotal = order?.subtotal
    ?? lineItems.reduce((s, i) => s + (i.unitPrice ?? i.unit_price) * i.quantity, 0)
  const fees  = order?.fees  ?? parseFloat((subtotal * 0.05).toFixed(2))
  const total = order?.total ?? subtotal + fees

  const title  = eventTitle  ?? order?.order_items?.[0]?.ticket_types?.events?.title
  const date   = eventDate   ?? order?.order_items?.[0]?.ticket_types?.events?.starts_at
  const venue  = eventVenue  ?? order?.order_items?.[0]?.ticket_types?.events?.venues?.name
  const cover  = coverUrl    ?? order?.order_items?.[0]?.ticket_types?.events?.cover_image_url

  return (
    <div className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
      {/* Event cover */}
      {cover ? (
        <img src={cover} alt={title} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-surface-700 cyber-grid-bg flex items-center justify-center">
          <span className="font-display text-3xl text-ocv-cyan/20 tracking-widest">OCV</span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Event info */}
        {title && (
          <div className="pb-4 border-b border-surface-600">
            <p className="font-display text-xl text-ink-100 leading-tight">{title}</p>
            {date  && <p className="text-xs text-ocv-cyan mt-1">📅 {formatDate(date, { day:'2-digit', month:'long' })} — {formatTime(date)}</p>}
            {venue && <p className="text-xs text-ink-400 mt-0.5">📍 {venue}</p>}
          </div>
        )}

        {/* Line items */}
        <div className="space-y-2">
          {lineItems.map((item, i) => {
            const name  = item.name  ?? item.ticket_types?.name ?? `Boleto #${i+1}`
            const price = item.unitPrice ?? item.unit_price
            return (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-ink-300">
                  {item.quantity} × {name}
                </span>
                <span className="text-ink-200 font-medium">{formatCurrency(price * item.quantity)}</span>
              </div>
            )
          })}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 pt-3 border-t border-surface-600">
          <div className="flex justify-between text-sm text-ink-400">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-400">
            <span>Cargo por servicio (5%)</span>
            <span>{formatCurrency(fees)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink-100 pt-1.5 border-t border-surface-600">
            <span>Total</span>
            <span className="text-ocv-cyan text-lg">{formatCurrency(total)}</span>
          </div>
        </div>

        {order?.order_number && (
          <p className="text-xs text-ink-400 text-center font-mono pt-1">{order.order_number}</p>
        )}
      </div>
    </div>
  )
}
