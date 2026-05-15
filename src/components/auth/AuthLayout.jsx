import { Link } from 'react-router-dom'

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-surface-950">

      {/* Left panel — branding (desktop) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden border-r border-surface-700">
        {/* Grid background */}
        <div className="absolute inset-0 cyber-grid-bg opacity-60" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-950/80 to-ocv-cyan/5" />

        {/* Decorative OCV ribbon mark */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 opacity-10">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <rect x="10"  y="80"  width="140" height="40" rx="8" fill="#00aad1" transform="rotate(-30 80 100)" />
            <rect x="60"  y="80"  width="140" height="40" rx="8" fill="#ff0294" transform="rotate(-30 130 100)" />
            <rect x="35"  y="80"  width="140" height="40" rx="8" fill="#ffdc00" transform="rotate(-30 105 100)" />
          </svg>
        </div>

        {/* Top: logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 group w-fit">
            <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10">
              <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
              <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
              <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
            </svg>
            <div>
              <p className="font-display text-2xl text-ink-100 tracking-[0.25em] group-hover:text-ocv-cyan transition-colors">OCV</p>
              <p className="text-[10px] text-ink-400 uppercase tracking-[0.3em]">Torreón</p>
            </div>
          </Link>
        </div>

        {/* Middle: headline */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium">Ecosistema Digital</p>
          <h2 className="font-display text-5xl text-ink-100 leading-tight">
            Torreón en<br />
            <span className="text-glow-cyan text-ocv-cyan">un solo lugar.</span>
          </h2>
          <p className="text-ink-400 text-base max-w-xs leading-relaxed">
            Eventos, boletos, gastronomía y turismo. Todo conectado para ti.
          </p>
        </div>

        {/* Bottom: stats */}
        <div className="relative z-10 flex gap-8">
          {[['Eventos', '100+'], ['Recintos', '25+'], ['Visitantes', '50K+']].map(([label, val]) => (
            <div key={label}>
              <p className="font-display text-2xl text-ocv-cyan text-glow-cyan">{val}</p>
              <p className="text-xs text-ink-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10">

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 group">
          <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
            <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
            <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
            <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
          </svg>
          <span className="font-display text-xl text-ink-100 tracking-widest group-hover:text-ocv-cyan transition-colors">OCV Torreón</span>
        </Link>

        <div className="w-full max-w-md">
          {title && (
            <div className="mb-8">
              <h1 className="font-display text-4xl text-ink-100 tracking-wide">{title}</h1>
              {subtitle && <p className="text-ink-400 mt-1 text-sm">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
