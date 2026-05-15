import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvents'
import { PageLayout } from '@/components/layout/PageLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TicketSelector } from '@/components/tickets/TicketSelector'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { isEventSoldOut } from '@/services/eventsService'
import { useNavigate } from 'react-router-dom'

export default function EventDetail() {
  const { slug }      = useParams()
  const navigate      = useNavigate()
  const { data: event, isLoading, isError } = useEvent(slug)
  const [showTickets, setShowTickets] = useState(false)

  if (isLoading) return <PageLayout><PageSpinner /></PageLayout>
  if (isError || !event) return (
    <PageLayout>
      <div className="text-center py-20">
        <p className="font-display text-4xl text-ink-400 mb-4">Evento no encontrado</p>
        <Link to="/eventos"><Button variant="secondary">Ver cartelera</Button></Link>
      </div>
    </PageLayout>
  )

  const soldOut  = isEventSoldOut(event.ticket_types ?? [])
  const category = event.event_categories
  const venue    = event.venues

  function handleConfirmTickets(items) {
    setShowTickets(false)
    navigate('/checkout', { state: { eventId: event.id, eventTitle: event.title, items } })
  }

  return (
    <PageLayout noPad>
      {/* Banner */}
      <div className="relative w-full h-56 sm:h-72 md:h-96 bg-surface-800 overflow-hidden">
        {(event.banner_url || event.cover_image_url) && (
          <img src={event.banner_url ?? event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-16 relative pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {category && <Badge label={category.name} color={category.color} className="mb-3" />}
            <h1 className="font-display text-4xl md:text-5xl text-ink-100 leading-tight mb-2">{event.title}</h1>
            {event.subtitle && <p className="text-xl text-ink-300 mb-6">{event.subtitle}</p>}

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <MetaBlock icon="📅" label="Fecha" value={`${formatDate(event.starts_at)} · ${formatTime(event.starts_at)}`} />
              {event.ends_at && <MetaBlock icon="🕐" label="Termina" value={formatTime(event.ends_at)} />}
              {event.doors_open_at && <MetaBlock icon="🚪" label="Puertas abren" value={formatTime(event.doors_open_at)} />}
              {venue && <MetaBlock icon="📍" label="Lugar" value={`${venue.name} — ${venue.address ?? venue.city}`} />}
            </div>

            {event.description && (
              <div>
                <h2 className="font-display text-2xl text-ink-100 mb-3">Acerca del evento</h2>
                <div className="prose prose-invert prose-sm max-w-none text-ink-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            )}
          </div>

          {/* Ticket panel */}
          <aside className="lg:w-80 shrink-0">
            <div className="rounded-2xl border border-ocv-cyan/25 bg-surface-800 p-5 sticky top-24">
              <h3 className="font-display text-2xl text-ink-100 mb-4">Boletos</h3>

              {event.is_free ? (
                <div className="mb-4 rounded-lg bg-ocv-green/10 border border-ocv-green/30 px-4 py-2 text-ocv-green font-bold text-center">
                  Entrada Libre
                </div>
              ) : (event.ticket_types ?? []).map((t) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-surface-600 last:border-0">
                  <span className="text-ink-300 text-sm">{t.name}</span>
                  <span className="text-ink-100 font-bold">{formatCurrency(t.price)}</span>
                </div>
              ))}

              <Button
                className="w-full mt-4"
                size="lg"
                disabled={soldOut}
                onClick={() => setShowTickets(true)}
              >
                {soldOut ? 'Evento Agotado' : event.is_free ? 'Registrarme' : 'Comprar Boletos'}
              </Button>

              {soldOut && (
                <p className="text-center text-xs text-red-400 mt-2">No hay boletos disponibles.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Ticket modal */}
      <Modal open={showTickets} onClose={() => setShowTickets(false)} title="Selecciona tus boletos">
        <div className="p-5">
          <TicketSelector
            ticketTypes={event.ticket_types ?? []}
            maxPerOrder={event.max_tickets_per_order ?? 10}
            onConfirm={handleConfirmTickets}
          />
        </div>
      </Modal>
    </PageLayout>
  )
}

function MetaBlock({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface-700 px-4 py-3">
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-ink-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-ink-200 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}
