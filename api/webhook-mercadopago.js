import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, data } = req.body ?? {}

  // Solo procesar notificaciones de pago
  if (type !== 'payment') return res.status(200).json({ received: true })

  const paymentId = data?.id
  if (!paymentId) return res.status(200).end()

  // Verificar estado con la API de MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) return res.status(200).end()

  const payment = await mpRes.json()
  const orderId = payment.external_reference

  if (!orderId) return res.status(200).json({ received: true })

  if (payment.status === 'approved') {
    // Reusar la lógica de confirmación (misma que Stripe)
    await confirmOrder(orderId, 'mercadopago', String(paymentId), payment)
  } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
    await supabase.from('payments').update({ status: 'failed', raw_payload: payment }).eq('provider_id', String(paymentId))
  }

  return res.status(200).json({ received: true })
}

async function confirmOrder(orderId, provider, providerId, rawPayload) {
  await supabase.from('payments').update({ status: 'succeeded', raw_payload: rawPayload }).eq('order_id', orderId).eq('provider', provider)

  await supabase.from('orders').update({ status: 'paid', payment_method: provider, payment_ref: providerId }).eq('id', orderId)

  const { data: order } = await supabase.from('orders').select('order_items(quantity, ticket_type_id, ticket_types(event_id))').eq('id', orderId).single()

  const ticketRows = []
  for (const item of order?.order_items ?? []) {
    for (let i = 0; i < item.quantity; i++) {
      ticketRows.push({ order_id: orderId, ticket_type_id: item.ticket_type_id, event_id: item.ticket_types?.event_id, status: 'active' })
    }
  }
  if (ticketRows.length) await supabase.from('tickets').insert(ticketRows)

  await supabase.functions.invoke('send-ticket-email', { body: { orderId } }).catch(() => {})
}
