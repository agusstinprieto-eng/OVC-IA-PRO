import { useCategories } from '@/hooks/useEvents'
import { cn } from '@/lib/utils'

export function EventFilters({ activeCategory, onCategoryChange, search, onSearchChange }) {
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl bg-surface-800 border border-surface-600 pl-10 pr-4 py-2.5 text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-ocv-cyan focus:ring-1 focus:ring-ocv-cyan/30 transition-colors"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
            !activeCategory
              ? 'bg-ocv-cyan text-surface-950 border-ocv-cyan shadow-glow-cyan'
              : 'border-surface-500 text-ink-400 hover:border-ocv-cyan/50 hover:text-ink-200'
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug === activeCategory ? null : cat.slug)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              activeCategory === cat.slug
                ? 'text-surface-950 border-transparent font-bold'
                : 'border-surface-500 text-ink-400 hover:text-ink-200'
            )}
            style={activeCategory === cat.slug ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
