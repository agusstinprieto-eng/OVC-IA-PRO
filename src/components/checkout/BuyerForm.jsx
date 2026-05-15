import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export function BuyerForm({ onNext }) {
  const { user, profile } = useAuth()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { fullName: '', email: '', phone: '' },
  })

  // Pre-fill si hay sesión
  useEffect(() => {
    if (profile?.full_name) setValue('fullName', profile.full_name)
    if (profile?.phone)     setValue('phone',    profile.phone)
    if (user?.email)        setValue('email',    user.email)
  }, [user, profile, setValue])

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Paso 1</p>
        <h2 className="font-display text-3xl text-ink-100 tracking-wide">Tus datos</h2>
        <p className="text-sm text-ink-400 mt-1">Los boletos se enviarán a este correo.</p>
      </div>

      <Input
        label="Nombre completo *"
        placeholder="María García"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName', { required: 'Requerido' })}
      />
      <Input
        type="email"
        label="Correo electrónico *"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Requerido',
          pattern:  { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
        })}
      />
      <Input
        type="tel"
        label="Teléfono (opcional)"
        placeholder="+52 871 000 0000"
        autoComplete="tel"
        {...register('phone')}
      />

      {!user && (
        <div className="rounded-lg border border-ocv-cyan/20 bg-ocv-cyan/5 px-4 py-3 text-xs text-ink-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/auth/login" className="text-ocv-cyan hover:underline">Inicia sesión</a>{' '}
          para guardar tus boletos.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full">
        Continuar al pago →
      </Button>
    </form>
  )
}
