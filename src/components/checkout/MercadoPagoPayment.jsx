import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

export function MercadoPagoPayment({ preferenceId, total, onBack }) {
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError]       = useState(null)
  const brickRef = useRef(null)
  const controllerRef = useRef(null)

  // Cargar SDK de MP dinámicamente
  useEffect(() => {
    if (window.MercadoPago) { setSdkReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = () => setSdkReady(true)
    script.onerror = () => setError('Error al cargar MercadoPago.')
    document.head.appendChild(script)
  }, [])

  // Montar Brick cuando el SDK esté listo y haya preferenceId
  useEffect(() => {
    if (!sdkReady || !preferenceId || !import.meta.env.VITE_MP_PUBLIC_KEY) return

    async function mountBrick() {
      try {
        const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-MX' })
        const bricks = mp.bricks()

        controllerRef.current = await bricks.create('wallet', 'mp-wallet-container', {
          initialization: { preferenceId },
          customization:  { texts: { valueProp: 'smart_option' } },
        })
      } catch (err) {
        setError('Error al inicializar MercadoPago.')
      }
    }

    mountBrick()

    return () => {
      controllerRef.current?.unmount?.()
    }
  }, [sdkReady, preferenceId])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">Paso 2 — MercadoPago</p>
        <h2 className="font-display text-3xl text-ink-100 tracking-wide">Pago seguro</h2>
        <p className="text-sm text-ink-400 mt-1">
          Total a pagar: <span className="text-ocv-cyan font-bold">{formatCurrency(total)}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {!sdkReady && !error && (
        <div className="flex items-center justify-center py-8 gap-3 text-ink-400 text-sm">
          <Spinner /> Cargando MercadoPago...
        </div>
      )}

      {/* MP Wallet Brick se monta aquí */}
      <div id="mp-wallet-container" ref={brickRef} className="min-h-[80px]" />

      <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onBack}>
        ← Cambiar método de pago
      </Button>
    </div>
  )
}
