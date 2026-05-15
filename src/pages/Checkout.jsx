import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckoutSteps }          from '@/components/checkout/CheckoutSteps'
import { OrderSummary }           from '@/components/checkout/OrderSummary'
import { BuyerForm }              from '@/components/checkout/BuyerForm'
import { PaymentMethodSelector }  from '@/components/checkout/PaymentMethodSelector'
import { StripePayment }          from '@/components/checkout/StripePayment'
import { MercadoPagoPayment }     from '@/components/checkout/MercadoPagoPayment'
import { Button } from '@/components/ui/Button'
import { createOrder } from '@/services/ticketsService'
import { createStripePaymentIntent, createMercadoPagoPreference } from '@/services/paymentsService'

// step keys: 'info' → 'method' → 'stripe' | 'mp' → 'confirm'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()

  const { eventId, eventTitle, eventDate, eventVenue, coverUrl, items } = location.state ?? {}

  const [step,           setStep]           = useState('info')
  const [buyer,          setBuyer]          = useState(null)
  const [order,          setOrder]          = useState(null)
  const [paymentMethod,  setPaymentMethod]  = useState(null)
  const [stripeSecret,   setStripeSecret]   = useState(null)
  const [mpPreferenceId, setMpPreferenceId] = useState(null)
  const [methodLoading,  setMethodLoading]  = useState(false)
  const [orderLoading,   setOrderLoading]   = useState(false)
  const [error,          setError]          = useState(null)

  const total = items?.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0
  const fees  = parseFloat((total * 0.05).toFixed(2))
  const grand = total + fees

  // Guard: si no hay items, volver a eventos
  useEffect(() => {
    if (!items?.length) navigate('/eventos', { replace: true })
  }, [items, navigate])

  // ── Step 1: buyer info submitted → crear orden en Supabase ──
  async function handleBuyerNext(buyerData) {
    setOrderLoading(true)
    setError(null)
    try {
      const createdOrder = await createOrder({
        buyerEmail: buyerData.email,
        buyerName:  buyerData.fullName,
        buyerPhone: buyerData.phone,
        items,
      })
      setBuyer(buyerData)
      setOrder(createdOrder)
      setStep('method')
    } catch (err) {
      setError(`Error al reservar tu orden: ${err.message}`)
    } finally {
      setOrderLoading(false)
    }
  }

  // ── Step 2: método seleccionado → obtener credencial de pago ──
  async function handleMethodContinue() {
    if (!paymentMethod || !order) return
    setMethodLoading(true)
    setError(null)
    try {
      if (paymentMethod === 'stripe') {
        const { clientSecret } = await createStripePaymentIntent(order.id)
        setStripeSecret(clientSecret)
        setStep('stripe')
      } else {
        const { preferenceId } = await createMercadoPagoPreference(order.id)
        setMpPreferenceId(preferenceId)
        setStep('mp')
      }
    } catch (err) {
      setError(`Error al preparar el pago: ${err.message}`)
    } finally {
      setMethodLoading(false)
    }
  }

  // ── Pago exitoso → redirigir a confirmación ──
  function handlePaymentSuccess(providerRef) {
    navigate(`/checkout/confirmacion/${order.id}`, {
      state: { providerRef },
      replace: true,
    })
  }

  if (!items?.length) return null

  const stepUi = step === 'stripe' || step === 'mp' ? 'payment' : step === 'confirm' ? 'confirm' : step === 'method' ? 'payment' : 'info'

  return (
    <div className="min-h-screen bg-surface-950 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to={`/eventos`} className="text-sm text-ink-400 hover:text-ocv-cyan transition-colors">
            ← Volver
          </Link>
          <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
            <rect x="2"  y="14" width="22" height="8" rx="2" fill="#00aad1" transform="rotate(-30 13 18)" />
            <rect x="12" y="14" width="22" height="8" rx="2" fill="#ff0294" transform="rotate(-30 23 18)" opacity="0.8" />
            <rect x="7"  y="14" width="22" height="8" rx="2" fill="#ffdc00" transform="rotate(-30 18 18)" opacity="0.6" />
          </svg>
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-10">
          <CheckoutSteps current={stepUi} />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400 flex items-center gap-3">
            <span className="text-xl">⚠</span>
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 text-lg">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* Form panel */}
          <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6 sm:p-8">

            {/* Loading overlay for order creation */}
            {orderLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-ocv-cyan border-t-transparent animate-spin" />
                <p className="text-ink-400 text-sm">Reservando tu orden...</p>
              </div>
            )}

            {!orderLoading && step === 'info' && (
              <BuyerForm onNext={handleBuyerNext} />
            )}

            {!orderLoading && step === 'method' && (
              <PaymentMethodSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                onBack={() => setStep('info')}
                onContinue={handleMethodContinue}
                total={grand}
                loading={methodLoading}
              />
            )}

            {step === 'stripe' && (
              <StripePayment
                clientSecret={stripeSecret}
                total={grand}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep('method')}
              />
            )}

            {step === 'mp' && (
              <MercadoPagoPayment
                preferenceId={mpPreferenceId}
                total={grand}
                onBack={() => setStep('method')}
              />
            )}
          </div>

          {/* Summary sidebar */}
          <OrderSummary
            items={items}
            eventTitle={eventTitle}
            eventDate={eventDate}
            eventVenue={eventVenue}
            coverUrl={coverUrl}
          />
        </div>
      </div>
    </div>
  )
}
