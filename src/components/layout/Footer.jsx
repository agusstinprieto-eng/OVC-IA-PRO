import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-surface-600/50 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <p className="font-display text-2xl text-ocv-cyan tracking-widest mb-1">OCV TORREÓN</p>
            <p className="text-xs text-ink-400 uppercase tracking-widest mb-3">Oficina de Convenciones y Visitantes</p>
            <p className="text-sm text-ink-400 leading-relaxed">
              Boulevard Constitución 100-2 Pte<br />
              Torreón, Coahuila 27140<br />
              (871) 118 6845
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold text-ink-300 uppercase tracking-widest mb-3">Descubre</p>
            <ul className="space-y-2 text-sm text-ink-400">
              {[['Cartelera', '/eventos'], ['Recintos', '/recintos'], ['Gastronomía', '/gastronomia'], ['Hoteles', '/hoteles']].map(([l, t]) => (
                <li key={t}><Link to={t} className="hover:text-ocv-cyan transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-ink-300 uppercase tracking-widest mb-3">Boletos</p>
            <ul className="space-y-2 text-sm text-ink-400">
              {[['Mis Boletos', '/mis-boletos'], ['Cómo comprar', '/ayuda'], ['Política de reembolso', '/politicas'], ['Contacto', '/contacto']].map(([l, t]) => (
                <li key={t}><Link to={t} className="hover:text-ocv-cyan transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-bold text-ink-300 uppercase tracking-widest mb-3">Síguenos</p>
            <div className="flex gap-3">
              {[
                { label: 'Facebook',  href: 'https://facebook.com/torreon.ocv',    icon: 'f' },
                { label: 'Instagram', href: 'https://instagram.com/torreonocv',    icon: 'in' },
                { label: 'Twitter',   href: '#',                                   icon: 'x' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface-700 border border-surface-500 flex items-center justify-center text-xs font-bold text-ink-400 hover:text-ocv-cyan hover:border-ocv-cyan/50 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} OCV Torreón. Todos los derechos reservados.</p>
          <p>Desarrollado por <span className="text-ocv-cyan">McVill Digital</span></p>
        </div>
      </div>
    </footer>
  )
}
