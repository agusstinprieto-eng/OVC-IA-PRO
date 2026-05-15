import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout/PageLayout'
import { TicketQR } from '@/components/tickets/TicketQR'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { getMyOrders } from '@/services/ticketsService'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const STATUS_COLORS = {
  paid:      '#3da92b',
  reserved:  '#ffdc00',
  cancelled: '#ff2014',
  refunded:  '#a1b0b6',
  expired:   '#666',
}

export default function MyTickets() {
  const { user, loading } = useAuth()
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  getMyOrders,
    enabled:  !!user,
  })

  if (loading || isLoading) return <PageLayout><PageSpinner /></PageLayout>

  if (!user) return (
    <PageLayout>
      <div className="text-center py-20">
        <p className="font-display text-3xl text-ink-400 mb-4">Inicia sesión para ver tus boletos</p>
        <Link to="/auth/login"><Button>Iniciar Sesión</Button></Link>
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <h1 className="font-display text-5xl text-ink-100 tracking-wide mb-8">Mis Boletos</h1>

      {orders.length === 0 && (
        <div className="text-center py-20 rounded-xl border border-surface-600">
          <p className="font-display text-3xl text-ink-400 mb-2">Aún no tienes boletos</p>
          <p className="text-ink-400 text-sm mb-6">Explora la cartelera y encuentra tu próximo evento.</p>
          <Link to="/eventos"><Button variant="secondary">Ver cartelera</Button></Link>
        </div>
      )}

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-surface-600 bg-surface-700/50">
              <div>
                <p className="font-display text-lg text-ocv-cyan tracking-widest">{order.order_number}</p>
                <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={order.status} color={STATUS_COLORS[order.status] ?? '#a1b0b6'} />
                <span className="font-bold text-ink-100">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Tickets grid */}
            {order.status === 'paid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {(order.tickets ?? []).map((ticket) => (
                  <TicketQR
                    key={ticket.id}
                    ticket={ticket}
                    eventTitle={ticket.events?.title}
                  />
                ))}
              </div>
            )}

            {order.status !== 'paid' && (
              <div className="px-6 py-4 text-sm text-ink-400">
                {order.status === 'reserved' && 'Tu orden está reservada. Completa el pago para recibir tus boletos.'}
                {order.status === 'cancelled' && 'Esta orden fue cancelada.'}
                {order.status === 'expired' && 'La reserva expiró.'}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
