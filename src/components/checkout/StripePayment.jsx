import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement, CardExpiryElement, CardCvcElement,
  useStripe, useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const ELEMENT_STYLE = {
  base: {
    color:           '#dce3e7',
    fontSize:        '15px',
    fontFamily:      '"aller", sans-serif',
    '::placeholder': { color: '#a1b0b6' },
  },
  invalid: { color: '#ef4444' },
}

function CardForm({ clientSecret, total, onSuccess, onBack }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardNumberElement) },
    })

    setLoading(false)
    if (stripeErr) { setError(stripeErr.message); return }
    if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Paso 2 — Stripe</p>
        <h2 className="font-display text-3xl text-ink-100 tracking-wide">Datos de tarjeta</h2>
      </div>

      <div className="space-y-3">
        {/* Card number */}
        <div className="space-y-1.5">
          <label className="text-sm text-ink-300 font-medium">Número de tarjeta</label>
          <div className="rounded-lg bg-surface-700 border border-surface-500 px-4 py-3 focus-within:border-ocv-cyan focus-within:ring-1 focus-within:ring-ocv-cyan/40 transition-colors">
            <CardNumberElement options={{ style: ELEMENT_STYLE, showIcon: true }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-ink-300 font-medium">Vencimiento</label>
            <div className="rounded-lg bg-surface-700 border border-surface-500 px-4 py-3 focus-within:border-ocv-cyan focus-within:ring-1 focus-within:ring-ocv-cyan/40 transition-colors">
              <CardExpiryElement options={{ style: ELEMENT_STYLE }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-ink-300 font-medium">CVC</label>
            <div className="rounded-lg bg-surface-700 border border-surface-500 px-4 py-3 focus-within:border-ocv-cyan focus-within:ring-1 focus-within:ring-ocv-cyan/40 transition-colors">
              <CardCvcElement options={{ style: ELEMENT_STYLE }} />
            </div>
          </div>
        </div>
      </div>

      {/* Lock badge */}
      <div className="flex items-center gap-2 text-xs text-ink-400">
        <svg className="w-4 h-4 text-ocv-cyan" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Pago seguro procesado por Stripe. No almacenamos datos de tarjeta.
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>← Atrás</Button>
        <Button type="submit" size="lg" className="flex-1" disabled={!stripe || loading}>
          {loading ? 'Procesando...' : `Pagar ${formatCurrency(total)}`}
        </Button>
      </div>
    </form>
  )
}

export function StripePayment({ clientSecret, total, onSuccess, onBack }) {
  if (!clientSecret) {
    return (
      <div className="py-10 text-center text-ink-400 text-sm">
        Preparando formulario de pago...
      </div>
    )
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
      <CardForm clientSecret={clientSecret} total={total} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  )
}
