import { useState } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { EventCard } from './EventCard'
import { EventFilters } from './EventFilters'
import { PageSpinner } from '@/components/ui/Spinner'

export function EventList() {
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch]                 = useState('')

  const { data: events = [], isLoading, isError } = useEvents({
    categorySlug: activeCategory,
    search: search.length >= 2 ? search : undefined,
  })

  return (
    <div className="space-y-6">
      <EventFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        search={search}
        onSearchChange={setSearch}
      />

      {isLoading && <PageSpinner />}

      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          Error al cargar eventos. Intenta de nuevo.
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <div className="rounded-xl border border-surface-600 p-12 text-center">
          <p className="font-display text-3xl text-ink-400 mb-2">Sin resultados</p>
          <p className="text-sm text-ink-400">Prueba con otra categoría o término de búsqueda.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
