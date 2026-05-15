import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Spinner } from '@/components/ui/Spinner'
import { getDashboardStats, getRevenueByDay, getAllEvents } from '@/services/adminService'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const STATUS_COLORS = {
  published: '#3da92b',
  draft:     '#ffdc00',
  sold_out:  '#ff0294',
  cancelled: '#ff2014',
  finished:  '#a1b0b6',
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  getDashboardStats,
    refetchInterval: 30000,
  })
  const { data: chartData = [] } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn:  () => getRevenueByDay(14),
  })
  const { data: eventsData } = useQuery({
    queryKey: ['admin-events', { limit: 5 }],
    queryFn:  () => getAllEvents({ limit: 5 }),
  })

  const recentEvents = eventsData?.data ?? []

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Panel de control</p>
          <h1 className="font-display text-4xl text-ink-100 tracking-wide">Dashboard</h1>
        </div>

        {/* KPI Cards */}
        {statsLoading ? (
          <div className="flex justify-center py-10"><Spinner className="w-8 h-8" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="Ingresos totales"   value={formatCurrency(stats?.revenue ?? 0)}      accent="cyan"    span2 />
            <KpiCard label="Este mes"           value={formatCurrency(stats?.revenueMonth ?? 0)} accent="yellow"  />
            <KpiCard label="Órdenes hoy"        value={stats?.ordersToday ?? 0}                  accent="magenta" />
            <KpiCard label="Eventos activos"    value={stats?.activeEvents ?? 0}                 accent="green"   />
            <KpiCard label="Boletos vendidos"   value={stats?.ticketsSold ?? 0}                  accent="cyan"    />
            <KpiCard label="Órdenes totales"    value={stats?.totalOrders ?? 0}                  accent="default" />
          </div>
        )}

        {/* Revenue Chart */}
        <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6">
          <h2 className="font-display text-xl text-ink-100 mb-5">Ingresos — últimos 14 días</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00aad1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00aad1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262b30" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#a1b0b6', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fill: '#a1b0b6', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
              <Tooltip
                contentStyle={{ background: '#1e262d', border: '1px solid #313a42', borderRadius: 8, color: '#dce3e7' }}
                formatter={(v) => [formatCurrency(v), 'Ingresos']}
                labelStyle={{ color: '#a1b0b6', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00aad1" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#00aad1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent events */}
        <div className="rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
            <h2 className="font-display text-xl text-ink-100">Eventos recientes</h2>
            <Link to="/admin/eventos" className="text-sm text-ocv-cyan hover:underline">Ver todos →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ink-400 uppercase tracking-wider border-b border-surface-700">
                <th className="text-left px-6 py-3">Evento</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Categoría</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-6 py-3 hidden sm:table-cell">Vendidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {recentEvents.map((ev) => {
                const sold  = (ev.ticket_types ?? []).reduce((s, t) => s + t.quantity_sold, 0)
                const total = (ev.ticket_types ?? []).reduce((s, t) => s + t.quantity_total, 0)
                return (
                  <tr key={ev.id} className="hover:bg-surface-700/40 transition-colors">
                    <td className="px-6 py-3">
                      <Link to={`/admin/eventos/${ev.id}`} className="text-ink-200 hover:text-ocv-cyan transition-colors font-medium line-clamp-1">
                        {ev.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-400 hidden md:table-cell">{formatShortDate(ev.starts_at)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {ev.event_categories && (
                        <Badge label={ev.event_categories.name} color={ev.event_categories.color} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={ev.status} color={STATUS_COLORS[ev.status] ?? '#a1b0b6'} />
                    </td>
                    <td className="px-6 py-3 text-right hidden sm:table-cell text-ink-300">
                      {total > 0 ? `${sold} / ${total}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  )
}

function KpiCard({ label, value, accent = 'cyan', span2 = false }) {
  const ACCENTS = {
    cyan:    { ring: 'border-ocv-cyan/30',    text: 'text-ocv-cyan',    bg: 'bg-ocv-cyan/5'    },
    yellow:  { ring: 'border-ocv-yellow/30',  text: 'text-ocv-yellow',  bg: 'bg-ocv-yellow/5'  },
    magenta: { ring: 'border-ocv-magenta/30', text: 'text-ocv-magenta', bg: 'bg-ocv-magenta/5' },
    green:   { ring: 'border-ocv-green/30',   text: 'text-ocv-green',   bg: 'bg-ocv-green/5'   },
    default: { ring: 'border-surface-600',    text: 'text-ink-100',     bg: 'bg-surface-800'   },
  }
  const a = ACCENTS[accent]
  return (
    <div className={`rounded-xl border ${a.ring} ${a.bg} px-5 py-4 ${span2 ? 'col-span-2 lg:col-span-1' : ''}`}>
      <p className="text-xs text-ink-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-display text-2xl ${a.text} leading-none`}>{value}</p>
    </div>
  )
}
