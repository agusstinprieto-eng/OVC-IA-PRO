import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Instrucciones de recuperación enviadas">
        <div className="space-y-6 text-center">
          <div className="rounded-2xl border border-ocv-cyan/30 bg-ocv-cyan/5 px-6 py-8 space-y-4">
            <p className="text-5xl">🔑</p>
            <p className="font-display text-2xl text-ocv-cyan">Enlace enviado</p>
            <p className="text-sm text-ink-400 leading-relaxed">
              Enviamos instrucciones para restablecer tu contraseña a{' '}
              <span className="text-ink-200 font-medium">{email}</span>.<br />
              El enlace expira en 60 minutos.
            </p>
            <p className="text-xs text-ink-400">¿No lo ves? Revisa tu carpeta de spam.</p>
          </div>
          <Link to="/auth/login">
            <Button variant="secondary" className="w-full" size="lg">Volver al inicio de sesión</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviamos un enlace a tu correo">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
        </form>
        <p className="text-center text-sm text-ink-400">
          <Link to="/auth/login" className="text-ocv-cyan hover:underline">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
