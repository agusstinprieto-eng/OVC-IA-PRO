import { useEffect, useRef, useState } from 'react'
import { SectionHeader } from './SectionHeader'
import { cn } from '@/lib/utils'

const VENUES = [
  { name: 'Centro de Convenciones',       capacity: '5,000', tag: 'Convenciones', desc: 'El recinto más grande de la región para congresos, exposiciones y eventos corporativos.' },
  { name: 'Auditorio Metropolitano',       capacity: '3,200', tag: 'Espectáculos',  desc: 'Espectáculos, conciertos y producciones de gran formato en el corazón de la ciudad.' },
  { name: 'Estadio Corona',               capacity: '30,000', tag: 'Deportes',     desc: 'Casa de los Guerreros del Santos Laguna. Fútbol y eventos masivos de talla mundial.' },
  { name: 'Hotel Barceló Torreón',        capacity: '1,200',  tag: 'Hospitalidad', desc: 'Centro de negocios con salones de lujo para eventos corporativos y bodas.' },
  { name: 'Fórum Torreón',               capacity: '8,000',  tag: 'Multiforo',    desc: 'Foro versátil para exposiciones, conciertos y eventos especiales en formato flexible.' },
  { name: 'Plaza Mayor',                  capacity: '12,000', tag: 'Aire libre',   desc: 'El espacio abierto más emblemático para festivales, ferias y eventos culturales.' },
]

function VenueCard({ venue, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'group rounded-2xl border border-surface-600 bg-surface-800/60 p-6 flex flex-col gap-3',
        'hover:border-ocv-cyan/40 hover:bg-surface-800 transition-all duration-300 cursor-default',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      )}
      style={{ transitionDelay: `${index * 60}ms`, transitionDuration: '600ms' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-ink-100 group-hover:text-ocv-cyan transition-colors leading-tight">
          {venue.name}
        </h3>
        <span className="shrink-0 text-xs border border-ocv-cyan/30 text-ocv-cyan/80 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
          {venue.tag}
        </span>
      </div>

      <p className="text-sm text-ink-400 leading-relaxed">{venue.desc}</p>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-surface-600">
        <svg className="w-4 h-4 text-ocv-cyan shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm text-ink-300">
          Hasta <span className="font-bold text-ocv-cyan">{venue.capacity}</span> personas
        </span>
      </div>
    </div>
  )
}

export function VenuesSection() {
  return (
    <section className="py-24 bg-surface-950 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 30%, rgba(0,172,209,0.05) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <SectionHeader
            eyebrow="Infraestructura de clase mundial"
            title="Recintos en Torreón"
            subtitle="Más de 28 recintos certificados para eventos de cualquier escala, desde reuniones ejecutivas hasta conciertos masivos."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VENUES.map((v, i) => (
            <VenueCard key={v.name} venue={v} index={i} />
          ))}
        </div>

        {/* Capacity total bar */}
        <div className="mt-12 rounded-2xl border border-ocv-cyan/20 bg-ocv-cyan/5 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-ocv-cyan text-glow-cyan">+70,000</p>
            <p className="text-sm text-ink-400 mt-0.5">Asientos disponibles en toda la ciudad</p>
          </div>
          <div className="h-px sm:h-12 w-full sm:w-px bg-ocv-cyan/20" />
          <div>
            <p className="font-display text-3xl text-ocv-yellow" style={{ textShadow: '0 0 10px rgba(255,220,0,0.5)' }}>
              4,800+
            </p>
            <p className="text-sm text-ink-400 mt-0.5">Habitaciones de hotel certificadas</p>
          </div>
          <div className="h-px sm:h-12 w-full sm:w-px bg-ocv-cyan/20" />
          <div>
            <p className="font-display text-3xl text-ocv-green" style={{ textShadow: '0 0 10px rgba(61,169,43,0.5)' }}>
              2 vuelos / día
            </p>
            <p className="text-sm text-ink-400 mt-0.5">Conexiones directas nacionales</p>
          </div>
        </div>
      </div>
    </section>
  )
}
