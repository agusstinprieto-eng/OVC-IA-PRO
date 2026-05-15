import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe   = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Vercel: deshabilitar body parser para leer raw body (necesario para verificar firma)
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(typeof c === 'string' ? Buffer.from(c) : c))
    req.on('end',  () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig     = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ message: `Webhook signature inválida: ${err.message}` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi      = event.data.object
    const orderId = pi.metadata?.orderId
    if (!orderId) return res.status(200).end()

    await confirmOrder(orderId, 'stripe', pi.id, pi)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await supabase
      .from('payments')
      .update({ status: 'failed', raw_payload: pi })
      .eq('provider_id', pi.id)
  }

  return res.status(200).json({ received: true })
}

async function confirmOrder(orderId, provider, providerId, rawPayload) {
  // 1. Marcar pago como exitoso
  await supabase
    .from('payments')
    .update({ status: 'succeeded', raw_payload: rawPayload })
    .eq('order_id', orderId)
    .eq('provider', provider)

  // 2. Actualizar orden a paid (trigger en DB actualiza ticket quantities)
  await supabase
    .from('orders')
    .update({ status: 'paid', payment_method: provider, payment_ref: providerId })
    .eq('id', orderId)

  // 3. Generar boletos individuales
  const { data: order } = await supabase
    .from('orders')
    .select('order_items(quantity, ticket_type_id, ticket_types(event_id))')
    .eq('id', orderId)
    .single()

  const ticketRows = []
  for (const item of order?.order_items ?? []) {
    for (let i = 0; i < item.quantity; i++) {
      ticketRows.push({
        order_id:       orderId,
        ticket_type_id: item.ticket_type_id,
        event_id:       item.ticket_types?.event_id,
        status:         'active',
      })
    }
  }

  if (ticketRows.length) {
    await supabase.from('tickets').insert(ticketRows)
  }

  // 4. Encolar envío de email (Supabase Edge Function o servicio externo)
  await supabase.functions.invoke('send-ticket-email', { body: { orderId } }).catch(() => {})
}
