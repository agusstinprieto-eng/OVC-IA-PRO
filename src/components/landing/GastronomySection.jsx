import { SectionHeader } from './SectionHeader'

const DISHES = [
  { name: 'Discada Lagunera',     origin: 'Plato emblema',   emoji: '🥘', desc: 'Carne de res, puerco y chorizo en disco de arado. El sabor más auténtico de La Laguna.' },
  { name: 'Gorditas de Maíz',     origin: 'Tradición local', emoji: '🫔', desc: 'Masa de maíz rellena con guisados, frijoles o picadillo. Desayuno y antojo por igual.' },
  { name: 'Queso Menonita',       origin: 'Valle de Juárez', emoji: '🧀', desc: 'Queso artesanal de las colonias menonitas, suave y de sabor inigualable.' },
  { name: 'Durangensis (Vino)',   origin: 'La Laguna',       emoji: '🍷', desc: 'La región vitivinícola más activa del norte. Vinos premiados en competencias internacionales.' },
  { name: 'Machaca con Huevo',    origin: 'Norteña',         emoji: '🍳', desc: 'Carne seca deshebrada salteada con huevo y chile. El desayuno del norte por excelencia.' },
  { name: 'Cajeta de Leche',      origin: 'Dulce típico',    emoji: '🍮', desc: 'Dulce de leche cremoso, herencia de la ganadería lagunera. Perfecto con wafer o fruta.' },
]

export function GastronomySection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #171e23 50%, #0d1117 100%)' }}>

      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ffdc00, transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">

          {/* Left text */}
          <div className="lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-32">
            <SectionHeader
              eyebrow="Sabores de La Laguna"
              title="Gastronomía que enamora"
              subtitle="La cocina lagunera fusiona tradición norteña, influencia menonita y una creciente escena gourmet."
            />
            <div className="rounded-xl border border-ocv-yellow/20 bg-ocv-yellow/5 p-4">
              <p className="text-xs text-ocv-yellow uppercase tracking-widest font-medium mb-1">Dato curioso</p>
              <p className="text-sm text-ink-400 leading-relaxed">
                La Comarca Lagunera produce el <span className="text-ink-200 font-medium">40% de la leche</span> que se consume en México,
                dando origen a una rica tradición quesera y dulcera.
              </p>
            </div>
          </div>

          {/* Right grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DISHES.map((dish) => (
              <div
                key={dish.name}
                className="group flex items-start gap-4 rounded-xl border border-surface-600 bg-surface-800/50 p-4 hover:border-ocv-yellow/30 hover:bg-surface-800 transition-all duration-200"
              >
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {dish.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display text-base text-ink-100 group-hover:text-ocv-yellow transition-colors">
                      {dish.name}
                    </h4>
                    <span className="text-xs text-ink-400 border border-surface-500 px-1.5 py-0.5 rounded-full">
                      {dish.origin}
                    </span>
                  </div>
                  <p className="text-xs text-ink-400 leading-relaxed">{dish.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
