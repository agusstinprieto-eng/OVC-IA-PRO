import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export default function Callback() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'ok' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleCallback() {
      // Supabase procesa automáticamente el hash fragment (#access_token=...)
      // al inicializar. Solo necesitamos leer la sesión resultante.
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      if (session) {
        // Determinar a dónde redirigir según el tipo de evento
        const type = params.get('type')
        if (type === 'recovery') {
          navigate('/auth/reset-password', { replace: true })
        } else {
          // Magic Link o confirmación de email → ir al dashboard o home
          navigate('/', { replace: true })
        }
      } else {
        // Supabase a veces necesita un tick para procesar el hash
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (event === 'SIGNED_IN' && sess) {
            subscription.unsubscribe()
            navigate('/', { replace: true })
          } else if (event === 'PASSWORD_RECOVERY') {
            subscription.unsubscribe()
            navigate('/auth/reset-password', { replace: true })
          }
        })

        // Timeout de seguridad
        setTimeout(() => {
          setStatus('error')
          setMessage('El enlace expiró o ya fue utilizado.')
        }, 6000)
      }
    }

    handleCallback()
  }, [navigate, params])

  return (
    <AuthLayout title="" subtitle="">
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-8 text-center">
        {status === 'loading' && (
          <>
            <Spinner className="w-12 h-12" />
            <div>
              <p className="font-display text-2xl text-ink-100 mb-1">Verificando...</p>
              <p className="text-sm text-ink-400">Procesando tu enlace de acceso.</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <p className="text-5xl">⚠️</p>
            <div>
              <p className="font-display text-2xl text-red-400 mb-2">Enlace inválido</p>
              <p className="text-sm text-ink-400 max-w-xs">{message}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/auth/login"><Button className="w-full">Iniciar sesión</Button></Link>
              <Link to="/auth/forgot-password"><Button variant="ghost" className="w-full">Solicitar nuevo enlace</Button></Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
