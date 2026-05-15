import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useFeaturedEvents } from '@/hooks/useEvents'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from './SectionHeader'
import { formatShortDate, formatTime, formatCurrency } from '@/lib/utils'
import { getMinPrice } from '@/services/eventsService'
import { cn } from '@/lib/utils'

function EventSlide({ event }) {
  const category = event.event_categories
  const venue    = event.venues
  const minPrice = getMinPrice(event.ticket_types ?? [])

  return (
    <Link
      to={`/eventos/${event.slug}`}
      className="group flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden border border-surface-600 bg-surface-800 hover:border-ocv-cyan/50 hover:shadow-glow-cyan transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface-700">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full cyber-grid-bg flex items-center justify-center">
            <span className="font-display text-3xl text-ocv-cyan/20 tracking-widest">OCV</span>
          </div>
        )}
        {category && (
          <div className="absolute top-3 left-3">
            <Badge label={category.name} color={category.color} />
          </div>
        )}
        {event.is_free && (
          <div className="absolute top-3 right-3">
            <span className="bg-ocv-green/20 text-ocv-green border border-ocv-green/40 px-2 py-0.5 rounded-full text-xs font-bold">Gratis</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs text-ocv-cyan font-medium uppercase tracking-wider">
          {formatShortDate(event.starts_at)} · {formatTime(event.starts_at)}
        </p>
        <h3 className="font-display text-lg text-ink-100 group-hover:text-ocv-cyan transition-colors leading-tight line-clamp-2">
          {event.title}
        </h3>
        {venue && <p className="text-xs text-ink-400 truncate">📍 {venue.name}</p>}
        <div className="mt-auto pt-2 border-t border-surface-600 flex items-center justify-between">
          <span className="text-sm text-ink-400">
            {event.is_free ? <span className="text-ocv-green font-bold">Entrada libre</span>
              : minPrice > 0 ? <>Desde <span className="font-bold text-ink-200">{formatCurrency(minPrice)}</span></> : 'Ver precios'}
          </span>
          <span className="text-xs text-ocv-cyan">Ver más →</span>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedEventsStrip() {
  const { data: events = [], isLoading } = useFeaturedEvents()
  const scrollRef = useRef(null)

  function scroll(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="py-20 bg-surface-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            eyebrow="No te los pierdas"
            title="Eventos destacados"
          />
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-full border border-surface-600 text-ink-400 hover:border-ocv-cyan hover:text-ocv-cyan transition-all flex items-center justify-center"
              aria-label="Anterior"
            >‹</button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 rounded-full border border-surface-600 text-ink-400 hover:border-ocv-cyan hover:text-ocv-cyan transition-all flex items-center justify-center"
              aria-label="Siguiente"
            >›</button>
          </div>
        </div>

        {isLoading && (
          <div className="flex gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-72 h-72 rounded-2xl bg-surface-800 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="rounded-xl border border-surface-600 p-12 text-center text-ink-400">
            Próximamente nuevos eventos destacados.
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {events.map((event) => (
              <div key={event.id} className="snap-start">
                <EventSlide event={event} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/eventos">
            <Button variant="secondary" size="lg">Ver cartelera completa →</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
