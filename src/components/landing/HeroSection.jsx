import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

// Palabras que rotan en el typewriter
const WORDS = ['Convenciones.', 'Conciertos.', 'Gastronomía.', 'Cultura.', 'Negocios.', 'Torreón.']

export function HeroSection() {
  const [wordIdx,  setWordIdx]  = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting,  setDeleting]  = useState(false)
  const timeout = useRef(null)

  useEffect(() => {
    const current = WORDS[wordIdx]

    if (!deleting && displayed.length < current.length) {
      timeout.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === current.length) {
      timeout.current = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && displayed.length > 0) {
      timeout.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % WORDS.length)
    }

    return () => clearTimeout(timeout.current)
  }, [displayed, deleting, wordIdx])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* ── Background layers ───────────────────────────── */}
      <div className="absolute inset-0 bg-surface-950" />

      {/* Animated cyber grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-70" />

      {/* Radial glow centre */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,172,209,0.08) 0%, transparent 70%)' }}
      />

      {/* OCV ribbon watermark */}
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] opacity-[0.04] pointer-events-none select-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <rect x="10"  y="80"  width="140" height="40" rx="8" fill="#00aad1" transform="rotate(-30 80 100)" />
          <rect x="60"  y="80"  width="140" height="40" rx="8" fill="#ff0294" transform="rotate(-30 130 100)" />
          <rect x="35"  y="80"  width="140" height="40" rx="8" fill="#ffdc00" transform="rotate(-30 105 100)" />
        </svg>
      </div>

      {/* Diagonal accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ocv-cyan to-transparent opacity-60" />

      {/* ── Content ─────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 text-center space-y-8 pt-20 pb-32">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-ocv-cyan/30 bg-ocv-cyan/5 px-5 py-1.5 text-xs text-ocv-cyan uppercase tracking-widest font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-ocv-cyan animate-pulse" />
          Oficina de Convenciones y Visitantes — Torreón
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-ink-100 leading-none tracking-tight">
            Torreón es
          </h1>
          <div className="font-display text-6xl sm:text-7xl md:text-8xl leading-none tracking-tight min-h-[1.1em] flex items-center justify-center">
            <span className="text-ocv-cyan text-glow-cyan">{displayed}</span>
            <span className="w-1 h-[0.8em] bg-ocv-cyan ml-1 animate-pulse inline-block" />
          </div>
        </div>

        <p className="text-ink-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          La ciudad más dinámica del norte de México. Eventos, recintos de clase mundial
          y experiencias únicas te esperan.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/eventos">
            <Button size="xl" className="min-w-[200px]">
              Ver Cartelera
            </Button>
          </Link>
          <Link to="/auth/registro">
            <Button variant="secondary" size="xl" className="min-w-[200px]">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 opacity-40 pt-8">
          <span className="text-xs text-ink-400 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-ink-400 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-ink-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
