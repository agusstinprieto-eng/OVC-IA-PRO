import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin',           label: 'Dashboard',  exact: true,
    icon: <GridIcon /> },
  { to: '/admin/eventos',   label: 'Eventos',
    icon: <CalendarIcon /> },
  { to: '/admin/ordenes',   label: 'Órdenes',
    icon: <ReceiptIcon /> },
  { to: '/admin/escaner',   label: 'Escáner QR',
    icon: <QrIcon /> },
]

export function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { profile, signOut }      = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-surface-950">

      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col border-r border-surface-700 bg-surface-900 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo area */}
        <div className="flex items-center h-16 px-4 border-b border-surface-700 gap-3 overflow-hidden">
          <Link to="/" className="shrink-0">
            <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
              <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
              <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
              <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
            </svg>
          </Link>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display text-base text-ocv-cyan tracking-widest leading-none">OCV</p>
              <p className="text-[9px] text-ink-400 uppercase tracking-widest">Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto shrink-0 text-ink-400 hover:text-ocv-cyan transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronIcon flipped={collapsed} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-ocv-cyan/15 text-ocv-cyan border border-ocv-cyan/30'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-surface-700'
              )}
            >
              <span className="shrink-0 w-5 h-5">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className={cn('px-3 py-4 border-t border-surface-700', collapsed && 'flex flex-col items-center gap-3')}>
          {!collapsed ? (
            <div>
              <p className="text-xs text-ink-400 truncate mb-0.5">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-[10px] text-ocv-yellow uppercase tracking-widest mb-3">{profile?.role}</p>
              <button onClick={handleSignOut} className="text-xs text-ink-400 hover:text-red-400 transition-colors">Cerrar sesión →</button>
              <p className="mt-4 text-[9px] text-ink-400/50">
                Diseñado por{' '}
                <a href="https://ia-agus.com" target="_blank" rel="noopener noreferrer" className="text-ocv-cyan/70 hover:text-ocv-cyan transition-colors">IA.AGUS</a>
              </p>
            </div>
          ) : (
            <button onClick={handleSignOut} className="text-ink-400 hover:text-red-400 transition-colors w-5 h-5">
              <LogoutIcon />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// ── Inline SVG icons (no dependency) ─────────────────────────────
function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  )
}
function QrIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zM11 13a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1zm2 0a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1zm2 0a1 1 0 011-1h.01a1 1 0 110 2H16a1 1 0 01-1-1zm-4 2a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1zm2 0a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1zm2 0a1 1 0 011-1h.01a1 1 0 110 2H16a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414-1.414L11.586 7H7a1 1 0 110-2h7a1 1 0 011 1v7a1 1 0 11-2 0V8.414z" clipRule="evenodd" />
    </svg>
  )
}
function ChevronIcon({ flipped }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={cn('w-4 h-4 transition-transform', flipped && 'rotate-180')}>
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}
