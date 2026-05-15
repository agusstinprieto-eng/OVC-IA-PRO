import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatShortDate, formatTime, formatCurrency } from '@/lib/utils'
import { getMinPrice, isEventSoldOut } from '@/services/eventsService'

export function EventCard({ event }) {
  const minPrice  = getMinPrice(event.ticket_types ?? [])
  const soldOut   = isEventSoldOut(event.ticket_types ?? [])
  const category  = event.event_categories
  const venue     = event.venues

  return (
    <Link to={`/eventos/${event.slug}`} className="block group focus-visible:outline-none">
      <Card hover className="h-full flex flex-col">

        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-700">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full cyber-grid-bg flex items-center justify-center">
              <span className="font-display text-4xl text-ocv-cyan/30 tracking-widest">OCV</span>
            </div>
          )}

          {/* Category badge overlay */}
          {category && (
            <div className="absolute top-3 left-3">
              <Badge label={category.name} color={category.color} />
            </div>
          )}

          {/* Status overlays */}
          {soldOut && (
            <div className="absolute inset-0 bg-surface-950/70 flex items-center justify-center">
              <span className="font-display text-2xl text-red-400 tracking-widest border border-red-400/50 px-4 py-1 rounded">AGOTADO</span>
            </div>
          )}
          {event.is_free && !soldOut && (
            <div className="absolute top-3 right-3">
              <span className="bg-ocv-green/20 text-ocv-green border border-ocv-green/40 px-2 py-0.5 rounded-full text-xs font-bold uppercase">Gratis</span>
            </div>
          )}
          {event.is_featured && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-ocv-yellow/20 text-ocv-yellow border border-ocv-yellow/40 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Destacado</span>
            </div>
          )}
        </div>

        {/* Body */}
        <CardBody className="flex flex-col flex-1 gap-2">
          {/* Date + Time */}
          <div className="flex items-center gap-2 text-xs text-ocv-cyan font-medium uppercase tracking-wider">
            <span>{formatShortDate(event.starts_at)}</span>
            <span className="text-surface-500">|</span>
            <span>{formatTime(event.starts_at)}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-xl text-ink-100 leading-tight group-hover:text-ocv-cyan transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Subtitle */}
          {event.subtitle && (
            <p className="text-sm text-ink-400 line-clamp-1">{event.subtitle}</p>
          )}

          {/* Venue */}
          {venue && (
            <p className="text-xs text-ink-400 flex items-center gap-1 mt-auto pt-2 border-t border-surface-600">
              <svg className="w-3.5 h-3.5 shrink-0 text-ocv-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {venue.name}, {venue.city}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-400">
              {event.is_free ? (
                <span className="text-ocv-green font-bold">Entrada libre</span>
              ) : minPrice > 0 ? (
                <>Desde <span className="text-ink-100 font-bold">{formatCurrency(minPrice)}</span></>
              ) : (
                <span className="text-ink-400">Ver precios</span>
              )}
            </span>
            <span className="text-xs text-ocv-cyan font-medium group-hover:underline">Ver más →</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
