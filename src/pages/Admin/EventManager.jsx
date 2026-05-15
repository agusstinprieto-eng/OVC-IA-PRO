import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { getAllEvents, updateEventStatus, deleteEvent } from '@/services/adminService'
import { formatShortDate, formatCurrency } from '@/lib/utils'

const STATUS_OPTS   = ['all','draft','published','cancelled','finished','sold_out']
const STATUS_COLORS = {
  published: '#3da92b',
  draft:     '#ffdc00',
  sold_out:  '#ff0294',
  cancelled: '#ff2014',
  finished:  '#a1b0b6',
}

export default function EventManager() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [page,   setPage]   = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const limit = 15
  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', { status: statusFilter, page }],
    queryFn:  () => getAllEvents({ limit, offset: page * limit }),
  })

  const events = data?.data ?? []
  const total  = data?.count ?? 0
  const pages  = Math.ceil(total / limit)

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateEventStatus(id, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-events'] }),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setDeleteTarget(null) },
  })

  const filtered = statusFilter === 'all' ? events : events.filter(e => e.status === statusFilter)

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Administración</p>
            <h1 className="font-display text-4xl text-ink-100 tracking-wide">Eventos</h1>
          </div>
          <Link to="/admin/eventos/nuevo">
            <Button size="md">+ Nuevo Evento</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border uppercase tracking-wider transition-all
                ${statusFilter === s
                  ? 'bg-ocv-cyan text-surface-950 border-ocv-cyan'
                  : 'border-surface-600 text-ink-400 hover:border-ocv-cyan/50 hover:text-ink-200'}`}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
          <span className="ml-auto text-xs text-ink-400 self-center">{total} eventos</span>
        </div>

        {/* Table */}
        {isLoading ? <PageSpinner /> : (
          <div className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-ink-400 uppercase tracking-wider border-b border-surface-700 bg-surface-700/50">
                    <th className="text-left px-5 py-3">Evento</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Categoría</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3 hidden sm:table-cell">Boletos</th>
                    <th className="text-right px-4 py-3 hidden lg:table-cell">Ingresos</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-ink-400">Sin eventos</td></tr>
                  )}
                  {filtered.map((ev) => {
                    const sold     = (ev.ticket_types ?? []).reduce((s, t) => s + t.quantity_sold,  0)
                    const total_t  = (ev.ticket_types ?? []).reduce((s, t) => s + t.quantity_total, 0)
                    const revenue  = (ev.ticket_types ?? []).reduce((s, t) => s + t.quantity_sold * t.price, 0)
                    const pct      = total_t > 0 ? Math.round(sold / total_t * 100) : 0

                    return (
                      <tr key={ev.id} className="hover:bg-surface-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <Link to={`/admin/eventos/${ev.id}`} className="font-medium text-ink-200 hover:text-ocv-cyan transition-colors line-clamp-1">
                              {ev.title}
                            </Link>
                            {ev.venues && <p className="text-xs text-ink-400 mt-0.5">{ev.venues.name}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-400 hidden md:table-cell text-xs">{formatShortDate(ev.starts_at)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {ev.event_categories && (
                            <Badge label={ev.event_categories.name} color={ev.event_categories.color} />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge label={ev.status} color={STATUS_COLORS[ev.status] ?? '#a1b0b6'} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-right">
                          {total_t > 0 ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-ink-300 text-xs">{sold}/{total_t}</span>
                              <div className="w-16 h-1 rounded-full bg-surface-600 overflow-hidden">
                                <div className="h-full rounded-full bg-ocv-cyan" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ) : <span className="text-ink-400">—</span>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-right text-ink-300 text-xs">
                          {revenue > 0 ? formatCurrency(revenue) : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ev.status === 'draft' && (
                              <button
                                onClick={() => statusMut.mutate({ id: ev.id, status: 'published' })}
                                className="text-xs text-ocv-green hover:underline"
                              >Publicar</button>
                            )}
                            {ev.status === 'published' && (
                              <button
                                onClick={() => statusMut.mutate({ id: ev.id, status: 'draft' })}
                                className="text-xs text-ocv-yellow hover:underline"
                              >Ocultar</button>
                            )}
                            <Link to={`/admin/eventos/${ev.id}`} className="text-xs text-ocv-cyan hover:underline">Editar</Link>
                            <button
                              onClick={() => setDeleteTarget(ev)}
                              className="text-xs text-red-400 hover:underline"
                            >Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar eliminación">
        <div className="p-6 space-y-4">
          <p className="text-ink-300">¿Eliminar el evento <span className="text-ink-100 font-bold">"{deleteTarget?.title}"</span>? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => deleteMut.mutate(deleteTarget.id)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
