import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Cartelera',  to: '/eventos'       },
  { label: 'Recintos',   to: '/recintos'      },
  { label: 'Turismo',    to: '/turismo'        },
  { label: 'Mis Boletos',to: '/mis-boletos'   },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut }  = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-600/60 bg-surface-900/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              {/* OCV geometric ribbon mark */}
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
                <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
                <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl text-ink-100 tracking-widest group-hover:text-ocv-cyan transition-colors">OCV</span>
              <span className="text-[10px] text-ink-400 uppercase tracking-[0.2em]">Torreón</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive ? 'text-ocv-cyan bg-ocv-cyan/10' : 'text-ink-300 hover:text-ink-100 hover:bg-surface-700'
                )}
              >
                {link.label}
              </NavLink>
            ))}
            {profile?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-ocv-yellow bg-ocv-yellow/10' : 'text-ocv-yellow/70 hover:text-ocv-yellow'
                )}
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-ink-400 max-w-[120px] truncate">{profile?.full_name ?? user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>Salir</Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost"     size="sm" onClick={() => navigate('/auth/login')}>Entrar</Button>
                <Button variant="primary"   size="sm" onClick={() => navigate('/auth/registro')}>Registro</Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-ink-300 hover:text-ocv-cyan transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
            >
              <span className={cn('block w-5 h-0.5 bg-current mb-1 transition-all', mobileOpen && 'rotate-45 translate-y-1.5')} />
              <span className={cn('block w-5 h-0.5 bg-current mb-1 transition-all', mobileOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-all', mobileOpen && '-rotate-45 -translate-y-1.5')} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-600 bg-surface-900 px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'text-ocv-cyan bg-ocv-cyan/10' : 'text-ink-300 hover:text-ink-100 hover:bg-surface-700'
              )}
            >
              {link.label}
            </NavLink>
          ))}
          {!user ? (
            <div className="pt-2 flex gap-2">
              <Button variant="ghost"   size="sm" className="flex-1" onClick={() => { navigate('/auth/login');   setMobileOpen(false) }}>Entrar</Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={() => { navigate('/auth/registro'); setMobileOpen(false) }}>Registro</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={handleSignOut}>Cerrar sesión</Button>
          )}
        </div>
      )}
    </header>
  )
}
