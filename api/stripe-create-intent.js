import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId } = req.body ?? {}
  if (!orderId) return res.status(400).json({ message: 'orderId requerido' })

  // Obtener la orden
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, total, currency, buyer_email, buyer_name, status')
    .eq('id', orderId)
    .single()

  if (error || !order)            return res.status(404).json({ message: 'Orden no encontrada' })
  if (order.status === 'paid')    return res.status(400).json({ message: 'Orden ya pagada' })
  if (order.status === 'expired') return res.status(400).json({ message: 'Orden expirada' })

  const amountCents = Math.round(Number(order.total) * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountCents,
    currency: order.currency?.toLowerCase() ?? 'mxn',
    metadata: { orderId: order.id },
    receipt_email: order.buyer_email,
    description:   `OCV Torreón — Orden ${orderId}`,
  })

  // Guardar referencia en payments
  await supabase.from('payments').insert({
    order_id:    orderId,
    provider:    'stripe',
    provider_id: paymentIntent.id,
    amount:      order.total,
    currency:    order.currency ?? 'MXN',
    status:      'pending',
    raw_payload: paymentIntent,
  })

  return res.status(200).json({ clientSecret: paymentIntent.client_secret })
}
