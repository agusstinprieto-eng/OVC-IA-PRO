import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialButton } from '@/components/auth/SocialButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

const TABS = ['password', 'magic']

export default function Login() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from ?? '/'

  const [tab,      setTab]      = useState('password')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error,    setError]    = useState(null)
  const [magicSent, setMagicSent] = useState(false)

  async function handlePassword(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate(from, { replace: true })
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setMagicSent(true)
  }

  async function handleGoogle() {
    setOauthLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <AuthLayout title="Bienvenido de regreso" subtitle="Accede a tus eventos y boletos">
      <div className="space-y-6">

        {/* OAuth */}
        <SocialButton provider="google" onClick={handleGoogle} loading={oauthLoading} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-600" />
          <span className="text-xs text-ink-400 uppercase tracking-widest">o</span>
          <div className="flex-1 h-px bg-surface-600" />
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface-800 border border-surface-600 p-1 gap-1">
          {[['password', 'Contraseña'], ['magic', 'Magic Link']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(null); setMagicSent(false) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-ocv-cyan text-surface-950 shadow-glow-cyan'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Password form */}
        {tab === 'password' && (
          <form onSubmit={handlePassword} className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="text-right">
                <Link to="/auth/forgot-password" className="text-xs text-ocv-cyan hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        )}

        {/* Magic Link form */}
        {tab === 'magic' && !magicSent && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <p className="text-xs text-ink-400">
              Te enviaremos un enlace mágico para ingresar sin contraseña.
            </p>
            {error && <ErrorBox message={error} />}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Magic Link'}
            </Button>
          </form>
        )}

        {/* Magic Link sent */}
        {tab === 'magic' && magicSent && (
          <div className="rounded-xl border border-ocv-cyan/30 bg-ocv-cyan/5 px-5 py-6 text-center space-y-3">
            <p className="text-4xl">✉️</p>
            <p className="font-display text-2xl text-ocv-cyan">Revisa tu correo</p>
            <p className="text-sm text-ink-400">
              Enviamos un enlace de acceso a <span className="text-ink-200 font-medium">{email}</span>.<br />
              El enlace expira en 10 minutos.
            </p>
            <button
              type="button"
              onClick={() => setMagicSent(false)}
              className="text-xs text-ocv-cyan hover:underline"
            >
              Usar otro correo
            </button>
          </div>
        )}

        {/* Register link */}
        <p className="text-center text-sm text-ink-400">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/auth/registro" className="text-ocv-cyan hover:underline font-medium">
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function ErrorBox({ message }) {
  const FRIENDLY = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed':       'Confirma tu correo antes de ingresar.',
    'Too many requests':         'Demasiados intentos. Espera un momento.',
  }
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {FRIENDLY[message] ?? message}
    </div>
  )
}
