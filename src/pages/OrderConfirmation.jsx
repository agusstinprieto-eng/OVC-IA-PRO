import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout/PageLayout'
import { TicketQR } from '@/components/tickets/TicketQR'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { getOrderWithItems, getOrderTickets } from '@/services/paymentsService'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default function OrderConfirmation() {
  const { orderId } = useParams()

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => getOrderWithItems(orderId),
    enabled:  !!orderId,
    retry: 5,
    retryDelay: 1500,
  })

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['order-tickets', orderId],
    queryFn:  () => getOrderTickets(orderId),
    enabled:  !!orderId && order?.status === 'paid',
    retry: 8,
    retryDelay: 2000,
  })

  const isLoading = orderLoading || ticketsLoading

  const eventInfo = order?.order_items?.[0]?.ticket_types?.events

  return (
    <PageLayout>
      {isLoading && <PageSpinner />}

      {!isLoading && order?.status !== 'paid' && (
        <div className="text-center py-20 space-y-4">
          <p className="text-5xl">⏳</p>
          <p className="font-display text-3xl text-ocv-yellow">Procesando tu pago...</p>
          <p className="text-ink-400 text-sm">Tu orden está siendo confirmada. Esto puede tardar unos segundos.</p>
          <p className="font-mono text-xs text-ink-400">{order?.order_number}</p>
        </div>
      )}

      {!isLoading && order?.status === 'paid' && (
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Success header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-ocv-green/15 border border-ocv-green/30 flex items-center justify-center text-4xl mx-auto">
              ✓
            </div>
            <h1 className="font-display text-5xl text-ocv-green tracking-wide">¡Listo!</h1>
            <p className="text-ink-300 text-lg">Tu compra fue exitosa. Los boletos están listos.</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-ocv-cyan/30 bg-ocv-cyan/5 px-5 py-2">
              <span className="text-xs text-ink-400">Orden:</span>
              <span className="font-mono text-sm text-ocv-cyan font-bold">{order.order_number}</span>
            </div>
          </div>

          {/* Event info */}
          {eventInfo && (
            <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6 flex flex-col sm:flex-row gap-4 items-start">
              {eventInfo.cover_image_url && (
                <img src={eventInfo.cover_image_url} alt={eventInfo.title} className="w-full sm:w-32 h-20 object-cover rounded-xl shrink-0" />
              )}
              <div>
                <p className="font-display text-2xl text-ink-100">{eventInfo.title}</p>
                {eventInfo.starts_at && (
                  <p className="text-ocv-cyan text-sm mt-1">
                    📅 {formatDate(eventInfo.starts_at)} — {formatTime(eventInfo.starts_at)}
                  </p>
                )}
                {eventInfo.venues?.name && (
                  <p className="text-ink-400 text-sm mt-0.5">📍 {eventInfo.venues.name}</p>
                )}
              </div>
              <div className="sm:ml-auto shrink-0 text-right">
                <p className="text-xs text-ink-400 mb-0.5">Total pagado</p>
                <p className="font-display text-2xl text-ocv-cyan">{formatCurrency(order.total)}</p>
              </div>
            </div>
          )}

          {/* QR Tickets */}
          <div>
            <h2 className="font-display text-3xl text-ink-100 mb-5">Tus boletos</h2>

            {tickets.length === 0 ? (
              <div className="rounded-xl border border-ocv-cyan/20 bg-ocv-cyan/5 p-6 text-center text-ink-400 text-sm">
                Tus boletos se están generando. Revisa tu correo o{' '}
                <Link to="/mis-boletos" className="text-ocv-cyan hover:underline">Mis Boletos</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket) => (
                  <TicketQR key={ticket.id} ticket={ticket} eventTitle={eventInfo?.title} />
                ))}
              </div>
            )}
          </div>

          {/* Email notice */}
          <div className="rounded-xl border border-ocv-cyan/20 bg-ocv-cyan/5 px-5 py-4 flex gap-3 items-start text-sm text-ink-400">
            <span className="text-xl shrink-0">✉️</span>
            <p>
              Enviamos los boletos a <span className="text-ink-200 font-medium">{order.buyer_email}</span>.
              Presenta el código QR en la entrada del evento.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/mis-boletos">
              <Button variant="secondary" size="lg">Ver todos mis boletos</Button>
            </Link>
            <Link to="/eventos">
              <Button variant="ghost" size="lg">Explorar más eventos</Button>
            </Link>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
