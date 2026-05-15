import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [ready,     setReady]     = useState(false)

  // Supabase setea la sesión al aterrizar desde el enlace de reset
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8)       { setError('Mínimo 8 caracteres.'); return }
    if (password !== confirm)       { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/auth/login', { state: { notice: 'Contraseña actualizada. Inicia sesión.' } })
  }

  if (!ready) {
    return (
      <AuthLayout title="Verificando enlace..." subtitle="">
        <div className="py-10 text-center text-ink-400 text-sm">
          Procesando tu enlace de recuperación...
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Nueva contraseña"
            placeholder="Mín. 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite tu nueva contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Strength indicator */}
          {password && (
            <div className="flex gap-1">
              {[0,1,2,3].map(i => {
                const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length
                const colors = ['bg-red-500','bg-red-400','bg-ocv-yellow','bg-ocv-green']
                return <div key={i} className={`flex-1 h-1 rounded-full ${i < score ? colors[score-1] : 'bg-surface-600'}`} />
              })}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
