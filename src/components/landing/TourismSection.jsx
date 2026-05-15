import { useRef, useEffect, useState } from 'react'
import { SectionHeader } from './SectionHeader'
import { cn } from '@/lib/utils'

const ATTRACTIONS = [
  {
    id:    'cristo',
    name:  'Cristo de las Noas',
    desc:  'La estatua más alta de México, con 22 metros de altura y una panorámica inigualable de Torreón.',
    tag:   'Ícono',
    color: '#00aad1',
    icon:  '✝',
  },
  {
    id:    'tranvia',
    name:  'Recorrido en Tranvía',
    desc:  'Recorre el centro histórico a bordo del tranvía turístico y descubre la arquitectura porfiriana.',
    tag:   'Tour',
    color: '#ffdc00',
    icon:  '🚃',
  },
  {
    id:    'morelos',
    name:  'Paseo Morelos',
    desc:  'El corazón gastronómico y cultural de la ciudad. Restaurantes, museos y espectáculos al aire libre.',
    tag:   'Cultura',
    color: '#ff0294',
    icon:  '🎭',
  },
  {
    id:    'arocena',
    name:  'Museo Arocena',
    desc:  'Uno de los museos más importantes del norte de México con colecciones de arte e historia.',
    tag:   'Arte',
    color: '#3da92b',
    icon:  '🎨',
  },
  {
    id:    'bosque',
    name:  'Bosque Urbano',
    desc:  'El parque más grande del norte de México: ciclismo, senderismo y áreas de recreo para toda la familia.',
    tag:   'Naturaleza',
    color: '#3da92b',
    icon:  '🌳',
  },
  {
    id:    'zona',
    name:  'Zona Rosa',
    desc:  'Vida nocturna, gastronomía de altura y entretenimiento en el distrito más vibrante de la ciudad.',
    tag:   'Nightlife',
    color: '#ff0294',
    icon:  '🌆',
  },
]

function AttractionCard({ item, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const hex = item.color.replace('#', '')
  const r   = parseInt(hex.slice(0,2), 16)
  const g   = parseInt(hex.slice(2,4), 16)
  const b   = parseInt(hex.slice(4,6), 16)

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border bg-surface-800 p-6 flex flex-col gap-4 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{
        borderColor:       `rgba(${r},${g},${b},0.25)`,
        transitionDelay:   `${index * 80}ms`,
      }}
    >
      {/* Icon + tag */}
      <div className="flex items-center justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `rgba(${r},${g},${b},0.12)` }}
        >
          {item.icon}
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            color:           item.color,
            background:      `rgba(${r},${g},${b},0.12)`,
            border:          `1px solid rgba(${r},${g},${b},0.3)`,
          }}
        >
          {item.tag}
        </span>
      </div>

      {/* Text */}
      <div>
        <h3 className="font-display text-xl text-ink-100 mb-1.5">{item.name}</h3>
        <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
      </div>

      {/* Bottom accent */}
      <div
        className="h-0.5 w-12 rounded-full mt-auto"
        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
      />
    </div>
  )
}

export function TourismSection() {
  return (
    <section className="py-24 bg-surface-900 relative overflow-hidden">
      {/* Subtle radial */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 20% 60%, rgba(255,2,148,0.04) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <SectionHeader
            eyebrow="Descubre Torreón"
            title="Una ciudad que sorprende"
            subtitle="Desde íconos históricos hasta la vida nocturna más vibrante del norte. Torreón tiene todo para hacer de tu visita una experiencia memorable."
          />
          <p className="text-xs text-ink-400 uppercase tracking-widest lg:shrink-0">6 experiencias imperdibles</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATTRACTIONS.map((item, i) => (
            <AttractionCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
