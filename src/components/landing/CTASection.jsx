import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className="py-24 bg-surface-900 relative overflow-hidden">

      {/* Background grid + glow */}
      <div className="absolute inset-0 cyber-grid-bg opacity-50" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,172,209,0.08) 0%, transparent 65%)' }}
      />

      {/* Top divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocv-cyan/40 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">

        {/* OCV mark */}
        <div className="flex justify-center">
          <svg viewBox="0 0 36 36" fill="none" className="w-12 h-12 opacity-80">
            <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
            <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
            <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-ocv-cyan uppercase tracking-[0.25em] font-medium">Torreón te espera</p>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink-100 leading-none tracking-tight">
            Tu próximo evento <br />
            <span className="text-ocv-cyan text-glow-cyan">empieza aquí.</span>
          </h2>
          <p className="text-ink-400 text-lg max-w-lg mx-auto leading-relaxed">
            Organiza tu evento, compra tus boletos o simplemente descubre lo que Torreón tiene para ofrecerte.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/eventos">
            <Button size="xl" className="min-w-[220px]">
              Explorar Cartelera
            </Button>
          </Link>
          <Link to="/auth/registro">
            <Button variant="secondary" size="xl" className="min-w-[220px]">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>

        {/* Organizer CTA */}
        <div className="pt-4 flex items-center justify-center gap-2 text-sm text-ink-400">
          <span>¿Eres organizador?</span>
          <a href="mailto:info@torreonconquista.com" className="text-ocv-cyan hover:underline font-medium">
            Contáctanos →
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
          {[
            { icon: '🔒', text: 'Pagos 100% seguros' },
            { icon: '📱', text: 'Boletos en tu celular' },
            { icon: '⚡', text: 'Confirmación inmediata' },
            { icon: '🎫', text: 'Sin filas en la entrada' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-ink-400">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocv-cyan/30 to-transparent" />
    </section>
  )
}
