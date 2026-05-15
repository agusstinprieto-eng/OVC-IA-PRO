import { Link } from 'react-router-dom'
import { useFeaturedEvents } from '@/hooks/useEvents'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatShortDate, formatTime, formatCurrency } from '@/lib/utils'
import { getMinPrice } from '@/services/eventsService'
import { useState } from 'react'

export function EventHero() {
  const { data: events = [], isLoading } = useFeaturedEvents()
  const [current, setCurrent] = useState(0)

  if (isLoading || !events.length) return <HeroSkeleton />

  const event    = events[current]
  const category = event.event_categories
  const venue    = event.venues
  const minPrice = getMinPrice([])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl min-h-[420px] md:min-h-[520px] flex items-end">

      {/* Background image */}
      <div className="absolute inset-0">
        {event.banner_url || event.cover_image_url ? (
          <img
            src={event.banner_url ?? event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full cyber-grid-bg bg-surface-800" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative w-full px-6 pb-8 pt-16 md:px-10 md:pb-10">
        <div className="max-w-2xl">
          {category && (
            <Badge label={category.name} color={category.color} className="mb-3" />
          )}
          <h1 className="font-display text-4xl md:text-6xl text-ink-100 leading-tight mb-2 text-glow-cyan">
            {event.title}
          </h1>
          {event.subtitle && (
            <p className="text-ink-300 text-lg mb-4">{event.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-400 mb-6">
            <span className="flex items-center gap-1 text-ocv-cyan font-medium">
              📅 {formatShortDate(event.starts_at)} — {formatTime(event.starts_at)}
            </span>
            {venue && <span>📍 {venue.name}, {venue.city}</span>}
          </div>

          <div className="flex items-center gap-3">
            <Button as={Link} to={`/eventos/${event.slug}`} size="lg">
              Comprar Boletos
            </Button>
            <Button variant="secondary" size="lg" as={Link} to={`/eventos/${event.slug}`}>
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>

      {/* Dots navigator */}
      {events.length > 1 && (
        <div className="absolute bottom-5 right-6 flex gap-2">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-ocv-cyan w-5 shadow-glow-cyan' : 'bg-ink-400'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function HeroSkeleton() {
  return (
    <div className="relative rounded-2xl bg-surface-800 min-h-[420px] md:min-h-[520px] cyber-grid-bg animate-pulse flex items-end p-10">
      <div className="space-y-3 w-full max-w-lg">
        <div className="h-4 w-24 bg-surface-600 rounded-full" />
        <div className="h-10 w-3/4 bg-surface-600 rounded" />
        <div className="h-5 w-1/2 bg-surface-600 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-40 bg-surface-600 rounded-lg" />
          <div className="h-12 w-36 bg-surface-600 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
