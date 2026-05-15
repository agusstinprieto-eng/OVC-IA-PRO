import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { getAllOrders, updateOrderStatus } from '@/services/adminService'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATUS_COLORS = {
  paid:      '#3da92b',
  reserved:  '#ffdc00',
  pending:   '#a1b0b6',
  cancelled: '#ff2014',
  refunded:  '#ff0294',
  expired:   '#666',
}

const STATUS_OPTS = ['all', 'paid', 'reserved', 'pending', 'cancelled', 'refunded']

export default function OrderList() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { status: statusFilter, page }],
    queryFn:  () => getAllOrders({ status: statusFilter === 'all' ? undefined : statusFilter, limit, offset: page * limit }),
  })

  const orders = data?.data  ?? []
  const total  = data?.count ?? 0
  const pages  = Math.ceil(total / limit)

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  return (
    <AdminLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Administración</p>
            <h1 className="font-display text-4xl text-ink-100 tracking-wide">Órdenes</h1>
          </div>
          <span className="text-sm text-ink-400">{total} órdenes</span>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border uppercase tracking-wider transition-all
                ${statusFilter === s
                  ? 'bg-ocv-cyan text-surface-950 border-ocv-cyan'
                  : 'border-surface-600 text-ink-400 hover:border-ocv-cyan/50'}`}
            >
              {s === 'all' ? 'Todas' : s}
            </button>
          ))}
        </div>

        {isLoading ? <PageSpinner /> : (
          <div className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-ink-400 uppercase tracking-wider border-b border-surface-700 bg-surface-700/50">
                    <th className="text-left px-5 py-3">Folio</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Comprador</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Evento</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-right px-4 py-3 hidden sm:table-cell">Fecha</th>
                    <th className="text-right px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {orders.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-ink-400">Sin órdenes</td></tr>
                  )}
                  {orders.map((order) => {
                    const eventTitle = order.order_items?.[0]?.ticket_types?.events?.title ?? '—'
                    return (
                      <tr key={order.id} className="hover:bg-surface-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-ocv-cyan text-xs">{order.order_number}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-ink-200 font-medium line-clamp-1">{order.buyer_name}</p>
                          <p className="text-xs text-ink-400">{order.buyer_email}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-ink-400 text-xs line-clamp-2 max-w-[180px]">
                          {eventTitle}
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={order.status} color={STATUS_COLORS[order.status] ?? '#a1b0b6'} />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-ink-100">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-right text-ink-400 text-xs">
                          {formatDate(order.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {order.status === 'reserved' && (
                              <button
                                onClick={() => statusMut.mutate({ id: order.id, status: 'paid' })}
                                className="text-xs text-ocv-green hover:underline"
                              >Marcar pagado</button>
                            )}
                            {order.status === 'paid' && (
                              <button
                                onClick={() => statusMut.mutate({ id: order.id, status: 'refunded' })}
                                className="text-xs text-ocv-yellow hover:underline"
                              >Reembolsar</button>
                            )}
                            {!['cancelled','refunded'].includes(order.status) && (
                              <button
                                onClick={() => statusMut.mutate({ id: order.id, status: 'cancelled' })}
                                className="text-xs text-red-400 hover:underline"
                              >Cancelar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-surface-700 text-sm text-ink-400">
                <span>Página {page + 1} de {pages}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Ant.</Button>
                  <Button variant="ghost" size="sm" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Sig. →</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
