import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialButton } from '@/components/auth/SocialButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  function validate() {
    if (!form.fullName.trim())        return 'El nombre es requerido.'
    if (!form.email.trim())           return 'El correo es requerido.'
    if (form.password.length < 8)     return 'La contraseña debe tener al menos 8 caracteres.'
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErr = validate()
    if (validationErr) { setError(validationErr); return }

    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data:            { full_name: form.fullName, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  async function handleGoogle() {
    setOauthLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <AuthLayout title="¡Cuenta creada!" subtitle="Ya casi estás dentro">
        <div className="space-y-6 text-center">
          <div className="rounded-2xl border border-ocv-cyan/30 bg-ocv-cyan/5 px-6 py-8 space-y-4">
            <p className="text-5xl">🎉</p>
            <p className="font-display text-3xl text-ocv-cyan">Verifica tu correo</p>
            <p className="text-sm text-ink-400 leading-relaxed">
              Enviamos un enlace de confirmación a{' '}
              <span className="text-ink-200 font-medium">{form.email}</span>.<br />
              Haz clic en el enlace para activar tu cuenta.
            </p>
          </div>
          <Link to="/auth/login">
            <Button variant="secondary" className="w-full" size="lg">Ir al inicio de sesión</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Accede a todos los eventos de Torreón">
      <div className="space-y-6">

        {/* OAuth */}
        <SocialButton provider="google" onClick={handleGoogle} loading={oauthLoading} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-600" />
          <span className="text-xs text-ink-400 uppercase tracking-widest">o con correo</span>
          <div className="flex-1 h-px bg-surface-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo *"
            placeholder="María García"
            value={form.fullName}
            onChange={set('fullName')}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            label="Correo electrónico *"
            placeholder="tu@email.com"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
          <Input
            type="tel"
            label="Teléfono (opcional)"
            placeholder="+52 871 000 0000"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              label="Contraseña *"
              placeholder="Mín. 8 caracteres"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirmar contraseña *"
              placeholder="Repite tu contraseña"
              value={form.confirm}
              onChange={set('confirm')}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Password strength */}
          {form.password && <PasswordStrength password={form.password} />}

          <p className="text-xs text-ink-400 leading-relaxed">
            Al crear tu cuenta aceptas nuestros{' '}
            <Link to="/terminos" className="text-ocv-cyan hover:underline">Términos de Uso</Link>{' '}
            y{' '}
            <Link to="/privacidad" className="text-ocv-cyan hover:underline">Política de Privacidad</Link>.
          </p>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/auth/login" className="text-ocv-cyan hover:underline font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ caracteres', pass: password.length >= 8 },
    { label: 'Mayúscula',     pass: /[A-Z]/.test(password) },
    { label: 'Número',        pass: /\d/.test(password) },
    { label: 'Especial',      pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-500', 'bg-red-400', 'bg-ocv-yellow', 'bg-ocv-green']

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-surface-600'}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? 'text-ocv-green' : 'text-ink-400'}`}>
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
